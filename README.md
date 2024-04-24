To interact with your Node.js backend from a React application built with Vite and styled with Bootstrap ^5.3.2, you'll need to create a user interface that allows users to schedule, update, delete, and view API call schedules. Here's how you can set up your React application and implement these functionalities:

Step 1: Set Up Your React Project
If you haven't already set up your Vite project, you can start with the following command:

bash
Copy code
npm create vite@latest your-project-name -- --template react
cd your-project-name
npm install
Step 2: Install Required Packages
Install Bootstrap for the UI components and Axios for making HTTP requests:

bash
Copy code
npm install bootstrap@5.3.2 axios
After installation, import Bootstrap CSS in your main entry file (src/main.jsx or src/main.js):

javascript
Copy code
import 'bootstrap/dist/css/bootstrap.min.css';
Step 3: React Components
Create components for managing the API schedules. Here's a simple example setup:

src/App.jsx
This component sets up the basic structure and routes different forms to manage the API schedules.

jsx
Copy code
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ScheduleForm from './ScheduleForm';
import ScheduleList from './ScheduleList';

function App() {
  return (
    <div className="container mt-3">
      <h1>API Schedule Manager</h1>
      <ScheduleForm />
      <ScheduleList />
    </div>
  );
}

export default App;
src/ScheduleForm.jsx
This component provides a form to schedule new API calls.

jsx
Copy code
import React, { useState } from 'react';
import axios from 'axios';

function ScheduleForm() {
  const [endpoint, setEndpoint] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3000/schedule-api', {
        endpoint,
        dates: [date] // Assume date is in the correct cron format
      });
      alert('API scheduled successfully');
    } catch (error) {
      alert('Failed to schedule API');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Schedule New API Call</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="endpoint" className="form-label">API Endpoint</label>
          <input
            type="text"
            className="form-control"
            id="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Date (Cron Format)</label>
          <input
            type="text"
            className="form-control"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default ScheduleForm;
src/ScheduleList.jsx
This component fetches and displays all scheduled API calls.

jsx
Copy code
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:3000/list-schedules');
        setSchedules(response.data);
      } catch (error) {
        console.error('Failed to fetch schedules', error);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div>
      <h2>Scheduled API Calls</h2>
      <ul className="list-group">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="list-group-item">
            Endpoint: {schedule.endpoint}, Date: {schedule.cron_date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleList;
Explanation
App Component: Serves as the main container.
ScheduleForm Component: Allows users to input a new API endpoint and a cron date to schedule API calls.
ScheduleList Component: Lists all the scheduled API calls by fetching them from the backend.
Next Steps
Testing: Test your components with your backend to ensure they interact correctly.
Enhancements: You can further enhance the UI, add error handling, and incorporate more features like updating and deleting schedules directly from the ScheduleList component.
This setup will provide a functional interface for scheduling
















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
