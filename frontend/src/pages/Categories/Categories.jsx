import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUtensils, 
  FaLeaf, 
  FaHeartbeat, 
  FaBirthdayCake, 
  FaCoffee, 
  FaGlassMartiniAlt, 
  FaCookie 
} from 'react-icons/fa';
import './Categories.css';

const Categories = () => {
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/recipes/category-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch category statistics');
        }
        const data = await response.json();
        setCategoryStats(data);
      } catch (err) {
        console.error('Error fetching category stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  const categories = [
    {
      id: 1,
      name: 'Quick Meals',
      icon: <FaUtensils />,
    },
    {
      id: 2,
      name: 'Vegetarian',
      icon: <FaLeaf />,
    },
    {
      id: 3,
      name: 'Healthy',
      icon: <FaHeartbeat />,
    },
    {
      id: 4,
      name: 'Desserts',
      icon: <FaBirthdayCake />,
    },
    {
      id: 5,
      name: 'Breakfast',
      icon: <FaCoffee />,
    },
    {
      id: 6,
      name: 'Drinks',
      icon: <FaGlassMartiniAlt />,
    },
    {
      id: 7,
      name: 'Snacks',
      icon: <FaCookie />,
    }
  ];

  if (loading) {
    return (
      <div className="categories-container">
        <h2 className="categories-title">Browse Categories</h2>
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <h2 className="categories-title">Browse Categories</h2>
        <div className="error">Error loading categories: {error}</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <h2 className="categories-title">Browse Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => {
          const categoryStat = categoryStats.find(stat => stat.name === category.name);
          const itemCount = categoryStat ? categoryStat.value : 0;
          
          return (
            <div key={category.id} className="category-card">
              <div className="category-icon-container">
                <span className="category-icon">{category.icon}</span>
              </div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-items">{itemCount} items</p>
              <Link to={`/recipes?category=${category.name}`} className="browse-category">
                Browse Category <span className="arrow">→</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories; 