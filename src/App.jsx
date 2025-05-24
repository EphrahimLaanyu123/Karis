import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import Navbar from './components/Navbar';
import DefaultLayout from './Layouts/DefaultLayout';
import ProtectedRoutes from './components/admin/ProtectedRoutes';
import Events from './Pages/Events';
import Event from './Pages/Event';
import AdminLayout from './Layouts/AdminLayout';
import CreateEvent from './Pages/CreateEvent';
import AdminEvent from './Pages/AdminEvent';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/events" element={<Events />} />
          <Route path="/event/:event_id" element={<Event />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/signin" element={<Auth />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
        </Route>
        
        <Route element={<AdminLayout />}>
        <Route element={<ProtectedAdminRoute />}>
            <Route path='/create_event' element={<CreateEvent />}/>
            <Route path='/admin/dashboard' element={<AdminDashboard />}/>
            <Route path='/admin/event/:event_id' element={<AdminEvent />}/>
</Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
