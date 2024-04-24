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

const tasks = {}; // Store cron jobs to manage deletion and updates

const createTables = async () => {
  await pool.query(`
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
  `);
};

const callApiAndSave = async (endpoint) => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const toDate = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  try {
    const response = await axios.get(`${endpoint}?toDate=${toDate}`);
    await pool.query('INSERT INTO api_responses (api_endpoint, response) VALUES ($1, $2)', [endpoint, response.data]);
    console.log(`Data saved for ${endpoint}`);
  } catch (error) {
    console.error(`Error calling API for ${endpoint}: ${error.message}`);
  }
};

const initializeScheduledTasks = async () => {
  const { rows } = await pool.query('SELECT * FROM scheduled_tasks');
  rows.forEach(row => {
    const job = cron.schedule(row.cron_date, () => callApiAndSave(row.endpoint));
    tasks[row.id] = job; // Store reference to the cron job
  });
};

app.post('/schedule-api', async (req, res) => {
  const { endpoint, dates } = req.body;
  const insertQuery = 'INSERT INTO scheduled_tasks (endpoint, cron_date) VALUES ($1, $2) RETURNING id';
  dates.forEach(async date => {
    const { rows } = await pool.query(insertQuery, [endpoint, date]);
    const jobId = rows[0].id;
    const job = cron.schedule(`0 0 1 ${date} *`, () => callApiAndSave(endpoint));
    tasks[jobId] = job; // Store reference to the cron job
  });
  res.send('Scheduled API calls successfully.');
});

app.delete('/unschedule-api/:id', async (req, res) => {
  const { id } = req.params;
  if (tasks[id]) {
    tasks[id].destroy(); // Stop the cron job
    delete tasks[id]; // Remove reference from the object
    await pool.query('DELETE FROM scheduled_tasks WHERE id = $1', [id]);
    res.send('Unscheduled API call successfully.');
  } else {
    res.status(404).send('Schedule not found.');
  }
});

app.put('/update-schedule/:id', async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;
  if (tasks[id]) {
    tasks[id].destroy(); // Stop the old cron job
    const updatedJob = cron.schedule(`0 0 1 ${newDate} *`, () => callApiAndSave(req.body.endpoint));
    tasks[id] = updatedJob; // Update with the new cron job
    await pool.query('UPDATE scheduled_tasks SET cron_date = $1 WHERE id = $2', [newDate, id]);
    res.send('Updated the schedule successfully.');
  } else {
    res.status(404).send('Schedule not found.');
  }
});

app.get('/list-schedules/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  const { rows } = await pool.query('SELECT * FROM scheduled_tasks WHERE endpoint = $1', [endpoint]);
  res.json(rows);
});

app.listen(3000, async () => {
  console.log('Server running on http://localhost:3000');
  await createTables();
  await initializeScheduledTasks();
});
