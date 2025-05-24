import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tickets, setTickets] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const navigate = useNavigate()

  const categories = [
    'Music',
    'Education',
    'Sports',
    'Technology',
    'Art',
    'Health',
    'Business',
    'Other',
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !title.trim() ||
      !date ||
      !adminId ||
      !tickets ||
      isNaN(tickets) ||
      tickets <= 0 ||
      !ticketPrice ||
      isNaN(ticketPrice) ||
      ticketPrice < 0 ||
      !location.trim()
    ) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      adminId,
      tickets: parseInt(tickets, 10),
      ticketPrice: parseFloat(ticketPrice),
      category,
      image: image.trim(),
      location: location.trim(),
    };

    console.log(payload)

    try {
      if (editingEventId) {
        await axios.put(`http://localhost:3000/api/events/${editingEventId}/edit`, payload);
        alert('Event updated successfully!');
        setEditingEventId(null);
      } else {
        await axios.post('http://localhost:3000/api/events', payload);
        alert('Event created successfully!');
      }

      resetForm();
      navigate('/admin/dashboard')
      
    } catch (error) {
      console.error('Error submitting event:', error);
      setError('Failed to submit event');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTickets('');
    setTicketPrice('');
    setCategory('Other');
    setImage('');
    setLocation('');
    setEditingEventId(null);
  };

  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="create-event-section">
        <h2 className="section-title">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
        <form className="event-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-input"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="form-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="datetime-local"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="number"
            className="form-input"
            placeholder="Number of Tickets"
            value={tickets}
            onChange={(e) => setTickets(e.target.value)}
            min={1}
            required
          />
          <input
            type="number"
            className="form-input"
            placeholder="Ticket Price"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            min={0}
            step="0.01"
            required
          />
          <select
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Event Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <button type="submit" className="submit-button">
            {editingEventId ? 'Update Event' : 'Create Event'}
          </button>
          {editingEventId && (
            <button type="button" className="cancel-button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
