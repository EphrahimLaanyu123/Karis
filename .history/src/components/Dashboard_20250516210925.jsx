// src/Dashboard.jsx
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Will be set from localStorage or auth
  const [bookingStatus, setBookingStatus] = useState({}); // Tracks booking status per event

  // Load user and events on mount
  useEffect(() => {
    const loadUserAndEvents = async () => {
      try {
        // Get user ID from localStorage or auth context
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser._id) {
          setUserId(storedUser._id);
        } else {
          console.warn('No user found in localStorage.');
          return;
        }

        // Fetch all events
        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndEvents();
  }, []);

  // Handle booking a ticket
  const handleBookTicket = async (eventId) => {
    if (!userId) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'User not logged in.' }));
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

        // Refresh events to update remaining ticket counts
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
      console.error('Booking error:', error);
      setBookingStatus((prev) => ({
        ...prev,
        [eventId]: 'An error occurred while booking.',
      }));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to Your Dashboard</h1>
      <p>This is a protected area for logged-in users to view and book events.</p>

      <h2 style={{ marginTop: '2rem' }}>Upcoming Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => {
            const isBooked = bookingStatus[event._id] === 'Ticket booked successfully!';
            const availableTickets = event.remainingTickets ?? (event.totalTickets - event.bookedTickets);

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
                  <strong>Remaining Tickets:</strong> {availableTickets}
                </p>

                <button
                  onClick={() => handleBookTicket(event._id)}
                  disabled={availableTickets <= 0 || isBooked}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: isBooked ? 'gray' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: availableTickets <= 0 || isBooked ? 'not-allowed' : 'pointer',
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
