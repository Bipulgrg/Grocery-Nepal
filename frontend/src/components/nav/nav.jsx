import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './nav.css';

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!token);
    setUserRole(user?.role);
  }, []);

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
            <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
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
            <button className="signout" onClick={handleSignOut}>Sign Out</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
