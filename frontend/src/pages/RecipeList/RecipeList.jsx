import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./RecipeList.css";

const ITEMS_PER_PAGE = 6;

const RecipeList = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  useEffect(() => {
    setSearch(initialSearch);
    setSearchInput(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const url = search
          ? `http://localhost:5000/api/recipes/search?query=${encodeURIComponent(search)}`
          : 'http://localhost:5000/api/recipes';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [search]);

  const totalPages = Math.ceil(recipes.length / ITEMS_PER_PAGE);
  const paginatedRecipes = recipes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

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
      <div className="recipe-list">
        {paginatedRecipes.map((recipe) => (
          <div className="recipe-card" key={recipe._id}>
            <img src={recipe.image} alt={recipe.name} className="recipe-image" />
            <div className="recipe-info">
              <span className="time-tag">{recipe.time}</span>
              <span className="difficulty">{recipe.difficulty}</span>
              <h3>{recipe.name}</h3>
              <a href="#" className="add-to-cart">
                Add to Cart
              </a>
            </div>
          </div>
        ))}
      </div>
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
    </div>
  );
};

export default RecipeList;
