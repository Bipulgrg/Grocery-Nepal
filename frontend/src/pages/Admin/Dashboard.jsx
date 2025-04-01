import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRecipes: 0,
    totalIngredients: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await fetch('http://localhost:5000/api/orders');
      const orders = await ordersResponse.json();
      
      // Fetch recipes
      const recipesResponse = await fetch('http://localhost:5000/api/recipes');
      const recipes = await recipesResponse.json();
      
      // Fetch ingredients
      const ingredientsResponse = await fetch('http://localhost:5000/api/ingredients');
      const ingredients = await ingredientsResponse.json();

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        totalRecipes: recipes.length,
        totalIngredients: ingredients.length
      });

      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card orders">
          <div className="stat-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card recipes">
          <div className="stat-icon">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="stat-content">
            <h3>Total Recipes</h3>
            <p>{stats.totalRecipes}</p>
          </div>
        </div>

        <div className="stat-card ingredients">
          <div className="stat-icon">
            <i className="fas fa-carrot"></i>
          </div>
          <div className="stat-content">
            <h3>Total Ingredients</h3>
            <p>{stats.totalIngredients}</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all">
            View All <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Recipe</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.customerName}</td>
                  <td>{order.recipe.name}</td>
                  <td>Rs. {order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span 
                      className="status-pill"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 