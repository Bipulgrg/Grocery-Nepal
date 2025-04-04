import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./RecipeList.css";

const ITEMS_PER_PAGE = 6;

const RecipeList = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const categories = [
    'All',
    'Quick Meals',
    'Vegetarian',
    'Healthy',
    'Desserts',
    'Breakfast',
    'Drinks',
    'Snacks'
  ];

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === 'All' ? '' : category);
    setCurrentPage(1); // Reset to first page on category change
  };

  // Update state when URL parameters change
  useEffect(() => {
    setSearch(initialSearch);
    setSearchInput(initialSearch);
    setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  // Add retry function
  const handleRetry = () => {
    setError(null);
    setRetryCount(prevCount => prevCount + 1);
  };

  // Fetch recipes based on search and category filters
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/recipes';
        const params = new URLSearchParams();
        
        if (search) {
          params.append('query', search);
        }
        
        // The category might be passed in different cases from different pages
        // Convert to standard format for consistency
        if (selectedCategory) {
          // First letter uppercase, rest lowercase (Title Case)
          const formattedCategory = selectedCategory.charAt(0).toUpperCase() + 
                                   selectedCategory.slice(1).toLowerCase();
          params.append('category', formattedCategory);
          console.log("Using formatted category:", formattedCategory);
        }
        
        // Use /search endpoint only for text searches, use root endpoint for category filtering
        if (search) {
          url += `/search?${params.toString()}`;
        } else if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching recipes with URL:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        console.log("Received recipes:", data);
        setRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [search, selectedCategory, retryCount]);

  const totalPages = Math.ceil(recipes.length / ITEMS_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="loading-container"><div className="loader"></div><p>Loading recipes...</p></div>;
  if (error) return (
    <div className="error-container">
      <div className="error-message">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Error loading recipes</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={handleRetry}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <form className="recipe-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <button type="submit" className="recipe-search-btn">
          <i className="fas fa-search"></i>
        </button>
      </form>

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === (category === 'All' ? '' : category) ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {recipes.length === 0 ? (
        <div className="no-recipes-found">
          <p>No recipes found. Try a different search or category.</p>
        </div>
      ) : (
        <>
          <div className="recipe-list">
            {paginatedRecipes.map((recipe) => (
              <Link to={`/purchase/${recipe._id}`} key={recipe._id} className="recipe-link">
                <div className="recipe-card">
                  <img src={recipe.image} alt={recipe.name} className="recipe-image" />
                  <div className="recipe-info">
                    <span className="time-tag">{recipe.time}</span>
                    <span className="difficulty">{recipe.difficulty}</span>
                    <h3>{recipe.name}</h3>
                    <span className="category-tag">{recipe.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeList;
