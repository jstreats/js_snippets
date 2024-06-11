
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









// Utility function to parse Mon-YY format
const parseMonthYear = (monthYear) => {
    return moment(monthYear, 'MMM-YY', true).isValid() ? moment(monthYear, 'MMM-YY') : null;
};

// API to get the latest month_year in Mon-YY format
app.get('/latest-month-year', async (req, res) => {
    try {
        const today = moment().format('MMM-YY');

        const result = await pool.query(`
            SELECT month_year 
            FROM vision_27 
            WHERE month_year ~ '^[A-Za-z]{3}-\\d{2}$'
        `);

        const validEntries = result.rows
            .map(row => row.month_year)
            .map(parseMonthYear)
            .filter(date => date && date.isSameOrBefore(moment(today, 'MMM-YY')))
            .sort((a, b) => b - a);

        const latestMonthYear = validEntries.length > 0 ? validEntries[0].format('MMM-YY') : null;

        res.json({ latestMonthYear });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



























Our Journey Migrating Dashboards to the DHP Cloud (Part 2 of 2)

Introduction:
After successfully migrating our first dashboard to the DHP Cloud and reaping the benefits, our team was ready to take the next big step—getting our own domain and setting up our Cranker router. This part of our journey would further streamline our DevOps processes and enhance our application's accessibility.

The Next Phase:
With the initial POC behind us, we were excited to embark on a new challenge. The goal was clear: establish our own domain and onboard our Cranker router, a critical piece of the DHP ecosystem that would allow us to manage our applications more efficiently.

Smooth Onboarding Thanks to Expert Guidance:
Thanks to Robert Dann's expertise in Cranker as a service, our transition was smoother than expected. We were the first team to onboard using this new setup, and the process was straightforward:

Repository Setup: We started by creating a stash repo in the RPP project with our project name.
Cranker Router Deployment: Next, we configured and deployed a Cranker router using environmental variables in Relto, simplifying the connection to our applications.
Domain Registration: We then registered a new domain with a CNAME record pointing to our MSS domain, ensuring seamless connectivity.
Security Measures: The setup included an SSL certificate, bolstering our platform's security.
UAT and Beyond:
While we have only tested this setup in UAT, the production phase is well underway. For those curious about how to connect an app to this new Cranker router, we have provided a helpful GitHub project.

Helpful Resources:
To assist others in their DHP onboarding process, here are some useful links:

DHP Homepage
Access Requests
RPP Repo
Restabuild URL
UAT Release Schedulers
Service Status Monitors
PGMaker2 Prod DB Request Repo
Prod Release Schedulers
DB Monitor
Secrets Manager Service
SSHD
DSD
Cost Monitor
Conclusion:
Our journey with DHP continues to be a transformative experience for our team. We encourage everyone to explore DHP services to see how they can benefit their projects.

Stay tuned for more updates on our DHP adventures!
