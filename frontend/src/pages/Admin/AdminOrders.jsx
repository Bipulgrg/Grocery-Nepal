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

      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Fetched orders:', data); // Debug log
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
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order._id}</span>
              <span 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </span>
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
              {order.paymentDetails && (
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span>{order.paymentDetails.transactionId || 'N/A'}</span>
                </div>
              )}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders; 