INSERT INTO org_details (org_name, level) VALUES
('Wealth & Personal Banking IT', 'gbgf'),
('Retail Banking & StrategyTech', 'sl'),
('GPBW and AMG IT', 'sl'),
('Enterprise Technology', 'gbgf'),
('Cross Functions Technology', 'sl'),
('Finance Technology', 'sl');


-- Assume org_id is assigned sequentially as 1 to 6
INSERT INTO org_hierarchy (org_id, parent_org_id) VALUES
(2, 1),  -- Retail Banking under Wealth & Personal Banking
(3, 1),  -- GPBW and AMG under Wealth & Personal Banking
(5, 4),  -- Cross Functions under Enterprise Technology
(6, 4);  -- Finance under Enterprise Technology


INSERT INTO metric_details (metric_name, precision, is_percentage, description, valid_dimensions, rounding_logic) VALUES
('Release Frequency', 0, FALSE, 'The frequency of deployment to production.', '{"All"}', 'ROUND'),
('Lead Time to Deploy', 2, FALSE, 'The amount of time it takes to deploy a new release.', '{"All"}', 'ROUND'),
('Incidents', 0, FALSE, 'Number of incidents recorded.', '{"All"}', 'ROUND'),
('Mean Time to Resolve', 2, FALSE, 'Average time taken to resolve incidents.', '{"All"}', 'CEIL');


-- Assume metric_id is assigned sequentially as 1 to 4
INSERT INTO metric_values (org_id, metric_id, month_year, value, dimensions, value_type) VALUES
(1, 1, '2024-06-01', 30, '{"environment": "production"}', 'actual'),
(1, 2, '2024-06-01', 2.5, '{"environment": "production"}', 'actual'),
(1, 3, '2024-06-01', 5, '{"environment": "production"}', 'actual'),
(1, 4, '2024-06-01', 4.0, '{"environment": "production"}', 'actual'),
(4, 1, '2024-06-01', 45, '{"environment": "production"}', 'actual'),
(4, 2, '2024-06-01', 1.5, '{"environment": "production"}', 'actual'),
(4, 3, '2024-06-01', 3, '{"environment": "production"}', 'actual'),
(4, 4, '2024-06-01', 3.5, '{"environment": "production"}', 'actual');



INSERT INTO org_details (org_name, level) VALUES
('Application Management Team', 'org level 8'),
('DevOps Team', 'org level 8'),
('Quality Assurance Team', 'org level 8'),
('Security Compliance Team', 'org level 8'),
('Infrastructure Team', 'org level 8'),
('Project Management Office', 'org level 8');
-- Link these org level 8 teams to their parent SLs or GBGFs (using assumed parent_org_ids from previous examples)
INSERT INTO org_hierarchy (org_id, parent_org_id) VALUES
(7, 3),  -- Application Management Team under GPBW and AMG IT
(8, 3),  -- DevOps Team under GPBW and AMG IT
(9, 6),  -- Quality Assurance Team under Finance Technology
(10, 6), -- Security Compliance Team under Finance Society
(11, 5), -- Infrastructure Team under Cross Functions Technology
(12, 5); -- Project Management Office under Cross Functions Technology








app.get('/api/orgHierarchy', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM get_org_hierarchy();");
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).send('Server error occurred: ' + error.message);
    }
});

app.get('/api/metricHierarchy/:startMetricId?', async (req, res) => {
    const { startMetricId } = req.params;
    try {
        const result = await db.query("SELECT * FROM get_metric_hierarchy($1);", [startMetricId || null]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).send('Server error occurred: ' + error.message);
    }
});



CREATE TABLE org_details (
    org_id SERIAL PRIMARY KEY,
    org_name VARCHAR(50) NOT NULL,    
    level VARCHAR(50) CHECK (level IN ('gbgf', 'sl', 'org level 8')),
    last_update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE org_hierarchy (
    org_id INT NOT NULL,
    parent_org_id INT,
    org_position_ui INT DEFAULT 0,
    last_update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (org_id) REFERENCES org_details (org_id),
    FOREIGN KEY (parent_org_id) REFERENCES org_details (org_id)
);


CREATE TABLE metric_details (
    metric_id SERIAL PRIMARY KEY,
    parent_metric_id INT,
    metric_name VARCHAR(255) NOT NULL,
    precision INT,
    is_percentage BOOLEAN,
    description TEXT,
    valid_dimensions TEXT[] NOT NULL,  -- Array of strings
    rounding_logic VARCHAR(5),
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (parent_metric_id) REFERENCES metric_details (metric_id)
);

CREATE TABLE metric_values (
    org_id INT NOT NULL,
    metric_id INT NOT NULL,
    month_year DATE NOT NULL,
    value NUMERIC NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dimensions JSONB NOT NULL,  -- Storing JSON data
    value_type VARCHAR(50) CHECK (value_type IN ('actual', 'baseline', 'okr', 'target')),
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (org_id) REFERENCES org_details (org_id),
    FOREIGN KEY (metric_id) REFERENCES metric_details (metric_id)
);

-- Indexes
CREATE INDEX idx_org_hierarchy_org_id ON org_hierarchy (org_id) WHERE soft_deleted = FALSE ;
CREATE INDEX idx_org_hierarchy_parent_org_id ON org_hierarchy (parent_org_id) WHERE soft_deleted = FALSE;
CREATE INDEX idx_metric_values_org_id ON metric_values (org_id)  WHERE soft_deleted = FALSE;
CREATE INDEX idx_metric_values_metric_id ON metric_values (metric_id);
CREATE INDEX idx_metric_values_composite ON metric_values (org_id, month_year, value_type);
CREATE INDEX idx_metric_values_last_updated ON metric_values (last_updated);
CREATE INDEX idx_metric_values_actual ON metric_values (org_id, metric_id, month_year) WHERE value_type = 'actual';
CREATE INDEX idx_metric_values_soft_deleted ON metric_values (soft_deleted);
CREATE INDEX idx_org_details_org_name ON org_details (org_name);
CREATE INDEX idx_metric_values_org_metric_date ON metric_values (org_id, metric_id, month_year);
CREATE INDEX idx_metric_values_dimensions ON metric_values USING gin (dimensions);

CREATE INDEX idx_metric_details_metric_name ON metric_details (metric_name);

-- Views
CREATE VIEW vw_org_hierarchy AS
SELECT child.org_id, child.parent_org_id, child.level , parent.org_name AS parent_name, child.org_name
FROM org_hierarchy AS child
JOIN org_details AS parent ON child.parent_org_id = parent.org_id 
JOIN org_details AS child_detail ON child.org_id = child_detail.org_id 
WHERE child.soft_deleted = FALSE;

CREATE VIEW vw_latest_metric_values AS
SELECT m.metric_id, m.metric_name, v.org_id, v.month_year, v.value, v.dimensions, v.value_type
FROM metric_values v
JOIN metric_details m ON v.metric_id = m.metric_id
WHERE v.soft_deleted = FALSE AND m.soft_deleted = FALSE
AND (v.org_id, v.metric_id, v.month_year, v.last_updated) IN (
    SELECT org_id, metric_id, month_year, MAX(last_updated)
    FROM metric_values
    WHERE soft_deleted = FALSE
    GROUP BY org_id, metric_id, month_year
);


--Functions
CREATE OR REPLACE FUNCTION update_metric_value(p_org_id INT, p_metric_id INT, p_month_year DATE, p_value NUMERIC, p_dimensions JSON, p_value_type VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE metric_values
    SET value = p_value, last_updated = CURRENT_TIMESTAMP, soft_deleted = FALSE
    WHERE org_id = p_org_id AND metric_id = p_metric_id AND month_year = p_month_year AND dimensions @> p_dimensions AND dimensions <@ p_dimensions AND value_type = p_value_type AND soft_deleted = FALSE;

    IF NOT FOUND THEN
        INSERT INTO metric_values (org_id, metric_id, month_year, value, dimensions, value_type)
        VALUES (p_org_id, p_metric_id, p_month_year, p_value, p_dimensions, p_value_type)
        ON CONFLICT (org_id, metric_id, month_year, dimensions, value_type)
        DO UPDATE SET value = EXCLUDED.value, last_updated = CURRENT_TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_or_update_hierarchy(child_org_name VARCHAR, parent_org_name VARCHAR, child_level VARCHAR, parent_level VARCHAR)
RETURNS VOID AS $$
DECLARE
    child_org_id INT;
    parent_org_id INT;
BEGIN
    -- Check and insert child org if it does not exist or is soft-deleted
    SELECT org_id INTO child_org_id FROM org_details WHERE org_name = child_org_name AND soft_deleted = FALSE;
    IF child_org_id IS NULL THEN
        INSERT INTO org_details (org_name, level ) VALUES (child_org_name, child_level) RETURNING org_id INTO child_org_id;
    END IF;

    -- Check and insert parent org if it does not exist or is soft-deleted
    SELECT org_id INTO parent_org_id FROM org_details WHERE org_name = parent_org_name AND soft_deleted = FALSE;
    IF parent_org_id IS NULL THEN
        INSERT INTO org_details (org_name, level ) VALUES (parent_org_name, parent_level) RETURNING org_id INTO parent_org_id;
    END IF;

    -- Insert or update hierarchy
    INSERT INTO org_hierarchy (org_id, parent_org_id)
    VALUES (child_org_id, parent_org_id)
    ON CONFLICT (org_id) 
    DO UPDATE SET parent_org_id = EXCLUDED.parent_org_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_org_hierarchy()
RETURNS TABLE(org_id INT, parent_org_id INT, org_name VARCHAR, parent_name VARCHAR, depth INT) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy_path AS (
        SELECT h.org_id, h.parent_org_id, d.org_name, pd.org_name AS parent_name, 1 AS depth
        FROM org_hierarchy h
        JOIN org_details d ON h.org_id = d.org_id AND d.level = 'gbgf' AND d.soft_deleted = FALSE
        LEFT JOIN org_details pd ON h.parent_org_id = pd.org_id AND pd.soft_deleted = FALSE
        WHERE h.soft_deleted = FALSE
        UNION ALL
        SELECT h.org_id, h.parent_org_id, d.org_name, p.parent_name, p.depth + 1
        FROM org_hierarchy h
        JOIN hierarchy_path p ON p.org_id = h.parent_org_id
        JOIN org_details d ON h.org_id = d.org_id AND d.soft_deleted = FALSE
        WHERE h.soft_deleted = FALSE
    )
    SELECT org_id, parent_org_id, org_name, parent_name, depth FROM hierarchy_path;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_org_metrics(
    p_org_id INT,
    p_metric_names TEXT[],
    p_start_month DATE,
    p_end_month DATE,
    p_value_types VARCHAR[],
    p_dimensions JSONB
)
RETURNS TABLE(org_id INT, metric_id INT, metric_name VARCHAR, month_year DATE, value NUMERIC, dimensions JSONB, value_type VARCHAR) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_hierarchy_recursive AS (
        -- Start with the initial organization and recursively find all child organizations
        SELECT org_id, parent_org_id
        FROM org_hierarchy
        WHERE org_id = p_org_id AND soft_deleted = FALSE
        UNION ALL
        SELECT h.org_id, h.parent_org_id
        FROM org_hierarchy h
        JOIN org_hierarchy_recursive hr ON h.parent_org_id = hr.org_id
        WHERE h.soft_deleted = FALSE
    ),
    filtered_metrics AS (
        -- Join the metrics details table to filter metrics by names if provided
        SELECT md.metric_id, md.metric_name
        FROM metric_details md
        WHERE (p_metric_names IS NULL OR md.metric_name = ANY(p_metric_names)) AND md.soft_deleted = FALSE
    )
    SELECT mv.org_id, mv.metric_id, fm.metric_name, mv.month_year, mv.value, mv.dimensions, mv.value_type
    FROM metric_values mv
    JOIN org_hierarchy_recursive ohr ON mv.org_id = ohr.org_id
    JOIN filtered_metrics fm ON mv.metric_id = fm.metric_id
    WHERE
        mv.month_year BETWEEN p_start_month AND p_end_month
        AND (p_value_types IS NULL OR mv.value_type = ANY(p_value_types))
        AND (p_dimensions IS NULL OR (mv.dimensions @> p_dimensions AND mv.dimensions <@ p_dimensions))
        AND mv.soft_deleted = FALSE
    ORDER BY mv.org_id, mv.metric_id, mv.month_year;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_metric_hierarchy(start_metric_id INT DEFAULT NULL)
RETURNS TABLE(
    metric_id INT,
    parent_metric_id INT,
    metric_name VARCHAR,
    level INT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE metric_hierarchy AS (
        -- Base case: Select the root node or a specific starting node
        SELECT 
            metric_id,
            parent_metric_id,
            metric_name,
            1 AS level
        FROM metric_details
        WHERE 
            (metric_id = start_metric_id OR start_metric_id IS NULL) AND
            (parent_metric_id IS NULL OR start_metric_id IS NOT NULL)

        UNION ALL

        -- Recursive step: Select child nodes
        SELECT 
            md.metric_id,
            md.parent_metric_id,
            md.metric_name,
            mh.level + 1
        FROM metric_details md
        JOIN metric_hierarchy mh ON mh.metric_id = md.parent_metric_id
    )
    SELECT * FROM metric_hierarchy;
END;
$$;


