import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});

  useEffect(() => {
    const loadUserAndEvents = async () => {
      try {
        const storedUserToken = localStorage.getItem('userToken');

        if (!storedUserToken) {
          console.warn('No userToken found in localStorage');
          setUser(null);
        } else {
          try {
            const tokenParts = storedUserToken.split('.');
            if (tokenParts.length !== 3) throw new Error('Invalid token format');

            const payloadBase64 = tokenParts[1];
            const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const parsedPayload = JSON.parse(decodedPayload);
            const userEmail = parsedPayload.email;

            if (userEmail) {
              setUser({ email: userEmail });
            } else {
              console.warn('Email not found in token payload', parsedPayload);
              setUser(null);
            }
          } catch (error) {
            console.error('Error decoding/parsing userToken:', error);
            setUser(null);
          }
        }

        await fetchEvents();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const eventsArray = Array.isArray(data) ? data : data.events || [];
      setEvents(eventsArray);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleBookTicket = async (eventId) => {
    if (!user) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please log in to book.' }));
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/events/book/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.email }),
      });

      const result = await res.json();

      if (res.ok) {
        setBookingStatus((prev) => ({
          ...prev,
          [eventId]: 'Ticket booked successfully!',
        }));
        await fetchEvents(); // Refresh events after booking
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

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    alert('Logged out');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem' }}>
        {user ? `Welcome ${user.email}` : 'Event Dashboard'}
      </h1>
      <p>Browse and book events available in the system.</p>

      {user ? (
        <p><button onClick={handleLogout}>Log out</button></p>
      ) : (
        <p style={{ color: 'red' }}>You are not logged in.</p>
      )}

      <h2 style={{ marginTop: '2rem' }}>All Events</h2>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {events.map((event) => {
            const isBooked = event.attendees?.includes(user?.email);
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
                  <strong>Total Tickets:</strong> {event.totalTickets}<br />
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
                      color: bookingStatus[event._id] === 'Ticket booked successfully!' ? 'green' : 'red',
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
