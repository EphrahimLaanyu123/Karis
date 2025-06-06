import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Dashbo from './components/admin/Dashboard';

<Route path="/dashboard" element={<Dashboard />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect unknown routes to home or dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
