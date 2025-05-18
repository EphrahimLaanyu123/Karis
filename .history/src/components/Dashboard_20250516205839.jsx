// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("USER_ID_HERE"); // Replace or get from auth context
  const [bookingStatus, setBookingStatus] = useState({}); // track individual booking status

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

  const handleBookTicket = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/events/book/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (res.ok) {
        setBookingStatus((prev) => ({ ...prev, [eventId]: 'Booked successfully!' }));

        // Re-fetch events to reflect updated ticket count
        const updatedRes = await fetch('http://localhost:3000/api/events');
        const updatedData = await updatedRes.json();
        setEvents(updatedData);
      } else {
        setBookingStatus((prev) => ({ ...prev, [eventId]: result.message }));
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Booking failed.' }));
    }
  };

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
          {events.map(event => {
            const availableTickets = event.remainingTickets;
            const totalTickets = event.totalTickets;

            return (
              <li key={event._id} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 10, borderRadius: 8 }}>
                <strong>{event.title}</strong> — {new Date(event.date).toLocaleDateString()}
                <br />
                <em>{event.description}</em>
                <br />
                <span>Total Tickets: {totalTickets}</span>
                <br />
                <span>Remaining Tickets: {availableTickets}</span>
                <br />
                <button
                  onClick={() => handleBookTicket(event._id)}
                  disabled={availableTickets === 0}
                  style={{ marginTop: 5 }}
                >
                  Book Ticket
                </button>
                {bookingStatus[event._id] && (
                  <p style={{ margin: 0, color: 'green' }}>{bookingStatus[event._id]}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
