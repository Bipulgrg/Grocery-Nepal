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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/orders/admin', {
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="no-orders">No orders found</div>;
  }

  return (
    <div className="admin-orders">
      <h2>All Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order._id}</span>
              <div className="status-container">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="status-select"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  <option value="pending">Pending</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <span 
                className="payment-method"
                style={{ backgroundColor: getPaymentMethodColor(order.paymentMethod) }}
              >
                {order.paymentMethod}
              </span>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <span className="label">Customer:</span>
                <span>{order.userId?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{order.userId?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{order.phoneNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Address:</span>
                <span>{order.address || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Recipe:</span>
                <span>{order.recipe?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Servings:</span>
                <span>{order.servings || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Amount:</span>
                <span>Rs. {order.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ordered:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paymentDetails && (
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span>{order.paymentDetails.transactionId || 'N/A'}</span>
                </div>
              )}
            </div>

            <div className="ingredients-list">
              <h4>Ingredients:</h4>
              {order.ingredients?.map((item, index) => (
                <div key={index} className="ingredient-row">
                  <span>{item.ingredient?.name || 'N/A'}</span>
                  <span>{item.quantity} {item.ingredient?.unit || ''}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders; 