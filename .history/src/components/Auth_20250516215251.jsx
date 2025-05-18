

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
