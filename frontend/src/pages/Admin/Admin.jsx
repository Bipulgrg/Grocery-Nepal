import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Quick Meals',
    difficulty: 'Easy',
    time: '',
    description: ''
  });
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
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

  const handleIngredientChange = (e) => {
    const ingredientId = e.target.value;
    const quantity = 1; // Default quantity
    
    if (!selectedIngredients.some(item => item.ingredient === ingredientId)) {
      setSelectedIngredients([
        ...selectedIngredients,
        { ingredient: ingredientId, quantity }
      ]);
    }
  };

  const handleQuantityChange = (ingredientId, quantity) => {
    setSelectedIngredients(selectedIngredients.map(item => 
      item.ingredient === ingredientId 
        ? { ...item, quantity: Number(quantity) }
        : item
    ));
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(
      item => item.ingredient !== ingredientId
    ));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!image) {
        setError('Please select an image');
        return;
      }

      if (selectedIngredients.length === 0) {
        setError('Please add at least one ingredient');
        return;
      }

      if (!formData.name || !formData.time || !formData.description) {
        setError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to add a recipe');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', image);
      formDataToSend.append('ingredients', JSON.stringify(selectedIngredients));

      console.log('Sending recipe data:', {
        name: formData.name,
        category: formData.category,
        difficulty: formData.difficulty,
        time: formData.time,
        description: formData.description,
        ingredients: selectedIngredients
      });

      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add recipe');
      }

      setSuccess('Recipe added successfully!');
      setFormData({
        name: '',
        category: 'Quick Meals',
        difficulty: 'Easy',
        time: '',
        description: ''
      });
      setSelectedIngredients([]);
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError(err.message || 'Failed to add recipe. Please try again.');
    }
  };

  return (
    <div className="admin-container">
      <h2>Add New Recipe</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Recipe Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter recipe name"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
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
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Preparation Time</label>
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            placeholder="e.g., 30 min"
          />
        </div>

        <div className="form-group">
          <label>Recipe Instructions</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Write detailed instructions on how to prepare this recipe..."
            rows="6"
          />
        </div>

        <div className="form-group">
          <label>Ingredients</label>
          <select
            onChange={handleIngredientChange}
            value=""
          >
            <option value="">Select an ingredient</option>
            {ingredients.map(ingredient => (
              <option key={ingredient._id} value={ingredient._id}>
                {ingredient.name} (${ingredient.price}/{ingredient.unit})
              </option>
            ))}
          </select>

          {selectedIngredients.length > 0 && (
            <div className="selected-ingredients">
              {selectedIngredients.map(({ ingredient: ingredientId, quantity }) => {
                const ingredientDetails = ingredients.find(i => i._id === ingredientId);
                return (
                  <div key={ingredientId} className="selected-ingredient">
                    <span>{ingredientDetails?.name}</span>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(ingredientId, e.target.value)}
                      min="0"
                      step="any"
                    />
                    <span>{ingredientDetails?.unit}</span>
                    <button 
                      type="button" 
                      onClick={() => removeIngredient(ingredientId)}
                      className="remove-ingredient"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Recipe Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Recipe preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Add Recipe
        </button>
      </form>
    </div>
  );
};

export default Admin; 