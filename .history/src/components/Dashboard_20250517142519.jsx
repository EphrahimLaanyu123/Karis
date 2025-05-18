import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadUserAndEvents = async () => {
      const storedUserToken = localStorage.getItem('userToken');

      if (!storedUserToken) {
        console.warn('No token found.');
        setUser(null);
        return;
      }

      try {
        const tokenParts = storedUserToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format.');
        }

        const payloadBase64 = tokenParts[1];
        const payloadJSON = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const parsedPayload = JSON.parse(payloadJSON);

        console.log('Decoded payload:', parsedPayload); // For debugging

        const userEmail = parsedPayload.email;

        if (!userEmail) {
          throw new Error('Email not found in token payload.');
        }

        setUser({ email: userEmail });

        // Fetch events for the user
        const response = await axios.get(`http://127.0.0.1:5000/get-events/${userEmail}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error loading user or events:', error);
        setUser(null);
      }
    };

    loadUserAndEvents();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-4">Event Dashboard</h1>

        <p className="text-center text-gray-600 mb-6">
          {user ? `Welcome, ${user.email}` : 'You are not logged in or the token is invalid.'}
        </p>

        {user && (
          <>
            {events.length > 0 ? (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-gray-50"
                  >
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <p className="text-gray-700">{event.description}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No events found for your account.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventDashboard;
