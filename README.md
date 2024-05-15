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


