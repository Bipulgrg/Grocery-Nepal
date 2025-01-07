import React from "react";
import './PopularCategories.css';

const PopularCategories = () => {
  return (
    <div className="popular-categories">
      <div className="category">
        <i className="fa fa-hamburger icon-green"></i>
        <p>Quick Meals</p>
      </div>
      <div className="category">
        <i className="fa fa-leaf icon-green"></i>
        <p>Vegetarian</p>
      </div>
      <div className="category">
        <i className="fa fa-carrot icon-green"></i>
        <p>Healthy</p>
      </div>
      <div className="category">
        <i className="fa fa-birthday-cake icon-green"></i>
        <p>Desserts</p>
      </div>
      <div className="category">
        <i className="fa fa-cocktail icon-green"></i>
        <p>Drinks</p>
      </div>
    </div>
  );
};

export default PopularCategories;
