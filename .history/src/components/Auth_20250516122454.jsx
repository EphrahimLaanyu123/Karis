import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Redirect to dashboard after successful signup
        navigate('/dashboard');
      } else {
        // handle errors here
        alert('Signup failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Redirect to dashboard after successful signin
        navigate('/dashboard');
      } else {
        alert('Signin failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Your input fields for email and password */}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleSignin}>Sign In</button>
    </div>
  );
};

export default Auth;
