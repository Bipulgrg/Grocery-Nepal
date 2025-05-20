import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    address: '',
    phoneNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Function to fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { state: { from: '/cart' } });
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
      console.error('Error updating cart:', err);
    }
  };

  // Function to remove item from cart
  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
      console.error('Error removing item from cart:', err);
    }
  };

  // Function to toggle ingredient selection
  const toggleIngredient = async (itemId, ingredientId, isSelected, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const itemIndex = cart.items.findIndex(item => item._id === itemId);
      
      if (itemIndex === -1) return;
      
      const updatedIngredients = [...cart.items[itemIndex].selectedIngredients];
      
      // Find if ingredient is already in the array
      const existingIndex = updatedIngredients.findIndex(
        ing => ing.ingredient._id === ingredientId
      );
      
      if (isSelected && existingIndex === -1) {
        // Add ingredient
        updatedIngredients.push({
          ingredient: { _id: ingredientId },
          quantity: quantity || 1
        });
      } else if (!isSelected && existingIndex !== -1) {
        // Remove ingredient
        updatedIngredients.splice(existingIndex, 1);
      }
      
      const response = await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedIngredients: updatedIngredients })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ingredients');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
      console.error('Error updating ingredients:', err);
    }
  };

  // Function to calculate item subtotal
  const calculateItemSubtotal = (item) => {
    return item.selectedIngredients.reduce((total, ingredient) => {
      return total + (ingredient.ingredient.price * ingredient.quantity);
    }, 0) * item.quantity;
  };

  // Function to calculate total
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    const subtotal = cart.items.reduce((total, item) => {
      return total + calculateItemSubtotal(item);
    }, 0);
    
    const deliveryCharge = 100; // Define delivery charge
    return subtotal + deliveryCharge;
  };

  // Handle checkout form submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingPayment(true);
      
      // Validate required fields
      if (!orderDetails.customerName || !orderDetails.address || !orderDetails.phoneNumber) {
        throw new Error('Please fill all required fields');
      }

      // Validate phone number format
      if (!/^\d{10}$/.test(orderDetails.phoneNumber)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
      
      const token = localStorage.getItem('token');
      
      console.log('Checkout data:', {
        ...orderDetails,
        paymentMethod
      });
      
      // For eSewa payment, handle directly similar to Purchase page
      if (paymentMethod === 'esewa') {
        // First create the order to get order ID
        const checkoutResponse = await fetch('http://localhost:5000/api/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...orderDetails,
            paymentMethod
          })
        });
        
        if (!checkoutResponse.ok) {
          const errorData = await checkoutResponse.json();
          throw new Error(errorData.message || 'Failed to process checkout');
        }
        
        const checkoutData = await checkoutResponse.json();
        const order = checkoutData.order;
        
        if (!order) {
          throw new Error('No order was created');
        }
        
        // Now initiate eSewa payment using order ID as product ID
        console.log('Initiating eSewa payment for order:', order._id);
        
        try {
          const response = await fetch('http://localhost:5000/initiate-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: order.totalAmount + 100, // Add delivery charge
              productId: order._id.toString(),
              // Don't send order details since we've already created the order
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('eSewa initiation error:', errorData);
            throw new Error(errorData.message || 'Failed to initiate payment');
          }
          
          const data = await response.json();
          
          if (data.success && data.url) {
            // Redirect to eSewa payment page
            window.location.href = data.url;
          } else {
            throw new Error('Failed to get eSewa payment URL');
          }
        } catch (error) {
          console.error('eSewa payment error:', error);
          throw new Error('Failed to initiate payment. Please try again.');
        }
        
      } else {
        // Regular COD checkout flow
        const response = await fetch('http://localhost:5000/api/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...orderDetails,
            paymentMethod
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to process checkout');
        }
        
        const data = await response.json();
        
        // Get the order from the response
        const order = data.order;
        
        if (!order) {
          throw new Error('No order was created');
        }
        
        // For COD, redirect to success page
        navigate('/payment/success', { 
          state: { 
            orderId: order._id,
            multipleRecipes: order.recipes.length > 1,
            recipeCount: order.recipes.length
          }
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error during checkout:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error loading cart</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchCart}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="grocery-empty-cart-container">
        <div className="grocery-empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any recipes to your cart yet.</p>
          <button onClick={() => navigate('/recipes')} className="grocery-shop-now-btn">
            Browse Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grocery-cart-container">
      <h1>Your Cart</h1>
      
      <div className="grocery-cart-content">
        <div className="grocery-cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="grocery-cart-item">
              <div className="grocery-item-image">
                <img src={item.recipe.image} alt={item.recipe.name} />
              </div>
              
              <div className="grocery-item-details">
                <h3>{item.recipe.name}</h3>
                <div className="grocery-recipe-meta">
                  <span className="grocery-time-tag">{item.recipe.time}</span>
                  <span className="grocery-difficulty">{item.recipe.difficulty}</span>
                  <span className="grocery-category-tag">{item.recipe.category}</span>
                </div>
                
                <div className="grocery-quantity-selector">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                
                <button className="grocery-remove-item" onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </div>
              
              <div className="grocery-item-ingredients">
                <h4>Ingredients</h4>
                <ul className="grocery-ingredient-list">
                  {item.selectedIngredients.map(ingItem => (
                    <li key={ingItem.ingredient._id}>
                      <span>{ingItem.ingredient.name}</span>
                      <span className="grocery-ingredient-price">
                        Rs. {(ingItem.ingredient.price * ingItem.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="grocery-item-subtotal">
                  <span>Subtotal:</span>
                  <span className="price">Rs. {calculateItemSubtotal(item).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grocery-cart-summary">
          <h2>Order Summary</h2>
          {cart.items.map(item => (
            <div key={item._id} className="cart-summary-item">
              <p>{item.recipe.name} (x{item.quantity})</p>
              <p>Rs. {calculateItemSubtotal(item).toFixed(2)}</p>
            </div>
          ))}
          <hr/>
          <div className="cart-summary-item">
            <p>Delivery Charge</p>
            <p>Rs. {100.00.toFixed(2)}</p>
          </div>
          <hr/>
          <div className="cart-summary-total">
            <h3>Total</h3>
            <h3>Rs. {calculateTotal().toFixed(2)}</h3>
          </div>
          <button 
            className="grocery-checkout-button"
            onClick={() => setShowCheckoutForm(true)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      
      {showCheckoutForm && (
        <div className="grocery-modal-overlay">
          <div className="grocery-payment-modal">
            <h2>Delivery Information</h2>
            <form onSubmit={handleCheckout} className="grocery-checkout-form">
              <div className="grocery-form-group">
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
              
              <div className="grocery-form-group">
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
              
              <div className="grocery-form-group">
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

              <div className="grocery-payment-methods">
                <h3>Payment Method</h3>
                <div className="grocery-payment-options">
                  <div className="grocery-payment-option">
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
                  
                  <div className="grocery-payment-option">
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

              <div className="grocery-form-actions">
                <button 
                  type="button" 
                  className="grocery-cancel-button" 
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="grocery-confirm-button"
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
              className="grocery-close-modal"
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

export default Cart;
