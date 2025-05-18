import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [events, setEvents] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const adminId = decoded.adminId || decoded.id || decoded._id;

  useEffect(() => {
    if (adminId) {
      fetchEvents();
    }
  }, [adminId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/events');
      const adminEvents = res.data.filter((event) => event.admin === adminId);
      setEvents(adminEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!title || !date || !adminId) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/events', {
        title,
        description,
        date: new Date(date),
        adminId,
      });

      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      fetchEvents(); // refresh the list
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleAddTicket = async (eventId) => {
    const totalTickets = ticketCounts[eventId];
    if (!totalTickets || isNaN(totalTickets)) {
      alert('Enter a valid number of tickets');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/tickets', {
        eventId,
        totalTickets: parseInt(totalTickets),
      });
      alert('Tickets added successfully!');
      setTicketCounts({ ...ticketCounts, [eventId]: '' });
    } catch (error) {
      console.error('Error adding tickets:', error);
      alert('Failed to add tickets');
    }
  };

  return (
    <div style={{ padding: 20 }}>
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

      <hr />

      <h2>Your Events</h2>
      {events.length === 0 ? (
        <p>No events created yet.</p>
      ) : (
        events.map((event) => (
          <div key={event._id} style={{ border: '1px solid #ccc', padding: 10, margin: '10px 0' }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleString()}</p>

            <input
              type="number"
              placeholder="Number of tickets"
              value={ticketCounts[event._id] || ''}
              onChange={(e) =>
                setTicketCounts({ ...ticketCounts, [event._id]: e.target.value })
              }
              min={1}
              style={{ marginRight: 10 }}
            />
            <button onClick={() => handleAddTicket(event._id)}>Add Tickets</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
