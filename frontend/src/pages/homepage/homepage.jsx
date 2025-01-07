import React from "react";
import './homePage.css';
import PopularCategories from "../../components/PopularCategories/PopularCategories";
import FeaturedRecipes from "../../components/FeaturedRecipes/FeaturedRecipes";

const HomePage = () => {
  return (
    <div className="homepage">
      <h1>Popular Categories</h1>
      <PopularCategories />
      <div className="featureRecipe">
        <h2>Featured Recipes</h2>
        <FeaturedRecipes />
      </div>
    </div>
  );
};

export default HomePage;
