import React from 'react';
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
  const categories = [
    {
      id: 1,
      name: 'Quick Meals',
      icon: <FaUtensils />,
      items: 20
    },
    {
      id: 2,
      name: 'Vegetarian',
      icon: <FaLeaf />,
      items: 20
    },
    {
      id: 3,
      name: 'Healthy',
      icon: <FaHeartbeat />,
      items: 40
    },
    {
      id: 4,
      name: 'Desserts',
      icon: <FaBirthdayCake />,
      items: 20
    },
    {
      id: 5,
      name: 'Breakfast',
      icon: <FaCoffee />,
      items: 10
    },
    {
      id: 6,
      name: 'Drinks',
      icon: <FaGlassMartiniAlt />,
      items: 30
    },
    {
      id: 7,
      name: 'Snacks',
      icon: <FaCookie />,
      items: 15
    }
  ];

  return (
    <div className="categories-container">
      <h2 className="categories-title">Browse Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-icon-container">
              <span className="category-icon">{category.icon}</span>
            </div>
            <h3 className="category-name">{category.name}</h3>
            <p className="category-items">{category.items} items</p>
            <Link to={`/recipes?category=${category.name}`} className="browse-category">
              Browse Category <span className="arrow">→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 