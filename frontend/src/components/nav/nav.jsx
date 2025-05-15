import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './nav.css';

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const profileMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!token);
    setUserRole(user?.role);

    // Fetch cart data if logged in
    if (token) {
      fetchCartData(token);
    }

    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Function to fetch cart data
  const fetchCartData = async (token) => {
    try {
      setCartLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Calculate total number of items in cart
        const itemCount = data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemCount(itemCount);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleAdminDashboard = () => {
    if (userRole === 'admin') {
      navigate('/admindashboard');
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>GroceryNepal</h1>
      </div>
      
      <div className="menu-toggle" onClick={toggleMenu}>
        <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>
      
      <div className={`nav-container ${menuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link></li>
          <li><Link to="/categories" onClick={() => setMenuOpen(false)}>Categories</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          {isLoggedIn && userRole !== 'admin' && (
            <>
              <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
              <li>
                <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-shopping-cart"></i>
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="cart-count">{cartItemCount}</span>
                  )}
                </Link>
              </li>
            </>
          )}
          {userRole === 'admin' && (
            <li>
              <button 
                className="admin-dashboard-link"
                onClick={() => {
                  handleAdminDashboard();
                  setMenuOpen(false);
                }}
              >
                Admin Dashboard
              </button>
            </li>
          )}
        </ul>
        <div className="nav-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/signin" onClick={() => setMenuOpen(false)}>
                <button className="signin">Sign In</button>
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                <button className="signup">Sign Up</button>
              </Link>
            </>
          ) : (
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button className="profile-button" onClick={toggleProfileMenu}>
                <i className="fas fa-user-circle"></i>
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" onClick={() => {
                    setProfileMenuOpen(false);
                    setMenuOpen(false);
                  }}>
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <button onClick={handleSignOut}>
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
