import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "/Auth.css"

const Auth = () => {
    const navigate = useNavigate();
    const [authType, setAuthType] = useState('user'); // 'user' or 'admin'
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Used for signup
  
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
      
          const data = await res.json();
      
          if (!res.ok) {
            alert(data.message || 'Authentication failed');
            return;
          }
      
          // Store token in different variables depending on authType
          if (data.token) {
            if (authType === 'admin') {
              localStorage.setItem('adminToken', data.token);
              localStorage.removeItem('userToken'); // optional: clear other token
            } else {
              localStorage.setItem('userToken', data.token);
              localStorage.removeItem('adminToken'); // optional: clear other token
            }
          }
      
          localStorage.setItem('isAdmin', authType === 'admin' ? 'true' : 'false');
      
          // Redirect accordingly
          if (authType === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
      
        } catch (err) {
          console.error('Auth error:', err);
          alert('Network error. Please try again.');
        }
      };
      
  
    return (
       <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">
            <span className={`auth-type ${authType === 'admin' ? 'admin-type' : 'user-type'}`}>
              {authType === 'admin' ? 'Admin' : 'User'}
            </span> 
            <span className="auth-mode">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
          </h2>
  
          {/* Mode Toggle */}
          <div className="toggle-container mode-toggle">
            <button 
              className={`toggle-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => setMode('signin')} 
              disabled={mode === 'signin'}
            >
              Sign In
            </button>
            <button 
              className={`toggle-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')} 
              disabled={mode === 'signup'}
            >
              Sign Up
            </button>
          </div>
  
          {/* Auth Type Toggle */}
          <div className="toggle-container type-toggle">
            <button 
              className={`toggle-btn ${authType === 'user' ? 'active' : ''}`}
              onClick={() => setAuthType('user')} 
              disabled={authType === 'user'}
            >
              User
            </button>
            <button 
              className={`toggle-btn ${authType === 'admin' ? 'active' : ''}`}
              onClick={() => setAuthType('admin')} 
              disabled={authType === 'admin'}
            >
              Admin
            </button>
          </div>
  
          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
            {mode === 'signup' && (
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="name">Name</label>
              </div>
            )}
  
            <div className="form-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="email">Email</label>
            </div>
  
            <div className="form-group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="password">Password</label>
            </div>
  
            <button type="submit" className="auth-button">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default Auth;