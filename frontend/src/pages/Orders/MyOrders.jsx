import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage('Order cancelled successfully');
      fetchOrders();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error cancelling order');
      setTimeout(() => {
        setError(null);
      }, 3000);
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
      case 'cancelled':
        return '#9CA3AF';
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

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const filteredOrders = orders.filter((order) => {
    switch (activeTab) {
      case 'pending':
        return ['pending', 'out_for_delivery'].includes(order.status);
      case 'delivered':
        return order.status === 'delivered';
      case 'failed':
        return order.status === 'failed';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return false;
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

      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      <div className="order-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders ({orders.filter((order) => ['pending', 'out_for_delivery'].includes(order.status)).length})
        </button>
        <button
          className={`tab-button ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Completed Orders ({orders.filter((order) => order.status === 'delivered').length})
        </button>
        <button
          className={`tab-button ${activeTab === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          Failed Orders ({orders.filter((order) => order.status === 'failed').length})
        </button>
        <button
          className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled Orders ({orders.filter((order) => order.status === 'cancelled').length})
        </button>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders-message">
            <p>No {activeTab} orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">Order #{order._id.slice(-6)}</div>
                <div className="status-badges">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className="payment-badge" style={{ backgroundColor: getPaymentMethodColor(order.paymentMethod) }}>
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="order-content">
                <div className="recipe-info">
                  {order.recipes && order.recipes.length > 0 ? (
                    <div className="recipes-list">
                      {order.recipes.map((recipe, index) => (
                        <div key={index} className="recipe-item">
                          <img src={recipe.recipeId.image} alt={recipe.recipeId.name} className="recipe-image" />
                          <div className="recipe-details">
                            <h3>{recipe.recipeId.name}</h3>
                            <p>{recipe.servings} serving(s)</p>
                            <span className="recipe-amount">Rs. {recipe.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-recipe">No recipe information</div>
                  )}
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Ordered On:</span>
                    <span className="value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Customer Name:</span>
                    <span className="value">{order.customerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Delivery Address:</span>
                    <span className="value">{order.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone Number:</span>
                    <span className="value">{order.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">Rs. {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="order-actions">
                    <button className="cancel-button" onClick={() => handleCancelOrder(order._id)}>
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
