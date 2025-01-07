import React from "react";
import './RecipeCard.css';

const RecipeCard = ({ title, description, time, image, addButtonLabel }) => {
  return (
    <div className="recipe-card">
      <img src={image} alt={title} className="recipe-image" />
      <div className="recipe-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="recipe-info">
          <span className="recipe-time">{time} mins</span>
          <button className="add-to-cart-button">{addButtonLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
