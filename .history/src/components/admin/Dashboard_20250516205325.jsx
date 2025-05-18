import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [events, setEvents] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const adminId = decoded.adminId || decoded.id || decoded._id;

  useEffect(() => {
    if (adminId) {
      fetchEvents();
    }
  }, [adminId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/events/admin/${adminId}`);
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching admin events:', error);
      alert('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !date || !adminId || !totalTickets || isNaN(totalTickets) || totalTickets <= 0) {
      alert('Please fill in all required fields with valid values including total tickets.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/events', {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        adminId,
        totalTickets: parseInt(totalTickets, 10),
      });

      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      setTotalTickets('');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleAddTicket = async (eventId) => {
    const ticketsToAdd = ticketCounts[eventId];
    if (!ticketsToAdd || isNaN(ticketsToAdd) || ticketsToAdd <= 0) {
      alert('Enter a valid positive number of tickets');
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/events/${eventId}`, {
        totalTicketsToAdd: parseInt(ticketsToAdd, 10),
      });

      alert('Tickets added successfully!');
      setTicketCounts((prev) => ({ ...prev, [eventId]: '' }));
      fetchEvents();
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

        <input
          type="number"
          placeholder="Total Tickets"
          value={totalTickets}
          onChange={(e) => setTotalTickets(e.target.value)}
          min={1}
          required
        />
        <br />

        <button type="submit">Create Event</button>
      </form>

      <hr />

      <h2>Your Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events created yet.</p>
      ) : (
        events.map((event) => (
          <div key={event._id} style={{ border: '1px solid #ccc', padding: 10, margin: '10px 0' }}>
            <h3>{event.title}</h3>
            <p>{event.description || 'No description provided.'}</p>
            <p>Date: {new Date(event.date).toLocaleString()}</p>
            <p>
              Tickets: {event.remainingTickets !== undefined ? event.remainingTickets : 0} remaining / {event.totalTickets || 0} total
            </p>

          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
