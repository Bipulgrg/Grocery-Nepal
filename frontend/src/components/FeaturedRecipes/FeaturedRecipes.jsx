import React, { useState, useEffect } from "react";
import RecipeCard from "../RecipeCard/RecipeCard";
import './FeaturedRecipes.css';

const FeaturedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        // Take only the first 3 recipes
        setRecipes(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  if (loading) return <div className="featured-recipes">Loading...</div>;
  if (error) return <div className="featured-recipes">Error: {error}</div>;

  return (
    <div className="featured-recipes">
      <div className="recipe-card-container">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            recipeId={recipe._id}
            title={recipe.name}
            description={`${recipe.difficulty} difficulty, ${recipe.time} preparation time`}
            time={recipe.time.split(' ')[0]} // Extract number from time string
            image={recipe.image}
            addButtonLabel="View Recipe"
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedRecipes;
