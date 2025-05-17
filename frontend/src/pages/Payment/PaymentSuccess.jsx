import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const [multipleOrders, setMultipleOrders] = useState(false);
  const [orderIds, setOrderIds] = useState([]);
  const [orderCount, setOrderCount] = useState(0);

  // Get parameters from eSewa callback
  const pid = searchParams.get('pid'); // Product ID
  const amt = searchParams.get('amt'); // Amount
  const refId = searchParams.get('refId'); // Reference ID
  const oid = searchParams.get('oid'); // Order ID (optional)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Check if this is a cart checkout with multiple orders
    if (location.state && location.state.multipleOrders) {
      setMultipleOrders(true);
      setOrderIds(location.state.orderIds || []);
      setOrderCount(location.state.orderCount || location.state.orderIds?.length || 0);
      return;
    }

    const checkAndProcessOrder = async () => {
      try {
        // Check if there's a pending order to process
        const pendingOrder = localStorage.getItem('pendingOrder');
        
        if (pendingOrder) {
          setOrderData(JSON.parse(pendingOrder));
          
          // If this is a return from eSewa with callback parameters,
          // handle the payment status update and create the order
          if (pid && amt && refId) {
            await handleEsewaCallback(JSON.parse(pendingOrder));
          }
        } else if (pid && amt && refId) {
          // If we have eSewa parameters but no pending order in localStorage,
          // try to verify the payment anyway
          await handleEsewaCallback(null);
        }
      } catch (error) {
        console.error('Error processing order:', error);
        setError(error.message || 'Failed to process order');
      }
    };
    
    checkAndProcessOrder();
  }, [pid, amt, refId, oid, navigate, location.state]);

  const handleEsewaCallback = async (orderDetails) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Call the backend to verify payment status
      const response = await fetch('http://localhost:5000/payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      // Create the order in the database if we have order details
      if (orderDetails) {
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...orderDetails,
            paymentMethod: 'esewa',
            paymentStatus: 'paid',
            paymentDetails: {
              refId,
              pid,
              amount: amt,
              transactionId: refId,
              paymentDate: new Date().toISOString(),
              status: 'COMPLETE'
            }
          })
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || 'Failed to create order after payment');
        }

        const savedOrder = await orderResponse.json();
        console.log('Order saved successfully:', savedOrder);
        
        // Clear the pending order from localStorage
        localStorage.removeItem('pendingOrder');
        setOrderSaved(true);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const retryOrderCreation = async () => {
    if (!orderData) {
      setError('No order data available to retry');
      return;
    }
    
    if (!pid || !amt || !refId) {
      setError('Missing payment information');
      return;
    }
    
    try {
      setLoading(true);
      await handleEsewaCallback(orderData);
    } catch (error) {
      console.error('Retry failed:', error);
      setError(error.message || 'Failed to retry order creation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-container success">
        <div className="payment-result-card">
          <div className="loading-spinner"></div>
          <h1>Processing Your Order</h1>
          <p>Please wait while we complete your order...</p>
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
          <h1>Order Processing Failed</h1>
          <p>{error}</p>
          <p>Your payment was successful, but we had trouble creating your order.</p>
          
          <div className="action-buttons">
            <button onClick={retryOrderCreation} className="action-button retry">
              Retry Order Creation
            </button>
            <Link to="/recipes" className="action-button back">
              Back to Recipes
            </Link>
          </div>
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
        <h1>Order Successful!</h1>
        
        {multipleOrders ? (
          // Display for multiple orders from cart checkout
          <>
            <p>Your cart checkout has been processed successfully!</p>
            <p>{orderCount} recipes have been ordered and will be delivered to you soon.</p>
            <div className="order-details">
              <p><strong>Order Details:</strong></p>
              <p>{orderCount} individual orders have been created.</p>
              <p>You can view all your orders in the My Orders section.</p>
            </div>
          </>
        ) : (
          // Display for single order
          <>
            <p>Your order has been processed successfully.</p>
            <p>You will receive a confirmation email shortly.</p>
            {orderData && (
              <div className="order-details">
                <p><strong>Order Summary:</strong></p>
                <p>Customer: {orderData.customerName}</p>
                <p>Delivery Address: {orderData.address}</p>
                <p>Phone: {orderData.phoneNumber}</p>
                <p>Amount: Rs. {orderData.totalAmount?.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {orderData?.paymentMethod === 'esewa' ? 'eSewa' : 'Cash On Delivery'}</p>
              </div>
            )}
          </>
        )}
        
        <div className="action-buttons">
          <Link to="/orders" className="action-button back">
            View My Orders
          </Link>
          <Link to="/recipes" className="action-button back">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 