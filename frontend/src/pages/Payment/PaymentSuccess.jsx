import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  return (
    <div className="payment-result-container success">
      <div className="payment-result-card">
        <div className="icon-container success">
          <FaCheckCircle className="result-icon" />
        </div>
        <h1>Payment Successful!</h1>
        <p>Your order has been processed successfully.</p>
        <p>You will receive a confirmation email shortly.</p>
        <div className="order-details">
          <p>Thank you for your purchase!</p>
        </div>
        <Link to="/recipes" className="action-button success">
          Back to Recipes
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess; 