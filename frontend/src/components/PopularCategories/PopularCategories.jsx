import React from "react";
import { Link } from "react-router-dom";
import './PopularCategories.css';

const PopularCategories = () => {
  const categories = [
    { id: 1, name: "Quick Meals", icon: "fa-hamburger" },
    { id: 2, name: "Vegetarian", icon: "fa-leaf" },
    { id: 3, name: "Healthy", icon: "fa-carrot" },
    { id: 4, name: "Desserts", icon: "fa-birthday-cake" },
    { id: 5, name: "Drinks", icon: "fa-cocktail" }
  ];

  return (
    <div className="popular-categories">
      {categories.map(category => (
        <Link 
          to={`/recipes?category=${category.name}`} 
          key={category.id} 
          className="category-link"
        >
          <div className="category">
            <i className={`fa ${category.icon} icon-green`}></i>
            <p>{category.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PopularCategories;
