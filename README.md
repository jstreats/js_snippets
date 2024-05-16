let parentId = null;  // Default parent ID is null

        // Check and insert parent if not 'multi_gbgf' and parent name is provided
        if (level !== 'multi_gbgf' && record.parent_name) {
            const parentCheckQuery = `
                SELECT id FROM organizational_structure
                WHERE name = $1 AND level_type = $2;
            `;
            const parentType = level === 'gbgf' ? 'multi_gbgf' : 'gbgf'; // Determine parent level based on current level
            const parentCheckRes = await pool.query(parentCheckQuery, [record.parent_name, parentType]);

            if (parentCheckRes.rowCount === 0) {
                const insertParentQuery = `
                    INSERT INTO organizational_structure (name, parent_id, level_type)
                    VALUES ($1, NULL, $2)
                    RETURNING id;
                `;
                const parentInsertRes = await pool.query(insertParentQuery, [record.parent_name, parentType]);
                parentId = parentInsertRes.rows[0].id;
            } else {
                parentId = parentCheckRes.rows[0].id;
            }
        }

        // Check if the current node exists
        const checkQuery = `
            SELECT id FROM organizational_structure
            WHERE name = $1 AND level_type = $2 AND parent_id = $3;
        `;
        const checkRes = await pool.query(checkQuery, [record.name, level, parentId]);

        // Insert new node if not exists
        if (checkRes.rowCount === 0) {
            const insertStructureQuery = `
                INSERT INTO organizational_structure (name, parent_id, level_type)
                VALUES ($1, $2, $3)
                RETURNING id;
            `;
            const structureRes = await pool.query(insertStructureQuery, [record.name, parentId, level]);
            record.level_id = structureRes.rows[0].id; // Update level_id with newly created id
        } else {
            record.level_id = checkRes.rows[0].id; // Use existing id
        }

        // Insert each record in the metrics table
        const insertMetricsQuery = `
            INSERT INTO metrics (metric_name, value, date_of_reporting, month_year, level, level_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING;
        `;
        await pool.query(insertMetricsQuery, [
            record.metric_name,
            record.value,
            cut,
            record.month_year,
            level,
            record.level_id
        ]);


CREATE TABLE IF NOT EXISTS organizational_structure (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER,
    level_type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255),
    value INT,
    date_of_reporting DATE,
    month_year VARCHAR(7),
    level VARCHAR(50),
    level_id INTEGER
);


npm init -y
npm install express pg


const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'AutoQlik',
    host: 'localhost',
    database: 'CXODashboard_db_dev',
    password: 'AutoClick',
    port: 4432
});

app.use(express.json());

// Define API endpoints here...

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


// Fetch Organizational Structure
app.get('/org-structure', async (req, res) => {
    const query = `
        WITH RECURSIVE structure AS (
            SELECT id, name, parent_id, level_type FROM organizational_structure WHERE parent_id IS NULL
            UNION ALL
            SELECT o.id, o.name, o.parent_id, o.level_type FROM organizational_structure o
            INNER JOIN structure s ON s.id = o.parent_id
        )
        SELECT * FROM structure;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
});

// Fetch Child Nodes
app.get('/child-nodes', async (req, res) => {
    const { parentName, level } = req.query;
    const childLevel = level === 'multi_gbgf' ? 'gbgf' : 'service_line';
    const query = `
        SELECT o.id, o.name FROM organizational_structure o
        JOIN organizational_structure p ON p.id = o.parent_id
        WHERE p.name = $1 AND o.level_type = $2;
    `;
    const { rows } = await pool.query(query, [parentName, childLevel]);
    res.json(rows);
});

// Fetch Metrics Based on Dimensions
app.get('/metrics', async (req, res) => {
    const { metricName, reporting_cut, monthYearRange, level, levelName } = req.query;
    const monthYears = monthYearRange.split(','); // Assuming '2023-01,2023-02'
    const values = monthYears.map(monthYear => {
        return pool.query(`
            SELECT month_year, COALESCE(SUM(value), 0) AS value
            FROM metrics
            WHERE metric_name = $1 AND month_year = $2 AND level = $3 AND level_id = (
                SELECT id FROM organizational_structure WHERE name = $4 AND level_type = $3
            )
            GROUP BY month_year
        `, [metricName, monthYear, level, levelName]);
    });
    Promise.all(values).then(results => res.json(results.map(r => r.rows[0])));
});


const axios = require('axios');

// Endpoint to load data into the DB
app.post('/load-data', async (req, res) => {
    try {
        // Fetch reporting cuts from the external API
        const reportingCutsResponse = await axios.get('http://externalapi.com/reporting-cuts');
        const reportingCuts = reportingCutsResponse.data;

        for (let cut of reportingCuts) {
            // Check if data for this reporting cut is already in the DB
            const existsQuery = 'SELECT EXISTS (SELECT 1 FROM metrics WHERE date_of_reporting = $1)';
            const { rows } = await pool.query(existsQuery, [cut]);

            if (!rows[0].exists) {
                // If data is not present, fetch data for each level
                const levels = ['multi_gbgf', 'gbgf', 'service_line'];
                for (let level of levels) {
                    const levelDataResponse = await axios.get(`http://anotherapi.com/data/${level}/${cut}`);
                    const records = levelDataResponse.data.data; // assuming the response has a "data" key containing records

                    for (let record of records) {
                        // Insert each record in the metrics table
                        const insertMetricsQuery = `
                            INSERT INTO metrics (metric_name, value, date_of_reporting, month_year, level, level_id)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT DO NOTHING;
                        `;
                        await pool.query(insertMetricsQuery, [
                            record.metric_name,
                            record.value,
                            cut,
                            record.month_year,
                            level,
                            record.level_id
                        ]);

                        // Check and insert new GBGF or SL
                        if (level !== 'multi_gbgf') {
                            const insertStructureQuery = `
                                INSERT INTO organizational_structure (name, parent_id, level_type)
                                VALUES ($1, $2, $3)
                                ON CONFLICT (name) DO NOTHING;
                            `;
                            await pool.query(insertStructureQuery, [
                                record.name,
                                record.parent_id,
                                level
                            ]);
                        }
                    }
                }
            }
        }

        res.status(200).send('Data loading completed successfully.');
    } catch (error) {
        console.error('Failed to load data:', error);
        res.status(500).send('Failed to load data.');
    }
});
