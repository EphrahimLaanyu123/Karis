import React, { useEffect, useState } from 'react';
import "../components/Dashboard.css"
import { Link, useNavigate } from 'react-router-dom';
import { MdSearch } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';

const categoryColors = {
  music: 'bg-pink-400 text-white',
  tech: 'bg-blue-400 text-white',
  sports: 'bg-green-400 text-black',
  education: 'bg-yellow-300 text-black',
  fashion: 'bg-purple-400 text-white',
  business: 'bg-red-400 text-white',
  other: 'bg-gray-400 text-white',
};


const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingStatus, setBookingStatus] = useState({});
  const [ticketCounts, setTicketCounts] = useState({});
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');






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


  console.log(events)
  const filteredEvents = events.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const category = events?.category?.toLowerCase() || 'other';
const categoryClass = categoryColors[category] || categoryColors['other'];

  

  const categories = [
    'All',
    'Music',
    'Education',
    'Sports',
    'Technology',
    'Art',
    'Health',
    'Business',
    'Other',
  ];

  return (
    <>
    <div className="dashboard-container">
      

    <div className="px-4 py-10 max-w-[1500px] mx-auto">
  <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
    <h2 className="text-3xl font-bold text-white">All Events</h2>

    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
      {/* Search Input */}
      <div className="relative group transition-all duration-300 w-full md:w-[400px] rounded-2xl">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          <MdSearch size={20} />
        </span>
        <input
          type="text"
          placeholder="Search events by name..."
          className="w-full pl-10 pr-4 py-2 rounded border border-gray-600 bg-[#111827cc] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="relative w-full md:w-[200px]">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="appearance-none w-full pl-4 pr-10 py-2 rounded border border-gray-600 bg-[#111827cc] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <FiChevronDown size={18} />
        </span>
      </div>
    </div>
  </div>

  {/* Events List */}
  {loading ? (
    <p className="text-center text-gray-300 text-lg">Loading events...</p>
  ) : filteredEvents?.length === 0 ? (
    <p className="text-center text-gray-300 text-lg">No events available.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredEvents?.map((event) => (
        <div
          key={event._id}
          className="bg-[#111827cc] rounded-xl shadow-md overflow-hidden flex flex-col transition hover:shadow-xl"
        >
          <img
            src={
              event.image ||
              "https://www.eventbrite.co.uk/blog/wp-content/uploads/2022/06/How-to-Promote-Your-Gigs-768x512.jpg"
            }
            alt={event.title}
            className="w-full h-72 object-cover"
          />

          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <div className='flex justify-between items-center'>
              <h3 className="text-xl font-semibold mb-1 text-white">
                {event.title}
              </h3>
              <span className='px-2 py-1 bg-green-300 text-black rounded-full text-xs'>{event?.category}</span>
              </div>
              
              <p className="text-sm text-gray-300 mb-1">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-sm text-blue-400 font-medium mb-2">{event.category}</p>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{event.description}</p>

              {event.tickets > 0 ? (
                <p className="text-sm text-blue-300 font-medium mb-4">
                  Tickets Remaining: {event.tickets}
                </p>
              ) : (
                <p className="text-sm text-red-500 font-semibold mb-4">Sold Out</p>
              )}
            </div>

            <div className="mt-auto">
              <Link to={`/event/${event._id}`}>
                <button className="w-full border bg-blue-600 hover:bg-blue-600/70 text-white px-4 py-2 rounded transition">
                  More Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


    </div>
    </>
  );
};

export default Events;
