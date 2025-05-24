import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import "./AdminDashboard.css";
import { FaCalendarAlt, FaTags, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EditEventModal from '../EditEventModal';

const Dashboard = () => {
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketCounts, setTicketCounts] = useState({});
  const [adminId, setAdminId] = useState('');
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);


const handleShowEditModal = (event) => {
  setSelectedEvent(event);
  setShowEditModal(true);
};

const handleCloseEditModal = () => {
  setShowEditModal(false);
  setSelectedEvent(null);
};
  


  const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [date, setDate] = useState('');
        const [tickets, setTickets] = useState('');
        const [ticketPrice, setTicketPrice] = useState('');
  
        const [editingEventId, setEditingEventId] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.adminId || decoded.id || decoded._id;
        setAdminId(id);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Invalid token. Please log in again.');
      }
    } else {
      setError('No token found. Please log in.');
    }
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchEvents();
    }
  }, [adminId]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:3000/api/events/admin/${adminId}`);
      setEvents(res.data);
      console.log(res?.data)
    } catch (error) {
      console.error('Error fetching admin events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  


  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/events/${eventId}`);
      alert('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  

  return (
    <div className="admin-dashboard">
{showEditModal && (
  <EditEventModal event={selectedEvent} close={handleCloseEditModal} />
)}
      <div className="px-4 py-8">
  <h2 className="text-3xl font-bold text-white mb-6">Your Events</h2>

  {loading ? (
    <p className="text-gray-300 text-lg">Loading events...</p>
  ) : events.length === 0 ? (
    <p className="text-gray-400 text-lg">No events created yet.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (

        <div
          key={event._id}
          className="bg-[#111827cc] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
        >
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70'
            }
            alt={event.title}
            className="w-full h-56 object-cover"
          />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <Link to={`/admin/event/${event?._id}`} className="text-xl font-semibold text-white mb-2">{event.title}</Link>
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {event.description || 'No description provided.'}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <FaCalendarAlt className="text-blue-400" />
                <span>{new Date(event.date).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <FaTags className="text-pink-400" />
                <span className="capitalize">{event.category || 'Other'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <FaTicketAlt className="text-green-400" />
                <span>
                  <span className="font-bold text-white">{event.tickets}</span> tickets remaining /
                  <span className="font-bold text-white ml-1">
                    {event.tickets + (event.ticketsSold || 0)}
                  </span>{' '}
                  total
                </span>
              </div>
            </div>

            <div className="mt-auto flex gap-3">
              <button
                onClick={() => handleShowEditModal(event)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event._id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
))}
    </div>
  )}
</div>
    </div>
  );
};

export default Dashboard;
