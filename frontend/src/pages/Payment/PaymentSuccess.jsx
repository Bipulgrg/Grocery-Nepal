import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Get parameters from eSewa callback
  const pid = searchParams.get('pid'); // Product ID
  const amt = searchParams.get('amt'); // Amount
  const refId = searchParams.get('refId'); // Reference ID

  useEffect(() => {
    // If this is a return from eSewa with callback parameters,
    // handle the payment status update
    if (pid && amt && refId) {
      handleEsewaCallback();
    }
    
    // Check if there's a pending order to process
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    }
  }, [pid, amt, refId]);

  const handleEsewaCallback = async () => {
    try {
      setLoading(true);
      
      // Call the backend to verify payment status
      const response = await fetch('http://localhost:5000/payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: pid,
          status: 'COMPLETE',
          refId
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      // Process the pending order if exists
      const pendingOrder = localStorage.getItem('pendingOrder');
      if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        
        // Create the order in the database
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            paymentMethod: 'esewa',
            paymentDetails: {
              refId,
              amount: amt,
              status: 'COMPLETE'
            }
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to create order after payment');
        }

        // Clear the pending order from localStorage
        localStorage.removeItem('pendingOrder');
        setOrderData(orderData);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-container success">
        <div className="payment-result-card">
          <div className="loading-spinner"></div>
          <h1>Processing Payment</h1>
          <p>Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container error">
        <div className="payment-result-card">
          <div className="icon-container error">
            <FaCheckCircle className="result-icon" />
          </div>
          <h1>Payment Verification Failed</h1>
          <p>{error}</p>
          <p>Your payment was received, but we had trouble updating your order.</p>
          <p>Please contact customer support for assistance.</p>
          <Link to="/recipes" className="action-button error">
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container success">
      <div className="payment-result-card">
        <div className="icon-container success">
          <FaCheckCircle className="result-icon" />
        </div>
        <h1>Payment Successful!</h1>
        <p>Your order has been processed successfully.</p>
        <p>You will receive a confirmation email shortly.</p>
        {orderData && (
          <div className="order-details">
            <p><strong>Order Summary:</strong></p>
            <p>Customer: {orderData.customerName}</p>
            <p>Delivery Address: {orderData.address}</p>
            <p>Phone: {orderData.phoneNumber}</p>
            <p>Amount: Rs. {orderData.totalAmount.toFixed(2)}</p>
          </div>
        )}
        <Link to="/recipes" className="action-button success">
          Back to Recipes
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess; 