import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [token, setToken] = useState(null); // store raw token for API calls

  useEffect(() => {
    const loadUserAndEvents = async () => {
      try {
        const storedUserToken = localStorage.getItem('userToken');

        if (!storedUserToken) {
          setUser(null);
          setToken(null);
        } else {
          try {
            // Decode token payload
            const tokenParts = storedUserToken.split('.');
            if (tokenParts.length !== 3) throw new Error('Invalid token format');
            const payloadBase64 = tokenParts[1];
            const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const parsedPayload = JSON.parse(decodedPayload);
            const userEmail = parsedPayload.email;

            if (userEmail) {
              setUser({ email: userEmail });
              setToken(storedUserToken); // save token for API calls
            } else {
              setUser(null);
              setToken(null);
            }
          } catch (error) {
            console.error('Error decoding/parsing userToken:', error);
            setUser(null);
            setToken(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async (eventId) => {
    if (!user || !token) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please log in to book.' }));
      return;
    }

    const numberOfTickets = ticketCounts[eventId] || 1; // Default to 1 if not specified

    if (numberOfTickets <= 0) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please enter a valid number of tickets.' }));
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/attendees/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // <-- SEND token in Authorization header
        },
        body: JSON.stringify({
          user
          eventId: eventId,
          numberOfTickets: numberOfTickets,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setBookingStatus((prev) => ({
          ...prev,
          [eventId]: `Successfully booked ${numberOfTickets} tickets!`,
        }));
        await fetchEvents(); // Refresh events after booking
        setTicketCounts((prev) => ({ ...prev, [eventId]: '' })); // Clear input
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
    setToken(null);
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
              <p><strong>Total Tickets:</strong> {event.tickets}</p>

              <div>
                <input
                  type="number"
                  placeholder="Number of Tickets"
                  value={ticketCounts[event._id] || ''}
                  onChange={(e) =>
                    setTicketCounts({
                      ...ticketCounts,
                      [event._id]: parseInt(e.target.value, 10) || '',
                    })
                  }
                  min="1"
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
