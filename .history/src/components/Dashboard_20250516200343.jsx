// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>This is a protected page for logged-in users.</p>

      <h2 style={{ marginTop: 40 }}>All Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event._id} style={{ marginBottom: 15 }}>
              <strong>{event.title}</strong> — {new Date(event.date).toLocaleDateString()}
              <br />
              <em>{event.description}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;