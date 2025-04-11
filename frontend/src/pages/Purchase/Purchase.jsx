import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Purchase.css';

// Utility function to decode JWT token
const decodeJWT = (token) => {
  try {
    if (!token) {
      console.error('No token provided');
      return null;
    }

    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // Decode the payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    console.log('Decoded token:', decoded); // Debug log

    // Check for different possible user ID fields
    if (decoded.userId) return decoded;
    if (decoded.id) return decoded;
    if (decoded._id) return decoded;
    
    console.error('No user ID found in token');
    return null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    address: '',
    phoneNumber: ''
  });
  const [orderError, setOrderError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in and get role
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token) {
      navigate('/signin', { state: { from: `/purchase/${id}` } });
      return;
    }

    setUserRole(user?.role);
    fetchRecipe();
  }, [id, navigate]);

  useEffect(() => {
    if (recipe) {
      const allIngredientIds = recipe.ingredients.map(item => item.ingredient._id);
      setSelectedIngredients(new Set(allIngredientIds));
    }
  }, [recipe]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('Recipe not found');
        throw new Error('Failed to fetch recipe');
      }
      
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const toggleIngredient = (ingredientId) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedIngredients(newSelected);
  };

  const calculateSubtotal = () => {
    if (!recipe) return 0;
    return recipe.ingredients.reduce((total, item) => {
      if (selectedIngredients.has(item.ingredient._id)) {
        const ingredientPrice = item.ingredient.price || 0;
        return total + (ingredientPrice * item.quantity * quantity);
      }
      return total;
    }, 0);
  };

  const handleEsewaPayment = async (e) => {
    e.preventDefault();
    setOrderError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { state: { from: `/purchase/${id}` } });
        return;
      }

      // Decode JWT to get userId
      const decodedToken = decodeJWT(token);
      console.log('Token from localStorage:', token); // Debug log
      console.log('Decoded token in handleEsewaPayment:', decodedToken); // Debug log

      if (!decodedToken) {
        throw new Error('Invalid authentication token');
      }

      // Get userId from any of the possible fields
      const userId = decodedToken.userId || decodedToken.id || decodedToken._id;
      if (!userId) {
        throw new Error('User ID not found in token');
      }

      // Validate form
      if (!orderDetails.customerName || !orderDetails.address || !orderDetails.phoneNumber) {
        setOrderError('Please fill in all fields');
        return;
      }

      // Create order data
      const selectedIngredientsList = recipe.ingredients
        .filter(item => selectedIngredients.has(item.ingredient._id))
        .map(item => ({
          ingredient: item.ingredient._id,
          quantity: item.quantity * quantity
        }));

      const orderData = {
        customerName: orderDetails.customerName,
        address: orderDetails.address,
        phoneNumber: orderDetails.phoneNumber,
        userId: userId, // Use the extracted userId
        recipe: recipe._id,
        ingredients: selectedIngredientsList,
        totalAmount: calculateSubtotal(),
        servings: quantity,
        paymentMethod: 'esewa',
        status: 'pending'
      };

      // Save order details to localStorage
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Generate a unique order ID
      const orderId = `ORDER-${Date.now()}`;

      // Initiate eSewa payment
      const response = await fetch('http://localhost:5000/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: calculateSubtotal(),
          productId: orderId,
          orderDetails: orderData
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to eSewa payment page
        window.location.href = data.url;
      } else {
        setOrderError('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setOrderError('An error occurred while processing your payment. Please try again.');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { state: { from: `/purchase/${id}` } });
        return;
      }

      // Decode JWT to get userId
      const decodedToken = decodeJWT(token);
      console.log('Token from localStorage:', token);
      console.log('Decoded token in handleOrderSubmit:', decodedToken);

      if (!decodedToken) {
        throw new Error('Invalid authentication token');
      }

      // Get userId from the decoded token
      const userId = decodedToken.userId;
      if (!userId) {
        throw new Error('User ID not found in token');
      }

      // Validate form
      if (!orderDetails.customerName || !orderDetails.address || !orderDetails.phoneNumber) {
        setOrderError('Please fill in all fields');
        return;
      }

      const selectedIngredientsList = recipe.ingredients
        .filter(item => selectedIngredients.has(item.ingredient._id))
        .map(item => ({
          ingredient: item.ingredient._id,
          quantity: item.quantity * quantity
        }));

      // For Cash on Delivery
      if (paymentMethod === 'cod') {
        const orderData = {
          customerName: orderDetails.customerName,
          address: orderDetails.address,
          phoneNumber: orderDetails.phoneNumber,
          userId: userId, // Include userId from decoded token
          recipe: recipe._id,
          ingredients: selectedIngredientsList,
          totalAmount: calculateSubtotal(),
          servings: quantity,
          paymentMethod: 'cod',
          status: 'pending',
          paymentDetails: {
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            paymentDate: new Date().toISOString()
          }
        };

        console.log('Sending COD order data:', orderData); // Debug log

        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData); // Debug log

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to create order');
        }

        navigate('/payment/success');
      }
      // For eSewa payment
      else if (paymentMethod === 'esewa') {
        await handleEsewaPayment(e);
      }
    } catch (error) {
      console.error('Order error:', error);
      setOrderError(error.message || 'Failed to process order');
    }
  };

  const handleCheckoutClick = () => {
    if (userRole === 'admin') {
      setOrderError('Admin users are not allowed to make purchases. Please use a regular user account.');
      return;
    }
    setShowCheckoutForm(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/recipes')} className="back-button">
              Back to Recipes
            </button>
            <button onClick={fetchRecipe} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Recipe Not Found</h2>
          <p>The recipe you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/recipes')} className="back-button">
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const deliveryFee = 100;
  const total = subtotal + deliveryFee;

  return (
    <div className="purchase-container">
      <div className="recipe-details">
        <h1>{recipe.name}</h1>
        <div className="recipe-meta">
          <span><i className="far fa-clock"></i> {recipe.time}</span>
          <span><i className="fas fa-utensils"></i> {quantity} serving{quantity > 1 ? 's' : ''}</span>
          <span className="difficulty"><i className="fas fa-signal"></i> {recipe.difficulty}</span>
          <span className="category"><i className="fas fa-tag"></i> {recipe.category}</span>
        </div>
        
        <div className="recipe-image">
          <img src={recipe.image} alt={recipe.name} />
        </div>

        <div className="recipe-description">
          <h2>Instructions</h2>
          <p>{recipe.description}</p>
        </div>

        <div className="ingredients-section">
          <h2>Ingredients</h2>
          <div className="ingredients-list">
            {recipe.ingredients.map((item) => (
              <div key={item.ingredient._id} className="ingredient-item">
                <span className="ingredient-name">{item.ingredient.name}</span>
                <span className="ingredient-quantity">
                  {item.quantity} {item.ingredient.unit}
                </span>
                <span className="ingredient-price">
                  Rs. {(item.ingredient.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shopping-cart">
        <h2>Shopping Cart</h2>
        <div className="cart-header">
          <span>{recipe.name} Ingredients</span>
          <div className="quantity-control">
            <button onClick={() => handleQuantityChange(-1)}>−</button>
            <span>{quantity}</span>
            <button onClick={() => handleQuantityChange(1)}>+</button>
          </div>
        </div>

        <div className="cart-items">
          {recipe.ingredients.map((item) => (
            <div 
              key={item.ingredient._id} 
              className={`cart-item ${selectedIngredients.has(item.ingredient._id) ? 'selected' : 'deselected'}`}
            >
              <div className="cart-item-header">
                <input
                  type="checkbox"
                  checked={selectedIngredients.has(item.ingredient._id)}
                  onChange={() => toggleIngredient(item.ingredient._id)}
                />
                <span className="ingredient-name">{item.ingredient.name}</span>
              </div>
              <div className="cart-item-details">
                <span className="ingredient-quantity">
                  {item.quantity * quantity} {item.ingredient.unit}
                </span>
                <span className="ingredient-price">
                  Rs. {(item.ingredient.price * item.quantity * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>Rs. {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        {orderError && (
          <div className="error-message">
            {orderError}
          </div>
        )}

        <button 
          className="checkout-button"
          disabled={selectedIngredients.size === 0}
          onClick={handleCheckoutClick}
        >
          Proceed to Checkout
        </button>
      </div>

      {showCheckoutForm && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h2>Delivery Information</h2>
            <form onSubmit={handleOrderSubmit} className="cod-form">
              <div className="form-group">
                <label htmlFor="customerName">Full Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={orderDetails.customerName}
                  onChange={(e) => setOrderDetails({ ...orderDetails, customerName: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Delivery Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={orderDetails.address}
                  onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
                  required
                  placeholder="Enter your complete delivery address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={orderDetails.phoneNumber}
                  onChange={(e) => setOrderDetails({ ...orderDetails, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="payment-methods">
                <h3>Payment Method</h3>
                <div className="payment-options">
                  <div className="payment-option">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <label htmlFor="cod">
                      <i className="fas fa-money-bill-wave"></i>
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <div className="payment-option">
                    <input
                      type="radio"
                      id="esewa"
                      name="paymentMethod"
                      value="esewa"
                      checked={paymentMethod === 'esewa'}
                      onChange={() => setPaymentMethod('esewa')}
                    />
                    <label htmlFor="esewa">
                      <i className="fas fa-wallet"></i>
                      Pay with eSewa
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="confirm-button"
                  disabled={processingPayment}
                >
                  {processingPayment 
                    ? 'Processing...' 
                    : paymentMethod === 'cod' 
                      ? 'Place Order' 
                      : 'Proceed to Payment'}
                </button>
              </div>
            </form>
            <button 
              className="close-modal"
              onClick={() => setShowCheckoutForm(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchase; 