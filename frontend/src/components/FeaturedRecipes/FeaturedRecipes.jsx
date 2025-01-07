import React from "react";
import RecipeCard from "../RecipeCard/RecipeCard";
import './FeaturedRecipes.css';

const FeaturedRecipes = () => {
  return (
    <div className="featured-recipes">
      <div className="recipe-card-container">
        <RecipeCard
          title="Chicken Momo"
          description="A simple yet delicious dish ready in about 15 min"
          time="15"
          image="/chicken-momo.png"
          addButtonLabel="Add to Cart"
        />
        <RecipeCard
          title="Grilled Chicken Salad"
          description="Fresh and healthy salad with grilled chicken breast"
          time="20"
          image="/grilled-chicken-salad.jpg"
          addButtonLabel="Add to Cart"
        />
        <RecipeCard
          title="Chocolate Cake"
          description="Indulge in this rich and moist chocolate cake"
          time="30"
          image="/chocolate-cake.jpg"
          addButtonLabel="Add to Cart"
        />
      </div>
    </div>
  );
};

export default FeaturedRecipes;
