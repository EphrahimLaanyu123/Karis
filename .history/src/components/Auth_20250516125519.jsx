import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [authType, setAuthType] = useState('user'); // 'user' or 'admin'
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used during signup

  const handleAuth = async () => {
    const isSignup = mode === 'signup';
    const route = authType === 'admin' ? 'admins' : 'users';
    const url = `http://localhost:3000/api/${route}/${mode}`;

    const body = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (authType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const err = await res.json();
        alert(err.message || `${authType} ${mode} failed`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };
if (res.ok) {
  const data = await res.json(); // assuming your backend returns some user info
  localStorage.setItem('isAdmin', authType === 'admin' ? 'true' : 'false');

  // Redirect based on role
  if (authType === 'admin') {
    navigate('/admin/dashboard');
  } else {
    navigate('/dashboard');
  }
}

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h2>{authType === 'admin' ? 'Admin' : 'User'} {mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>

      {/* Mode Toggle */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode('signin')} disabled={mode === 'signin'}>Sign In</button>
        <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>Sign Up</button>
      </div>

      {/* Auth Type Toggle */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setAuthType('user')} disabled={authType === 'user'}>User</button>
        <button onClick={() => setAuthType('admin')} disabled={authType === 'admin'}>Admin</button>
      </div>

      {mode === 'signup' && (
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          required
        />
      )}
      <br />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <br />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <br />
      <button onClick={handleAuth}>
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>
    </div>
  );
};

export default Auth;
