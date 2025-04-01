import React, { useState, useEffect } from 'react';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after status update
      fetchOrders();
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FCD34D';
      case 'out_for_delivery':
        return '#60A5FA';
      case 'delivered':
        return '#34D399';
      default:
        return '#9CA3AF';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-orders">
      <h1>Manage Orders</h1>
      
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <h3>Order #{order._id.slice(-6)}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <span className="label">Customer:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{order.phoneNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Address:</span>
                <span>{order.address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Recipe:</span>
                <span>{order.recipe.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Servings:</span>
                <span>{order.servings}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Amount:</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ordered:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            <div className="ingredients-list">
              <h4>Ingredients:</h4>
              {order.ingredients.map((item, index) => (
                <div key={index} className="ingredient-row">
                  <span>{item.ingredient.name}</span>
                  <span>{item.quantity} {item.ingredient.unit}</span>
                </div>
              ))}
            </div>

            <div className="status-actions">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders; 