import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import "./AdminDashboard.css"

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tickets, setTickets] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({}); // For adding tickets
  const [error, setError] = useState('');

  const [adminId, setAdminId] = useState(''); // State to hold admin ID

  useEffect(() => {
    const token = localStorage.getItem('adminToken'); // Changed to adminToken
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Consistent key name access
        const id = decoded.adminId || decoded.id || decoded._id;
        setAdminId(id); // Set the admin ID
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Invalid token. Please log in again.');
        // Consider redirecting to login
      }
    } else {
      setError('No token found. Please log in.');
      // Consider redirecting to login
    }
  }, []); // Removed adminId from dependency array

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
      !adminId || // Use adminId state
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
      await axios.post('http://localhost:3000/api/events', {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        adminId, // Use adminId state
        tickets: parseInt(tickets, 10),
        ticketPrice: parseFloat(ticketPrice),
      });

      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      setTickets('');
      setTicketPrice('');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
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
        ticketsToAdd: parseInt(ticketsToAdd, 10),
      });

      alert('Tickets added successfully!');
      setTicketCounts((prev) => ({ ...prev, [eventId]: '' }));
      fetchEvents();
    } catch (error) {
      console.error('Error adding tickets:', error);
      setError('Failed to add tickets');
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
        <h2 className="section-title">Create Event</h2>
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

          <button type="submit" className="submit-button">Create Event</button>
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

              <div className="ticket-controls">
                <input
                  type="number"
                  className="ticket-input"
                  placeholder="Add tickets"
                  min={1}
                  value={ticketCounts[event._id] || ''}
                  onChange={(e) =>
                    setTicketCounts((prev) => ({
                      ...prev,
                      [event._id]: e.target.value,
                    }))
                  }
                />
                <button 
                  className="add-tickets-button"
                  onClick={() => handleAddTicket(event._id)}
                >
                  Add Tickets
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
