import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2>GroceryNepal</h2>
          <p>Your one-stop solution for recipes and grocery shopping.</p>
        </div>
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section categories">
          <h3>Categories</h3>
          <ul>
            <li>Quick Meals</li>
            <li>Vegetarian</li>
            <li>Healthy</li>
            <li>Desserts</li>
          </ul>
        </div>
        <div className="footer-section social">
          <h3>Connect With Us</h3>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2024 GroceryNepal. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
