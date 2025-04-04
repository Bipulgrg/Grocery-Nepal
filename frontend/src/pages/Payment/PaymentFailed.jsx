import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pendingOrder, setPendingOrder] = useState(null);

  // Check if there's an error parameter from eSewa
  const esewaError = searchParams.get('error');
  const errorCode = searchParams.get('errorCode');

  useEffect(() => {
    // Check if there's a pending order in localStorage
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setPendingOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Handle retry payment
  const handleRetry = () => {
    // If we have a pending order, try to go back to the Purchase page with that recipe
    if (pendingOrder && pendingOrder.recipe) {
      navigate(`/purchase/${pendingOrder.recipe}`);
    } else {
      // Otherwise, just go back to the checkout page
      navigate('/checkout');
    }
  };

  return (
    <div className="payment-result-container failed">
      <div className="payment-result-card">
        <div className="icon-container failed">
          <FaTimesCircle className="result-icon" />
        </div>
        <h1>Payment Failed</h1>
        <p>Your payment could not be processed successfully.</p>
        
        {esewaError && (
          <div className="esewa-error">
            <p><strong>eSewa Error:</strong> {esewaError}</p>
            {errorCode && <p><strong>Error Code:</strong> {errorCode}</p>}
          </div>
        )}
        
        <p>This could be due to:</p>
        <ul className="error-reasons">
          <li>Insufficient funds</li>
          <li>Invalid account details</li>
          <li>Transaction timed out</li>
          <li>Network connectivity issues</li>
        </ul>
        
        {pendingOrder && (
          <div className="order-info">
            <p><strong>Order Details:</strong></p>
            <p>Amount: Rs. {pendingOrder.totalAmount?.toFixed(2)}</p>
          </div>
        )}
        
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