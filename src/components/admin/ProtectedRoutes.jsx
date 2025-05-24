import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
  const userToken = localStorage.getItem('userToken');
  console.log(userToken)

  return userToken ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoutes;
