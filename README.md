import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // You can configure this as needed

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await axios.delete(`${API_BASE_URL}/unschedule-api/${selectedId}`);
        setShowModal(false); // Close modal
        fetchSchedules(); // Refresh the list after deletion
        alert('Schedule deleted successfully');
      } catch (error) {
        console.error('Failed to delete schedule', error);
      }
    }
  };

  const openModal = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h2>Scheduled API Calls</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Endpoint</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id}>
              <td>{schedule.id}</td>
              <td>{schedule.endpoint}</td>
              <td>{schedule.cron_date}</td>
              <td>
                <button className="btn btn-danger" onClick={() => openModal(schedule.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal show" tabIndex="-1" style={{ display: 'block' }} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Schedule</h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this schedule?</p>
              </div>
              <div className="modal-backdrop" onClick={closeModal}></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleList;

















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
