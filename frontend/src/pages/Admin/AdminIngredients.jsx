import React, { useState, useEffect } from 'react';
import './Admin.css';

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'kg',
    stock: '',
    stockUnit: 'kg'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      setError('Failed to fetch ingredients');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'piece', label: 'Piece' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'l', label: 'Liter (l)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          price: formData.price,
          unit: formData.unit,
          stock: formData.stock,
          stockUnit: formData.stockUnit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add ingredient');
      }

      setSuccess('Ingredient added successfully!');
      setFormData({
        name: '',
        price: '',
        unit: 'kg',
        stock: '',
        stockUnit: 'kg'
      });
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <h2>Add Ingredients</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Ingredient Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter ingredient name"
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <div className="input-with-unit">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="Enter price"
              step="0.01"
              min="0"
            />
            <span>per</span>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
            >
              {unitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Stock</label>
          <div className="input-with-unit">
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              placeholder="Enter stock quantity"
              step="0.01"
              min="0"
            />
            <select
              name="stockUnit"
              value={formData.stockUnit}
              onChange={handleInputChange}
              required
            >
              {unitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Add Ingredient
        </button>
      </form>

      <div className="ingredients-list">
        <h3>Current Ingredients</h3>
        <div className="ingredients-grid">
          {ingredients.map((ingredient) => (
            <div key={ingredient._id} className="ingredient-card">
              <h4>{ingredient.name}</h4>
              <div className="ingredient-details">
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">
                    Rs.{Number(ingredient.price).toFixed(2)}/{ingredient.unit}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stock:</span>
                  <span className="detail-value">
                    {Number(ingredient.stock).toFixed(2)} {ingredient.stockUnit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminIngredients; 