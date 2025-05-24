import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../components/Dashboard.css";

function Event() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const { event_id } = useParams();

  useEffect(() => {
    const loadUserAndEvent = async () => {
      const storedUserToken = localStorage.getItem('userToken');
      if (storedUserToken) {
        try {
          const tokenParts = storedUserToken.split('.');
          if (tokenParts.length !== 3) throw new Error('Invalid token');
          const decodedPayload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
          const userEmail = decodedPayload.email;
          const userId = decodedPayload._id || decodedPayload.id || decodedPayload.userId;
          if (userEmail && userId) {
            setUser({ email: userEmail, _id: userId });
            setToken(storedUserToken);
          }
        } catch (error) {
          console.error('Token decode error:', error);
        }
      }
      await fetchEvent();
    };

    loadUserAndEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/events/${event_id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !token) {
      setStatusMessage('Please log in to purchase tickets.');
      return;
    }
    if (ticketCount < 1 || ticketCount > event.tickets) {
      setStatusMessage(`You can purchase between 1 and ${event.tickets} tickets.`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/attendees/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          eventId: event._id,
          numberOfTickets: ticketCount,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatusMessage(`Successfully purchased ${ticketCount} ticket(s).`);
        fetchEvent();
        setTicketCount(1);
      } else {
        setStatusMessage(result.message || 'Purchase failed.');
      }
    } catch (error) {
      setStatusMessage('Error occurred while processing purchase.');
    }
  };

  if (loading) return <p className="text-center text-white">Loading...</p>;

  console.log(event)

  return (
    <div className="dashboard-container">
      <div className="max-w-6xl mx-auto px-4 py-10 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Event Details */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <img
              src={event.image || 'https://www.eventbrite.co.uk/blog/wp-content/uploads/2022/06/How-to-Promote-Your-Gigs-768x512.jpg'}
              alt={event.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-gray-400 mb-4">{new Date(event.date).toLocaleString()}</p>
              <p className="mb-4 text-gray-300">{event.description}</p>
            </div>
          </div>

          {/* Right Column: Ticket Purchase */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-4">Buy Tickets</h2>
            <p className="mb-2">
              <span className="font-semibold text-blue-400">Remaining:</span>{' '}
              {event.tickets > 0 ? event.tickets : <span className="text-red-500 font-bold">Sold Out</span>}
            </p>
            <p className="mb-6">
              <span className="font-semibold text-blue-400">Price:</span> KES. {event.ticketPrice}
            </p>

            {event.tickets > 0 && (
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  min="1"
                  max={event.tickets}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Number(e.target.value))}
                  className="w-full px-4 py-2 text-white rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePurchase}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition"
                >
                  Buy Ticket(s)
                </button>
              </div>
            )}

            {statusMessage && (
              <p className={`mt-4 text-sm ${statusMessage.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Map Below */}
        <div className="mt-12">
  <h2 className="text-2xl font-semibold mb-4">Event Location: <span className='text-gray-400'>{event?.location}</span></h2>
  
</div>

      </div>
    </div>
  );
}

export default Event;
