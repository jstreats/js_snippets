-- Create the org_details table
CREATE TABLE IF NOT EXISTS org_details (
    org_id  BIGINT PRIMARY KEY DEFAULT (floor(extract(epoch from clock_timestamp()) * 1000) - 1704067200000),
    org_name VARCHAR(50) NOT NULL,
    level VARCHAR(50) CHECK (level IN ('gbgf', 'sl', 'org level 8')),
    parent_org_id BIGINT,
    org_position_ui INT DEFAULT 0,
    nick_name VARCHAR(50),
    last_update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (parent_org_id) REFERENCES org_details (org_id)
);

-- Create the metric_details table
CREATE TABLE IF NOT EXISTS metric_details (
    metric_id BIGINT PRIMARY KEY DEFAULT (floor(extract(epoch from clock_timestamp()) * 1000) - 1704067200000),
    parent_metric_id BIGINT,
    metric_name VARCHAR(255) NOT NULL,
    precision INT DEFAULT 2,
    is_percentage BOOLEAN DEFAULT FALSE,
    description TEXT,
    valid_dimensions TEXT[] NOT NULL DEFAULT [], -- Array of strings
    rounding_logic VARCHAR(5) DEFAULT 'ROUND',
    dmd_api_dimensions_measures JSONB DEFAULT '{}'::jsonb,
    data_source VARCHAR(255) DEFAULT 'DMD_API',
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (parent_metric_id) REFERENCES metric_details (metric_id)
);

-- Create the metric_values table
CREATE TABLE IF NOT EXISTS metric_values (
    org_id BIGINT NOT NULL,
    metric_id BIGINT NOT NULL,
    month_year DATE NOT NULL,
    value NUMERIC NOT NULL,
    last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dimensions JSONB NOT NULL, -- Storing JSON data
    value_type VARCHAR(50) CHECK (value_type IN ('actual', 'baseline', 'okr', 'target')),
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (org_id) REFERENCES org_details (org_id),
    FOREIGN KEY (metric_id) REFERENCES metric_details (metric_id)
);

-- Create the validate_dimensions function
CREATE OR REPLACE FUNCTION validate_dimensions()
RETURNS TRIGGER AS $$
DECLARE
    valid_keys TEXT[];
    dimension_keys TEXT[];
    invalid_keys TEXT[];
BEGIN
    -- Get the valid dimensions for the metric
    SELECT valid_dimensions INTO valid_keys
    FROM metric_details
    WHERE metric_id = NEW.metric_id;

    -- Extract the keys from the dimensions JSONB
    SELECT array(SELECT jsonb_object_keys(NEW.dimensions)) INTO dimension_keys;

    -- Check for invalid keys
    SELECT array(SELECT unnest(dimension_keys) EXCEPT SELECT unnest(valid_keys)) INTO invalid_keys;

    -- Raise an exception if there are invalid keys
    IF array_length(invalid_keys, 1) > 0 THEN
        RAISE EXCEPTION 'Invalid dimension keys: %', invalid_keys;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the validate_dimensions trigger
CREATE TRIGGER validate_dimensions_trigger
BEFORE INSERT OR UPDATE ON metric_values
FOR EACH ROW
EXECUTE FUNCTION validate_dimensions();



CREATE INDEX idx_org_details_parent_org_id ON org_details(parent_org_id);
CREATE INDEX idx_metric_details_parent_metric_id ON metric_details(parent_metric_id);

CREATE INDEX idx_metric_values_org_id ON metric_values(org_id);
CREATE INDEX idx_metric_values_metric_id ON metric_values(metric_id);












async function fetchData() {
  const url = 'https://qsctoreporting.uk.hsbc:7000/DMD/table?responseDataFormat=keyValue';
  const requestBody = {
    dimensionList: ["gbgf", "sl", "org level 8"],
    measureList: [],
    selections: [
      {
        FieldName: "Year",
        Values: [2024],
        fieldType: "N"
      }
    ]
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from DMD API:', error);
    throw error;
  }
}

async function insertOrUpdateOrgDetails(org, level, parentOrgId = null) {
  const queryCheckExistence = `
    SELECT org_id, parent_org_id FROM org_details WHERE org_name = $1 AND level = $2 AND soft_deleted = false;
  `;
  const queryInsert = `
    INSERT INTO org_details (org_name, level, parent_org_id)
    VALUES ($1, $2, $3)
    RETURNING org_id;
  `;
  const queryUpdateParent = `
    UPDATE org_details SET parent_org_id = $1 WHERE org_id = $2;
  `;

  const res = await client.query(queryCheckExistence, [org, level]);
  
  if (res.rows.length > 0) {
    const { org_id, parent_org_id } = res.rows[0];
    if (parent_org_id !== parentOrgId) {
      console.log(`Parent of ${level} '${org}' has changed.`);
      await client.query(queryUpdateParent, [parentOrgId, org_id]);
    }
    return org_id;
  } else {
    const resInsert = await client.query(queryInsert, [org, level, parentOrgId]);
    return resInsert.rows[0].org_id;
  }
}

async function processOrgDetails(data) {
  for (const row of data) {
    const { gbgf, sl, org_level_8 } = row;

    const gbgfId = await insertOrUpdateOrgDetails(gbgf, 'gbgf');
    const slId = await insertOrUpdateOrgDetails(sl, 'sl', gbgfId);
    await insertOrUpdateOrgDetails(org_level_8, 'org level 8', slId);
  }
}

async function main() {
  await client.connect();

  try {
    const data = await fetchData();
    await processOrgDetails(data);
  } catch (error) {
    console.error('Error processing data:', error);
  } finally {
    await client.end();
  }
}

main();










___________________________________________________________________________________________________________________________________________
app.put('/update-nicknames', async (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates)) {
        return res.status(400).send({ error: 'Invalid input format. Expected an array of updates.' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const updatePromises = updates.map(update => {
            const { org_id, nick_name } = update;
            if (!org_id || !nick_name) {
                throw new Error('Invalid input data. Each update must contain org_id and nick_name.');
            }

            const query = 'UPDATE org_details SET nick_name = $1, last_update_date = CURRENT_TIMESTAMP WHERE org_id = $2';
            return client.query(query, [nick_name, org_id]);
        });

        await Promise.all(updatePromises);
        await client.query('COMMIT');
        res.status(200).send({ message: 'Nicknames updated successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).send({ error: error.message });
    } finally {
        client.release();
    }
});



// API endpoint to get list of month_year
app.post('/month-years', async (req, res) => {
  const { org_ids, metric_ids } = req.body;

  // Function to validate and sanitize input
  const validateAndSanitizeInput = (input) => {
    if (!Array.isArray(input)) {
      throw new Error('Invalid input');
    }
    return input.map((item) => {
      if (typeof item !== 'number') {
        throw new Error('Invalid input');
      }
      return item;
    });
  };

  try {
    // Validate and sanitize inputs
    const validOrgIds = org_ids ? validateAndSanitizeInput(org_ids) : [];
    const validMetricIds = metric_ids ? validateAndSanitizeInput(metric_ids) : [];

    // Get the current month and year, set to the first day of the current month
    const currentMonthYear = new Date();
    currentMonthYear.setDate(1);

    // Base query
    let query = `
      SELECT DISTINCT month_year 
      FROM metric_values 
      WHERE month_year > $1
    `;

    // Parameters for the query
    const queryParams = [currentMonthYear];
    let paramIndex = 2;

    // Add conditions for org_ids if provided
    if (validOrgIds.length > 0) {
      query += ` AND org_id IN (${validOrgIds.map((_, i) => `$${paramIndex++}`).join(', ')})`;
      queryParams.push(...validOrgIds);
    }

    // Add conditions for metric_ids if provided
    if (validMetricIds.length > 0) {
      query += ` AND metric_id IN (${validMetricIds.map((_, i) => `$${paramIndex++}`).join(', ')})`;
      queryParams.push(...validMetricIds);
    }

    // Finalize the query with ordering
    query += ' ORDER BY month_year ASC';

    // Execute the query
    const result = await pool.query(query, queryParams);

    // Send the result back to the client
    res.json(result.rows.map((row) => row.month_year));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



src/config.js
const dbConfig = {
  user: 'AutoQlik',
  host: 'localhost',
  database: 'CXODashboard_db_dev',
  password: 'AutoClick',
  port: 4432,
};

const cacheConfig = {
  stdTTL: 100, // Time to live in seconds
  checkperiod: 120, // Cache cleanup period in seconds
};

module.exports = { dbConfig, cacheConfig };


src/cache.js
const NodeCache = require('node-cache');
const { cacheConfig } = require('./config');

const cache = new NodeCache(cacheConfig);

const getCachedResponse = (key) => {
  return cache.get(key);
};

const setCachedResponse = (key, value) => {
  cache.set(key, value);
};

const clearCache = () => {
  cache.flushAll();
};

module.exports = { getCachedResponse, setCachedResponse, clearCache };


src/database.js
const { Pool } = require('pg');
const { dbConfig } = require('./config');
const { getCachedResponse, setCachedResponse } = require('./cache');

const pool = new Pool(dbConfig);

const originalQuery = pool.query.bind(pool);

pool.query = async (text, params) => {
  if (text.trim().toUpperCase().startsWith('SELECT')) {
    const cacheKey = `${text}_${JSON.stringify(params)}`;
    const cachedData = getCachedResponse(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for query: ${text}`);
      return { rows: cachedData };
    }

    console.log(`Cache miss for query: ${text}`);
    const result = await originalQuery(text, params);
    setCachedResponse(cacheKey, result.rows);
    return result;
  }

  return originalQuery(text, params);
};

module.exports = { pool };


src/routes.js
const express = require('express');
const { pool } = require('./database');
const { clearCache } = require('./cache');

const router = express.Router();

router.get('/endpoint1', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM table1');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/endpoint2', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM table2');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/clear-cache', (req, res) => {
  clearCache();
  res.json({ message: 'Cache cleared successfully' });
});

module.exports = router;

