import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../components/Dashboard.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AdminEvent() {
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(true);
  const [event, setEvent] = useState(null);
  const [eventAttendees, setEventAttendees] = useState([])
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
      await fetchEventAttendees()
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

  const fetchEventAttendees = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/attendees/${event_id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEventAttendees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendees(false);
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

  if (loading || loadingAttendees) return <p className="text-center text-white">Loading...</p>;

  console.log(event)
  const totalRevenue = eventAttendees.reduce((sum, attendee) => {
    return sum + attendee.numberOfTickets * event.ticketPrice;
  }, 0);

  console.log(eventAttendees.length)

  const attendeeRevenueData = {
    labels: eventAttendees.map((a) => a.user?.email),
    datasets: [
      {
        label: 'Revenue per Attendee ($)',
        data: eventAttendees.map((a) => a.numberOfTickets * event.ticketPrice),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue-500
      },
    ],
  };

  const attendeeRevenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Ksh ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Amount in Ksh',
          color: '#ffffff',
          font: {
            size: 14,
          },
        },
        ticks: {
          color: '#d1d5db', // Tailwind gray-300
          callback: (value) => `Ksh ${value}`,
        },
        grid: {
          color: '#374151', // Tailwind gray-700
        },
      },
      x: {
        title: {
          display: true,
          text: 'Attendee',
          color: '#ffffff',
          font: {
            size: 14,
          },
        },
        ticks: {
          color: '#d1d5db',
        },
        grid: {
          display: false,
        },
      },
    },
  };
  
  

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
              <h2 className="text-lg font-semibold mb-4">Event Location: <span className='text-gray-400'>{event?.location}</span></h2>

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

            <div className="mt-8">
  <h3 className="text-xl font-semibold mb-2">Attendees</h3>

  {eventAttendees.length === 0 ? (
    <p className="text-sm text-gray-400">No one has registered yet.</p>
  ) : (
    <ul className="divide-y divide-gray-700">
      {eventAttendees.map((attendee) => (
        <li key={attendee._id} className="py-2 flex justify-between items-center">
          <span className="text-sm text-white">{attendee.user?.email}</span>
          <span className="text-sm text-gray-400">
            🎫 {attendee.numberOfTickets} ticket{attendee.numberOfTickets > 1 ? 's' : ''}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>


            {statusMessage && (
              <p className={`mt-4 text-sm ${statusMessage.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                {statusMessage}
              </p>
            )}

<p className="mt-4 mb-2">
  <span className="font-semibold text-green-400">Total Revenue:</span>{' '}
  KES. {totalRevenue.toLocaleString()}
</p>

          </div>


        </div>


{/* Revenue Chart Full Width */}
{eventAttendees?.length > 0 && (
  <div className="mt-12 bg-gray-900 p-6 rounded-xl shadow-md w-full">
    <h2 className="text-2xl font-semibold text-white mb-4">Revenue Chart</h2>
    <Bar data={attendeeRevenueData} options={attendeeRevenueOptions} />
    </div>
)}


      </div>
    </div>
  );
}

export default AdminEvent;
