import React from 'react';
import { FaUtensils, FaShoppingCart, FaUserFriends, FaTruck, FaSearch, FaShoppingBag, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Welcome to GroceryNepal</h1>
        <p>Your one-stop destination for delicious recipes and convenient grocery shopping</p>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <p>
          At GroceryNepal, we're dedicated to making cooking and grocery shopping easier and more enjoyable. 
          We provide curated recipes with all the ingredients you need, delivered right to your doorstep.
        </p>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaUtensils />
            </div>
            <h3>Curated Recipes</h3>
            <p>Discover a wide range of delicious recipes from various cuisines</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShoppingCart />
            </div>
            <h3>Easy Ordering</h3>
            <p>Order all ingredients for your chosen recipe with just one click</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUserFriends />
            </div>
            <h3>User-Friendly</h3>
            <p>Simple and intuitive platform designed for everyone</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaTruck />
            </div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable delivery service to your doorstep</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Recipes</h3>
            <p>Explore our collection of delicious recipes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Select Recipe</h3>
            <p>Choose the recipe you want to cook</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Add to Cart</h3>
            <p>All required ingredients are automatically added to your cart</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Checkout</h3>
            <p>Complete your order and wait for delivery</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Get in Touch</h2>
        <p>Have questions or feedback? We'd love to hear from you!</p>
        <div className="contact-info">
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <p>grocerynepal0@gmail.com</p>
          </div>
          <div className="contact-item">
            <FaPhone className="contact-icon" />
            <p>+977 1234567890</p>
          </div>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 