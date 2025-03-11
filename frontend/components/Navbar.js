'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { User, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCartClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push('/register');
    }
  };

  // Function to scroll to items section on the home page
  const scrollToItems = (e) => {
    e.preventDefault();
  
    if (window.location.pathname !== '/') {
      router.push('/');
  
      // Ensure scrolling happens after navigation
      const handleRouteChange = () => {
        const itemsSection = document.getElementById('items-section');
        if (itemsSection) {
          itemsSection.scrollIntoView({ behavior: 'smooth' });
        }
        router.events?.off('routeChangeComplete', handleRouteChange);
      };
  
      router.events?.on('routeChangeComplete', handleRouteChange);
    } else {
      const itemsSection = document.getElementById('items-section');
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <nav style={{ 
      display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '10px 25px',
  backgroundColor: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  position: 'relative',
  width: "96vw", // Full width
  margin: "0",
     
    }}>
      {/* Logo with Rhombus Symbol */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: '1.5rem',
          display: 'flex', 
          alignItems: 'center',
          lineHeight: '1.2'
        }}>
          GIVA <span style={{ marginLeft: '5px' }}>◆</span>
        </span>
        <span style={{ 
          fontSize: '0.85rem',
          color: '#666',
          marginTop: '-2px'
        }}>Fine Silver Jewellery</span>
      </div>
      
      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link href="/">
          <button style={{
            backgroundColor: '#AB2828',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#AB2828'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#A13D4B'}
          >
            Home
          </button>
        </Link>
        
        <button 
          onClick={scrollToItems}
          style={{
            backgroundColor: '#AB2828',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#AB2828'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#A13D4B'}
        >
          Collections
        </button>
      </div>
      
      {/* Icons Section */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
        
        {/* User Icon with Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <User 
            style={{ width: '24px', height: '24px', cursor: 'pointer' }} 
            onClick={() => setShowDropdown((prev) => !prev)}
          />

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              backgroundColor: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              borderRadius: '6px',
              padding: '10px',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10
            }}>
              {!isLoggedIn ? (
                <>
                  <Link href="/login">
                    <span style={{
                      display: 'block',
                      padding: '10px',
                      color: '#333',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      Sign In
                    </span>
                  </Link>
                  <Link href="/register">
                    <span style={{
                      display: 'block',
                      padding: '10px',
                      color: '#333',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      Register
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile">
                    <span style={{
                      display: 'block',
                      padding: '10px',
                      color: '#333',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      My Profile
                    </span>
                  </Link>
                  <span 
                    style={{
                      display: 'block',
                      padding: '10px',
                      color: '#333',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      if (window.location.pathname !== '/') {
                        router.push('/');
                      }
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    Sign Out
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Shopping Bag Icon - Now checks login status */}
        <div onClick={handleCartClick} style={{ cursor: 'pointer' }}>
          {isLoggedIn ? (
            <Link href="/cart">
              <ShoppingBag style={{ width: '24px', height: '24px' }} />
            </Link>
          ) : (
            <ShoppingBag style={{ width: '24px', height: '24px' }} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;