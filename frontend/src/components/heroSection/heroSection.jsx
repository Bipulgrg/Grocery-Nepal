import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './heroSection.css';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/recipes?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Find Perfect Recipes & Get Your Groceries Delivered</h2>
        <p>Discover thousands of recipes and get all ingredients delivered to your doorstep</p>
        
        <form onSubmit={handleSearch} className="search-bar-container">
          <input
            type="text"
            placeholder="Search for recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
