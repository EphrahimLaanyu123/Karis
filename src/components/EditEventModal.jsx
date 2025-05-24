import { useEffect, useState } from "react";
import Modal from "./Modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EditEventModal({ close, event }) {
    const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [date, setDate] = useState('');
      const [tickets, setTickets] = useState('');
      const [ticketPrice, setTicketPrice] = useState('');
      const [category, setCategory] = useState('');
      const [image, setImage] = useState('');
        const [location, setLocation] = useState('');
          const [adminId, setAdminId] = useState('');
          const [error, setError] = useState('');
        
          useEffect(() => {
            if (event) {
              setTitle(event.title || '');
              setDescription(event.description || '');
              setDate(event.date ? new Date(event.date).toISOString().slice(0, 16) : '');
              setTickets(event.tickets || '');
              setTicketPrice(event.ticketPrice || '');
              setCategory(event.category || '');
              setImage(event.image || '');
              setLocation(event.location || '');
            }
          }, [event]);
          

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

      const navigate = useNavigate();

const handleSubmit = async (e) => {
    console.log('submit')
  e.preventDefault();
  setError('');


  if (
    !title.trim() ||
    !date ||
    !tickets ||
    isNaN(tickets) ||
    tickets <= 0 ||
    !ticketPrice ||
    isNaN(ticketPrice) ||
    ticketPrice < 0 ||
    !location.trim()
  ) {
    alert('Please fill in all required fields with valid values.');
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
    await axios.put(`http://localhost:3000/api/events/${event._id}/edit`, payload);
    alert('Event updated successfully!');
    close(); // Close modal
    navigate('/admin/dashboard'); // Optional navigation
  } catch (error) {
    console.error('Error updating event:', error);
    setError('Failed to update event.');
  }
};

  

  return (
    <Modal close={close}>
        <h2 className="text-white text-3xl py-2 font-bold mb-4">Edit Event</h2>
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
          <div className="flex gap-4 w-full">

          <button type="submit" className="submit-button w-full" onClick={handleSubmit}>
            Update Event
          </button>
          <button onClick={close} className="bg-gray-300 text-black w-full">
            Cancel
          </button>
          </div>
          
        </form>

        </Modal>
  );
}

export default EditEventModal;
