import React, { useEffect, useState } from 'react';
import "./Dashboard.css"

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [token, setToken] = useState(null);

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

            // Extract both email and userId (_id)
            const userEmail = parsedPayload.email;
            const userId = parsedPayload._id || parsedPayload.id || parsedPayload.userId;

            if (userEmail && userId) {
              setUser({ email: userEmail, _id: userId });
              setToken(storedUserToken);
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

    const numberOfTickets = ticketCounts[eventId] || 1; // Default to 1 if empty

    if (numberOfTickets <= 0) {
      setBookingStatus((prev) => ({ ...prev, [eventId]: 'Please enter a valid number of tickets.' }));
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/attendees/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // send token in Authorization header
        },
        body: JSON.stringify({
          userId: user._id,
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {user ? `Welcome ${user.email}` : 'Event Dashboard'}
        </h1>
        <p className="dashboard-subtitle">Browse and book events available in the system.</p>

        {user ? (
          <button className="logout-button" onClick={handleLogout}>Log out</button>
        ) : (
          <p className="not-logged-in">You are not logged in.</p>
        )}
      </div>

      <div className="events-container">
        <h2 className="events-title">All Events</h2>

        {loading ? (
          <p className="loading-text">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="loading-text">No events available.</p>
        ) : (
          <ul className="events-list">
            {events.map((event) => (
              <li key={event._id} className="event-card">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleString()}</p>
                <p className="event-description">{event.description}</p>
                <p className="event-tickets">Total Tickets: {event.tickets}</p>

                <div className="booking-container">
                  <input
                    type="number"
                    className="ticket-input"
                    placeholder="Number of Tickets"
                    value={ticketCounts[event._id] || ''}
                    onChange={(e) =>
                      setTicketCounts({
                        ...ticketCounts,
                        [event._id]: parseInt(e.target.value, 10) || '',
                      })
                    }
                    min="1"
                  />
                  <button
                    className="book-button"
                    onClick={() => handleBookTicket(event._id)}
                  >
                    Book Ticket(s)
                  </button>
                </div>

                {bookingStatus[event._id] && (
                  <p className={`booking-status ${
                    bookingStatus[event._id].includes('Successfully') ? 'success' : 'error'
                  }`}>
                    {bookingStatus[event._id]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
