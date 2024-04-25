app.get('/api-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM api_responses ORDER BY call_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch API logs:', error);
    res.status(500).send('Failed to fetch API logs');
  }
});


import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Configure this as needed

function ApiLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api-logs`);
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch API logs', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mt-3">
      <h2>API Logs</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Endpoint</th>
            <th>Response</th>
            <th>Call Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.api_endpoint}</td>
              <td><pre>{JSON.stringify(log.response, null, 2)}</pre></td>
              <td>{new Date(log.call_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApiLogs;





















const fetch = require('node-fetch');

async function fetchUsers(baseUrl, headers) {
    const response = await fetch(`${baseUrl}/qrs/user/full`, { headers });
    return response.json();
}

async function fetchUserActivities(baseUrl, headers, userId) {
    const response = await fetch(`${baseUrl}/qrs/auditactivity?filter=userId eq ${userId}`, { headers });
    return response.json();
}

// Example usage
const baseUrl = 'https://qlik.example.com';
const headers = {
    'X-Qlik-Xrfkey': 'abcdef1234567890',
    'X-Qlik-User': 'UserDirectory=INTERNAL;UserId=qlik_admin',
    'hdr-usr': `UserDirectory=YourDirectory; UserId=YourUserId`
};

fetchUsers(baseUrl, headers).then(users => {
    users.forEach(user => {
        fetchUserActivities(baseUrl, headers, user.id).then(activities => {
            console.log(`User: ${user.name}, Activities: `, activities);
        });
    });
});
