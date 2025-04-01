import React, { useState, useEffect } from 'react';
import './ManageIngredients.css';

const ManageIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ingredients');
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ingredientId) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ingredients/${ingredientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete ingredient');
      }

      setIngredients(ingredients.filter(ingredient => ingredient._id !== ingredientId));
    } catch (error) {
      alert('Error deleting ingredient: ' + error.message);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/ingredients/${editingIngredient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingIngredient)
      });

      if (!response.ok) {
        throw new Error('Failed to update ingredient');
      }

      const updatedIngredient = await response.json();
      setIngredients(ingredients.map(ingredient => 
        ingredient._id === updatedIngredient._id ? updatedIngredient : ingredient
      ));
      setEditingIngredient(null);
    } catch (error) {
      alert('Error updating ingredient: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading ingredients...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-ingredients">
      <h1>Manage Ingredients</h1>

      {editingIngredient ? (
        <div className="edit-form">
          <h2>Edit Ingredient</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editingIngredient.name}
                onChange={(e) => setEditingIngredient({
                  ...editingIngredient,
                  name: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={editingIngredient.price}
                onChange={(e) => setEditingIngredient({
                  ...editingIngredient,
                  price: parseFloat(e.target.value)
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={editingIngredient.unit}
                onChange={(e) => setEditingIngredient({
                  ...editingIngredient,
                  unit: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={editingIngredient.stock}
                onChange={(e) => setEditingIngredient({
                  ...editingIngredient,
                  stock: parseInt(e.target.value)
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Unit</label>
              <input
                type="text"
                value={editingIngredient.stockUnit}
                onChange={(e) => setEditingIngredient({
                  ...editingIngredient,
                  stockUnit: e.target.value
                })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setEditingIngredient(null)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="ingredients-grid">
          {ingredients.map(ingredient => (
            <div key={ingredient._id} className="ingredient-card">
              <div className="ingredient-info">
                <h3>{ingredient.name}</h3>
                <div className="ingredient-meta">
                  <span><i className="fas fa-tag"></i> £{ingredient.price.toFixed(2)} per {ingredient.unit}</span>
                  <span><i className="fas fa-box"></i> {ingredient.stock} {ingredient.stockUnit}</span>
                </div>
                <div className="ingredient-actions">
                  <button onClick={() => handleEdit(ingredient)} className="edit-button">
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button onClick={() => handleDelete(ingredient._id)} className="delete-button">
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

export default ManageIngredients; 