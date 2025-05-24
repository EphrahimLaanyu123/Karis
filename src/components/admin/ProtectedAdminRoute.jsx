import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log(isAdmin)

  return isAdmin ? <Outlet/> : <Navigate to="/" replace />;
};

export default ProtectedAdminRoute;
