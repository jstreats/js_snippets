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
