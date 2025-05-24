import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import AdminNavbar from '../components/AdminNavbar'

function AdminLayout() {
  return (
    <div className='w-full'>
      <AdminNavbar />
      <main className="">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AdminLayout
