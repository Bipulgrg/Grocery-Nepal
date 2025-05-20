import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState(1);

  useEffect(() => {
    // Check if there's a pending order in localStorage
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      setOrderCount(order.recipeCount || 1);
      // Clear the pending order from localStorage
      localStorage.removeItem('pendingOrder');
    }
  }, []);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h1>Payment Successful!</h1>
        <div className="success-message">
          <p>Your order has been processed successfully!</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>
        <div className="success-actions">
          <Link to="/orders" className="view-orders-btn">
            View Orders
          </Link>
          <Link to="/recipes" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 