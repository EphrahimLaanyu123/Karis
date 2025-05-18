import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import "./AdminDashboard.css";

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tickets, setTickets] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({});
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState('');

  const [editingEventId, setEditingEventId] = useState(null); // To track which event is being edited

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.adminId || decoded.id || decoded._id;
        setAdminId(id);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Invalid token. Please log in again.');
      }
    } else {
      setError('No token found. Please log in.');
    }
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchEvents();
    }
  }, [adminId]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:3000/api/events/admin/${adminId}`);
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching admin events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !title.trim() ||
      !date ||
      !adminId ||
      !tickets ||
      isNaN(tickets) ||
      tickets <= 0 ||
      !ticketPrice ||
      isNaN(ticketPrice) ||
      ticketPrice < 0
    ) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    try {
      if (editingEventId) {
        // EDIT MODE
        await axios.put(`http://localhost:3000/api/events/${editingEventId}`, {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          tickets: parseInt(tickets, 10),
          ticketPrice: parseFloat(ticketPrice),
        });
        alert('Event updated successfully!');
        setEditingEventId(null);
      } else {
        // CREATE MODE
        await axios.post('http://localhost:3000/api/events', {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          adminId,
          tickets: parseInt(tickets, 10),
          ticketPrice: parseFloat(ticketPrice),
        });
        alert('Event created successfully!');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error submitting event:', error);
      setError('Failed to submit event');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTickets('');
    setTicketPrice('');
    setEditingEventId(null);
  };

  const handleEdit = (event) => {
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(event.date).toISOString().slice(0, 16)); // Format for input
    setTickets(event.tickets);
    setTicketPrice(event.ticketPrice);
    setEditingEventId(event._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/events/${eventId}`);
      alert('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="create-event-section">
        <h2 className="section-title">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
        <form className="event-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="form-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="datetime-local"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="number"
            className="form-input"
            placeholder="Number of Tickets"
            value={tickets}
            onChange={(e) => setTickets(e.target.value)}
            min={1}
            required
          />
          <input
            type="number"
            className="form-input"
            placeholder="Ticket Price"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            min={0}
            step="0.01"
            required
          />
          <button type="submit" className="submit-button">
            {editingEventId ? 'Update Event' : 'Create Event'}
          </button>
          {editingEventId && (
            <button type="button" className="cancel-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <hr className="divider" />

      <div className="events-list">
        <h2 className="section-title">Your Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-info">{event.description || 'No description provided.'}</p>
              <p className="event-info">Date: {new Date(event.date).toLocaleString()}</p>
              <p className="event-info">
                Tickets remaining: {event.tickets} / Total tickets: {event.tickets + (event.ticketsSold || 0)}
              </p>

              <div className="event-actions">
                <button onClick={() => handleEdit(event)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(event._id)} className="delete-button">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
