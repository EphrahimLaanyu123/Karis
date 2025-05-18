import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Admin not logged in");
        return;
      }

      const decoded = jwt_decode(token);
      const adminId = decoded.adminId || decoded.id || decoded._id; // adjust based on your JWT payload

      // Logging for debug
      console.log('Submitting:', { title, description, date, adminId });

      if (!title || !date || !adminId) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await axios.post('http://localhost:3000/api/events', {
        title,
        description,
        date: new Date(date), // ensure correct date format
        adminId
      });

      console.log('Event created:', response.data);
      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. See console for details.');
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <br />

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default Dashboard;
