// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});

  useEffect(() => {
    const loadUserAndEvents = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser._id) {
          setUserId(storedUser._id);
        }

        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndEvents();
  }, []);

  const handleBookTicket = async (eventId) => {
    if (!userId) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please log in to book.' }));
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/events/book/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (res.ok) {
        setBookingStatus((prev) => ({
          ...prev,
          [eventId]: 'Ticket booked successfully!',
        }));

        // Refresh events
        const updatedRes = await fetch('http://localhost:3000/api/events');
        const updatedData = await updatedRes.json();
        setEvents(updatedData);
      } else {
        setBookingStatus((prev) => ({
          ...prev,
          [eventId]: result.message || 'Booking failed.',
        }));
      }
    } catch (error) {
      console.error('Error booking ticket:', error);
      setBookingStatus((prev) => ({
        ...prev,
        [eventId]: 'Booking failed due to server error.',
      }));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Event Dashboard</h1>
      <p>Browse and book events available in the system.</p>

      <h2 style={{ marginTop: '2rem' }}>All Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => {
            const isBooked = bookingStatus[event._id] === 'Ticket booked successfully!';
            return (
              <li
                key={event._id}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h3>{event.title}</h3>
                <p>{new Date(event.date).toLocaleString()}</p>
                <p>{event.description}</p>
                <p>
                  <strong>Total Tickets:</strong> {event.totalTickets}
                  <br />
                  <strong>Remaining Tickets:</strong> {event.remainingTickets}
                </p>

                <button
                  onClick={() => handleBookTicket(event._id)}
                  disabled={event.remainingTickets <= 0 || isBooked}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: isBooked ? 'gray' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: event.remainingTickets <= 0 || isBooked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isBooked ? 'Already Booked' : 'Book Ticket'}
                </button>

                {bookingStatus[event._id] && (
                  <p
                    style={{
                      marginTop: '0.5rem',
                      color:
                        bookingStatus[event._id] === 'Ticket booked successfully!'
                          ? 'green'
                          : 'red',
                    }}
                  >
                    {bookingStatus[event._id]}
                  </p>
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
