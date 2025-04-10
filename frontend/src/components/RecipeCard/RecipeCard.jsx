import React from "react";
import { Link } from "react-router-dom";
import './RecipeCard.css';

const RecipeCard = ({ title, description, time, image, addButtonLabel, recipeId }) => {
  return (
    <Link to={`/purchase/${recipeId}`} className="recipe-card-link">
    <div className="recipe-card">
      <img src={image} alt={title} className="recipe-image" />
      <div className="recipe-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="recipe-info">
            <span className="recipe-time"><i className="fas fa-clock"></i> {time} mins</span>
            <button className="add-to-cart-button" onClick={(e) => e.preventDefault()}>
              {addButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
