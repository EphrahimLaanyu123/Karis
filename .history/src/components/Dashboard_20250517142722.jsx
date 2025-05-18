import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});

  useEffect(() => {
    const loadUserAndEvents = async () => {
      try {
        const storedUserToken = localStorage.getItem('userToken');

        if (!storedUserToken) {
          setUser(null);
        } else {
          const tokenParts = storedUserToken.split('.');
          if (tokenParts.length !== 3) throw new Error('Invalid token format');

          const payloadBase64 = tokenParts[1];
          const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
          const parsedPayload = JSON.parse(decodedPayload);
          const userEmail = parsedPayload.email;

          if (userEmail) {
            const res = await fetch(`http://localhost:3000/api/users/email/${userEmail}`);
            if (!res.ok) throw new Error('Failed to fetch user data');
            const userData = await res.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        }

        await fetchEvents();
      } catch (error) {
        console.error('Error loading user/events:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      const eventsArray = Array.isArray(data) ? data : data.events || [];
      setEvents(eventsArray);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleBookTicket = async (eventId) => {
    if (!user || !user._id) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please log in to book.' }));
      return;
    }

    const numberOfTickets = parseInt(ticketCounts[eventId] || '1', 10);

    if (isNaN(numberOfTickets) || numberOfTickets <= 0) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please enter a valid number of tickets.' }));
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/attendees/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id, // Use MongoDB _id for booking
          eventId,
          numberOfTickets,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setBookingStatus((prev) => ({
          ...prev,
          [eventId]: `Successfully booked ${numberOfTickets} ticket(s)!`,
        }));
        setTicketCounts((prev) => ({ ...prev, [eventId]: '' }));
        await fetchEvents();
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
          {events.map((event) => (
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
              <p><strong>Available Tickets:</strong> {event.tickets}</p>

              <div>
                <input
                  type="number"
                  placeholder="Number of Tickets"
                  min="1"
                  value={ticketCounts[event._id] || ''}
                  onChange={(e) =>
                    setTicketCounts({
                      ...ticketCounts,
                      [event._id]: e.target.value,
                    })
                  }
                  style={{ marginRight: '10px' }}
                />
                <button
                  onClick={() => handleBookTicket(event._id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Book Ticket(s)
                </button>
              </div>

              {bookingStatus[event._id] && (
                <p
                  style={{
                    marginTop: '0.5rem',
                    color: bookingStatus[event._id].includes('Successfully') ? 'green' : 'red',
                  }}
                >
                  {bookingStatus[event._id]}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
