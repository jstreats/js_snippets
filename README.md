const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'AutoQlik',
  host: 'localhost',
  database: 'CXODashboard_db_dev',
  password: 'AutoClick',
  port: 4432,
});

const createTables = async () => {
  const queries = `
    CREATE TABLE IF NOT EXISTS api_responses (
      id SERIAL PRIMARY KEY,
      api_endpoint VARCHAR(255),
      response JSON,
      call_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(255),
      cron_date VARCHAR(255)
    );
  `;
  await pool.query(queries);
};

const callApiAndSave = async (endpoint) => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const toDate = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  try {
    const response = await axios.get(`${endpoint}?toDate=${toDate}`);
    const insertQuery = 'INSERT INTO api_responses (api_endpoint, response) VALUES ($1, $2)';
    await pool.query(insertQuery, [endpoint, response.data]);
    console.log(`Data saved for ${endpoint}`);
  } catch (error) {
    console.error(`Error calling API for ${endpoint}: ${error.message}`);
  }
};

const initializeScheduledTasks = async () => {
  const selectQuery = 'SELECT * FROM scheduled_tasks';
  const { rows } = await pool.query(selectQuery);
  rows.forEach(row => {
    cron.schedule(row.cron_date, () => callApiAndSave(row.endpoint));
  });
};

app.post('/schedule-api', async (req, res) => {
  const { endpoint, dates } = req.body;
  const insertQuery = 'INSERT INTO scheduled_tasks (endpoint, cron_date) VALUES ($1, $2)';
  dates.forEach(async date => {
    await pool.query(insertQuery, [endpoint, date]);
    cron.schedule(`0 0 1 ${date} *`, () => callApiAndSave(endpoint));
  });
  res.send('Scheduled API calls successfully.');
});

app.listen(3000, async () => {
  console.log('Server running on http://localhost:3000');
  await createTables();
  await initializeScheduledTasks();
});
