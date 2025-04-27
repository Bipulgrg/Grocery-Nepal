import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin', { state: { from: '/orders' } });
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FCD34D';
      case 'out_for_delivery':
        return '#F59E0B';
      case 'delivered':
        return '#34D399';
      case 'failed':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cod':
        return '#6B7280';
      case 'esewa':
        return '#3B82F6';
      case 'online':
        return '#10B981';
      default:
        return '#9CA3AF';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') {
      return order.status !== 'delivered';
    } else {
      return order.status === 'delivered';
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="empty-orders">
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet.</p>
        <button onClick={() => navigate('/recipes')} className="browse-recipes-btn">
          Browse Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>
      
      <div className="order-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Completed Orders
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders-message">
            <p>No {activeTab === 'pending' ? 'pending' : 'completed'} orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order._id.slice(-6)}</div>
                <div className="status-badges">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                  <span 
                    className="payment-badge"
                    style={{ backgroundColor: getPaymentMethodColor(order.paymentMethod) }}
                  >
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="order-content">
                <div className="recipe-info">
                  <img 
                    src={order.recipe.image} 
                    alt={order.recipe.name} 
                    className="recipe-image"
                  />
                  <div className="recipe-details">
                    <h3>{order.recipe.name}</h3>
                    <p>{order.servings} serving(s)</p>
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Ordered On:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span>Rs. {order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Delivery To:</span>
                    <span>{order.address}</span>
                  </div>
                  {order.paymentDetails && order.paymentDetails.transactionId && (
                    <div className="detail-row">
                      <span className="label">Transaction ID:</span>
                      <span>{order.paymentDetails.transactionId}</span>
                    </div>
                  )}
                </div>

                <div className="ingredients-section">
                  <h4>Ingredients:</h4>
                  <div className="ingredients-grid">
                    {order.ingredients.map((item, index) => (
                      <div key={index} className="ingredient-item">
                        <span>{item.ingredient.name}</span>
                        <span>{item.quantity} {item.ingredient.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;