import React, { useState, useEffect } from 'react';
import './ManageRecipes.css';

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', quantity: '', unit: '' });

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ingredients');
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const data = await response.json();
      setAvailableIngredients(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
    } catch (error) {
      alert('Error deleting recipe: ' + error.message);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(item => ({
        ...item,
        ingredient: item.ingredient._id
      }))
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${editingRecipe._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRecipe)
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      const updatedRecipe = await response.json();
      setRecipes(recipes.map(recipe => 
        recipe._id === updatedRecipe._id ? updatedRecipe : recipe
      ));
      setEditingRecipe(null);
    } catch (error) {
      alert('Error updating recipe: ' + error.message);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.ingredient || !newIngredient.quantity || !newIngredient.unit) {
      alert('Please fill in all ingredient fields');
      return;
    }

    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, newIngredient]
    });
    setNewIngredient({ ingredient: '', quantity: '', unit: '' });
  };

  const handleRemoveIngredient = (index) => {
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleUpdateIngredient = (index, field, value) => {
    const updatedIngredients = [...editingRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setEditingRecipe({
      ...editingRecipe,
      ingredients: updatedIngredients
    });
  };

  if (loading) {
    return <div className="loading">Loading recipes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-recipes">
      <h1>Manage Recipes</h1>

      {editingRecipe ? (
        <div className="edit-form">
          <h2>Edit Recipe</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editingRecipe.name}
                onChange={(e) => setEditingRecipe({
                  ...editingRecipe,
                  name: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={editingRecipe.category}
                onChange={(e) => setEditingRecipe({
                  ...editingRecipe,
                  category: e.target.value
                })}
                required
              >
                <option value="Quick Meals">Quick Meals</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Healthy">Healthy</option>
                <option value="Desserts">Desserts</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Drinks">Drinks</option>
                <option value="Lunch/Dinner">Lunch/Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={editingRecipe.difficulty}
                onChange={(e) => setEditingRecipe({
                  ...editingRecipe,
                  difficulty: e.target.value
                })}
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="text"
                value={editingRecipe.time}
                onChange={(e) => setEditingRecipe({
                  ...editingRecipe,
                  time: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingRecipe.description}
                onChange={(e) => setEditingRecipe({
                  ...editingRecipe,
                  description: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group ingredients-section">
              <h3>Ingredients</h3>
              <div className="ingredients-list">
                {editingRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <select
                      value={ingredient.ingredient}
                      onChange={(e) => handleUpdateIngredient(index, 'ingredient', e.target.value)}
                    >
                      <option value="">Select Ingredient</option>
                      {availableIngredients.map(ing => (
                        <option key={ing._id} value={ing._id}>
                          {ing.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => handleUpdateIngredient(index, 'quantity', e.target.value)}
                      placeholder="Quantity"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) => handleUpdateIngredient(index, 'unit', e.target.value)}
                      placeholder="Unit"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="remove-ingredient"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-ingredient">
                <select
                  value={newIngredient.ingredient}
                  onChange={(e) => setNewIngredient({
                    ...newIngredient,
                    ingredient: e.target.value
                  })}
                >
                  <option value="">Select Ingredient</option>
                  {availableIngredients.map(ing => (
                    <option key={ing._id} value={ing._id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({
                    ...newIngredient,
                    quantity: e.target.value
                  })}
                  placeholder="Quantity"
                />
                <input
                  type="text"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({
                    ...newIngredient,
                    unit: e.target.value
                  })}
                  placeholder="Unit"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="add-ingredient-button"
                >
                  Add Ingredient
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setEditingRecipe(null)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map(recipe => (
            <div key={recipe._id} className="recipe-card">
              <img src={recipe.image} alt={recipe.name} className="recipe-image" />
              <div className="recipe-info">
                <h3>{recipe.name}</h3>
                <div className="recipe-meta">
                  <span><i className="fas fa-clock"></i> {recipe.time}</span>
                  <span><i className="fas fa-signal"></i> {recipe.difficulty}</span>
                </div>
                <div className="recipe-category">
                  <i className="fas fa-tag"></i> {recipe.category}
                </div>
                <div className="recipe-actions">
                  <button onClick={() => handleEdit(recipe)} className="edit-button">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button onClick={() => handleDelete(recipe._id)} className="delete-button">
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRecipes; 