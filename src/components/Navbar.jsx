import React, { useEffect, useState } from 'react'
import { CiLogin, CiLogout } from 'react-icons/ci';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const [user, setUser] = useState(null);
      const [token, setToken] = useState(null);
        const [loading, setLoading] = useState(true);

        const navigate = useNavigate()
      
    useEffect(() => {
        const loadUserAndEvents = async () => {
          try {
            const storedUserToken = localStorage.getItem('userToken');
    
            if (!storedUserToken) {
              setUser(null);
              setToken(null);
            } else {
              try {
                // Decode token payload
                const tokenParts = storedUserToken.split('.');
                if (tokenParts.length !== 3) throw new Error('Invalid token format');
    
                const payloadBase64 = tokenParts[1];
                const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
                const parsedPayload = JSON.parse(decodedPayload);
    
                // Extract both email and userId (_id)
                const userEmail = parsedPayload.email;
                const userId = parsedPayload._id || parsedPayload.id || parsedPayload.userId;
    
                if (userEmail && userId) {
                  setUser({ email: userEmail, _id: userId });
                  setToken(storedUserToken);
                } else {
                  setUser(null);
                  setToken(null);
                }
              } catch (error) {
                console.error('Error decoding/parsing userToken:', error);
                setUser(null);
                setToken(null);
              }
            }
    
          } catch (error) {
            console.error('Error loading data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        loadUserAndEvents();
      }, []);

      const handleLogout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
        setToken(null);
        navigate('/')
      };

      if(loading) return <p>Loading...</p>
  return (
    <>
        <nav className='flex items-center justify-between bg-[#0a3882] py-6 px-6'>
            <div className='flex gap-2 items-center'>
                <Link to={'/home'} className='text-3xl'>Kariz<span className='text-blue-400 font-black'>Events</span></Link> |
                <span>
                {user ? `Signed in as ${user.email}` : 'Signin to book events'}
                </span>
            </div>

            <ul className='flex items-center justify-between gap-4 text-lg'> 
                <NavLink to='/events' className='text-blue-300 active:text-blue-100 active:border-b-blue-200'>Events</NavLink>
                {user ? (<button onClick={handleLogout} className='bg-blue-400 text-gray-900 flex items-center gap-2'>
                    Logout
                    <CiLogout />
                </button>) : (
                    <Link to='/signin'><button className='bg-blue-400 text-gray-900 flex items-center gap-2'>
                    Login
                    <CiLogin />
                </button></Link>
                ) }
            </ul>
        </nav>
    </>
  )
}

export default Navbar