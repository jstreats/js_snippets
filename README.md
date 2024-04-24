import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:3000/list-schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await axios.delete(`http://localhost:3000/unschedule-api/${selectedId}`);
        setShowModal(false);
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
                <Button variant="danger" onClick={() => openModal(schedule.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this schedule?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
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
