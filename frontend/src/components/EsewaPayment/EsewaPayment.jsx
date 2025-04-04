import React, { useState } from 'react';
import './EsewaPayment.css';

const EsewaPayment = ({ amount, orderId, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a unique product ID if not provided
      const productId = orderId || `PROD-${Date.now()}`;

      // Call the backend to initiate payment
      const response = await fetch('http://localhost:5000/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // Redirect to eSewa payment page
      window.location.href = data.url;
      
      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment');
      
      // If onFailure callback is provided, call it
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esewa-payment-container">
      {error && <div className="payment-error">{error}</div>}
      
      <button
        className="esewa-payment-button"
        onClick={initiatePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with eSewa'}
      </button>
    </div>
  );
};

export default EsewaPayment; 