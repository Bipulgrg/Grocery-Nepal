import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './nav.css';

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>GroceryNepal</h1>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/recipes">Recipes</Link></li>
        <li><Link to="/categories">Categories</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <div className="nav-buttons">
        {!isLoggedIn ? (
          <>
            <Link to="/signin">
              <button className="signin">Sign In</button>
            </Link>
            <Link to="/signup">
              <button className="signup">Sign Up</button>
            </Link>
          </>
        ) : (
          <button className="signout" onClick={handleSignOut}>Sign Out</button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
