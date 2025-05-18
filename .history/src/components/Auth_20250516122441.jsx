import React, { useState } from 'react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:3000/api/users'; // adjust if your backend URL is different

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignUp ? 'signup' : 'signin';

    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Success!');
      } else {
        setMessage(data.message || 'Error occurred');
      }
    } catch (error) {
      setMessage('Network error, please try again');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          {isSignUp ? 'Register' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage('');
          }}
          style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {message && <p style={{ marginTop: 15, color: 'red' }}>{message}</p>}
    </div>
  );
};

export default Auth;
