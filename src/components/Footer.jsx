import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      <div>
        <h5 className="text-lg font-semibold mb-2">EventEase</h5>
        <p>Book, manage and enjoy your events like never before.</p>
      </div>
      <div>
        <h5 className="text-lg font-semibold mb-2">Contact</h5>
        <p>Email: support@eventease.com</p>
        <p>Phone: +254 712 345 678</p>
      </div>
      <div>
        <h5 className="text-lg font-semibold mb-2">Follow Us</h5>
        <p>Instagram | Twitter | Facebook</p>
      </div>
    </div>
    <div className="text-center mt-6 text-xs text-gray-400">
      &copy; {new Date().getFullYear()} EventEase. All rights reserved.
    </div>
  </footer>
  )
}

export default Footer