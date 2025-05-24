import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Weezer_Bethlehem_2019_5.jpg/1200px-Weezer_Bethlehem_2019_5.jpg',
    title: 'Book Your Dream Event Hassle-Free',
    description: 'From weddings to conferences – we make it easy to plan, book, and manage events.',
  },
  {
    image: 'https://www.thetamarindtree.in/wp-content/uploads/2024/09/SAL04106-1500x1000.jpg',
    title: 'Top Venues, Best Prices',
    description: 'Discover hundreds of curated venues with flexible pricing and easy booking.',
  },
  {
    image: 'https://www.oyorooms.com/blog/wp-content/uploads/2018/02/event.jpg',
    title: 'Corporate & Social Events Made Easy',
    description: 'Focus on your event while we handle the logistics.',
  },
]

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="font-sans text-gray-800">
      {/* Slideshow */}
      <div className="relative w-full h-[60vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-20' : 'opacity-0 z-10'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {slide.title}
            </h2>
            <p className="text-white text-lg max-w-2xl mb-6">{slide.description}</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-blue-400 hover:bg-blue-500 transition-all duration-300 text-gray-800 font-semibold py-3 px-6 rounded-full"
            >
              Explore Events
            </button>
          </div>
        </div>
      ))}
    </div>


      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100 text-center">
  <h3 className="text-4xl font-extrabold mb-12 text-gray-800">Why Choose KarizEvents?</h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
    <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition duration-300 border-t-4 border-blue-500">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-2xl font-bold">
          ✅
        </div>
      </div>
      <h4 className="text-2xl font-semibold mb-3">Easy Booking</h4>
      <p className="text-gray-600">Book venues and services in just a few clicks – completely online and stress-free.</p>
    </div>

    <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition duration-300 border-t-4 border-green-500">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 flex items-center justify-center rounded-full text-2xl font-bold">
          🔒
        </div>
      </div>
      <h4 className="text-2xl font-semibold mb-3">Verified Vendors</h4>
      <p className="text-gray-600">All vendors are verified and reviewed by our team to ensure the best quality.</p>
    </div>

    <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition duration-300 border-t-4 border-purple-500">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 flex items-center justify-center rounded-full text-2xl font-bold">
          🕒
        </div>
      </div>
      <h4 className="text-2xl font-semibold mb-3">24/7 Support</h4>
      <p className="text-gray-600">Our support team is available around the clock to help with any issues.</p>
    </div>
  </div>
</section>


     
    </div>
  )
}

export default LandingPage
