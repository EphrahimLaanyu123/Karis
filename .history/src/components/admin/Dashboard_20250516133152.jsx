import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // npm i jwt-decode

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('adminToken');
    if (token) {
      const decoded = jwtDecode(token);
      setAdminId(decoded.id); // Assuming your token payload contains `id`
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.post(
        'http://localhost:3000/api/events',
        { title, description, date, adminId },
        { headers: { Authorization: `Bearer ${token}` } } // send token for backend auth
      );

      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to your Dashboard Admin!</h1>
      <p>This is a protected page for logged-in admins.</p>

      <h2>Create New Event</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}
      >
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        {/* No Admin ID input — it’s set from token */}
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default Dashboard;
