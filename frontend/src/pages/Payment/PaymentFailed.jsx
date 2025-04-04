import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const navigate = useNavigate();

  // Handle retry payment
  const handleRetry = () => {
    // Ideally, this would redirect to the checkout with prefilled data
    // For now, just navigate back to the checkout page
    navigate('/checkout');
  };

  return (
    <div className="payment-result-container failed">
      <div className="payment-result-card">
        <div className="icon-container failed">
          <FaTimesCircle className="result-icon" />
        </div>
        <h1>Payment Failed</h1>
        <p>Your payment could not be processed successfully.</p>
        <p>This could be due to:</p>
        <ul className="error-reasons">
          <li>Insufficient funds</li>
          <li>Invalid card details</li>
          <li>Bank declined transaction</li>
          <li>Network connectivity issues</li>
        </ul>
        <div className="action-buttons">
          <button onClick={handleRetry} className="action-button retry">
            Try Again
          </button>
          <Link to="/recipes" className="action-button back">
            Back to Recipes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 