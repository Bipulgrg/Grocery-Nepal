import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Admin from './Admin';
import AdminIngredients from './AdminIngredients';
import AdminOrders from './AdminOrders';
import ManageRecipes from './ManageRecipes';
import ManageIngredients from './ManageIngredients';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch order statistics
        const orderResponse = await fetch('http://localhost:5000/api/dashboard/orders/stats');
        if (!orderResponse.ok) throw new Error('Failed to fetch order statistics');
        const orderData = await orderResponse.json();
        setOrderStats(orderData);

        // Fetch category statistics
        const categoryResponse = await fetch('http://localhost:5000/api/dashboard/recipes/category-stats');
        if (!categoryResponse.ok) throw new Error('Failed to fetch category statistics');
        const categoryData = await categoryResponse.json();
        setCategoryStats(categoryData);

        // Fetch monthly sales data
        const salesResponse = await fetch('http://localhost:5000/api/orders/admin/monthly-sales', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!salesResponse.ok) {
          throw new Error('Failed to fetch sales data');
        }

        const salesData = await salesResponse.json();
        
        // Transform the data with month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const transformedSalesData = salesData.map(item => ({
          ...item,
          name: monthNames[item.month - 1],
          amount: item.totalSales
        }));
        
        setMonthlySales(transformedSalesData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          {/* Sidebar content */}
        </div>
        <div className="admin-main">
          <div className="admin-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          {/* Sidebar content */}
        </div>
        <div className="admin-main">
          <div className="admin-content">
            <div className="error-container">
              <h2>Error Loading Dashboard</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <div className="nav-section">
              <Link 
              to="/admindashboard" 
              className={`nav-item ${isActiveRoute('/admindashboard') ? 'active' : ''}`}
              >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
             </Link>
            <div className="nav-section-title">Add New</div>
            <Link 
              to="/admindashboard/recipes/add" 
              className={`nav-item ${isActiveRoute('/admindashboard/recipes/add') ? 'active' : ''}`}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add Recipe</span>
            </Link>
            <Link 
              to="/admindashboard/ingredients/add" 
              className={`nav-item ${isActiveRoute('/admindashboard/ingredients/add') ? 'active' : ''}`}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add Ingredient</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Manage</div>
            <Link 
              to="/admindashboard/recipes/manage" 
              className={`nav-item ${isActiveRoute('/admindashboard/recipes/manage') ? 'active' : ''}`}
            >
              <i className="fas fa-edit"></i>
              <span>Manage Recipes</span>
            </Link>
            <Link 
              to="/admindashboard/ingredients/manage" 
              className={`nav-item ${isActiveRoute('/admindashboard/ingredients/manage') ? 'active' : ''}`}
            >
              <i className="fas fa-edit"></i>
              <span>Manage Ingredients</span>
            </Link>
            <Link 
              to="/admindashboard/orders" 
              className={`nav-item ${isActiveRoute('/admindashboard/orders') ? 'active' : ''}`}
            >
              <i className="fas fa-shopping-bag"></i>
              <span>Orders</span>
            </Link>
            <Link 
              to="/admin/manage-users" 
              className={`nav-item ${isActiveRoute('/admin/manage-users') ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i>
              <span>Manage Users</span>
            </Link>
          </div>
        </nav>
      </div>
      
      <div className="admin-main">
        <div className="admin-header">
          <button className="back-to-site" onClick={() => window.location.href = '/'}>
            <i className="fas fa-external-link-alt"></i>
            <span>View Website</span>
          </button>
          <div className="admin-user">
            <i className="fas fa-user-circle"></i>
            <span>Admin</span>
          </div>
        </div>

        <div className="admin-content">
          <Routes>
            <Route path="/recipes/add" element={<Admin />} />
            <Route path="/ingredients/add" element={<AdminIngredients />} />
            <Route path="/recipes/manage" element={<ManageRecipes />} />
            <Route path="/ingredients/manage" element={<ManageIngredients />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/" element={
              <div className="admin-welcome">
                <h1>Welcome to Admin Dashboard</h1>
                <p>Select an option from the sidebar to manage your content.</p>
                
                <div className="dashboard-charts">
                  <div className="chart-container">
                    <h2>Monthly Orders</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={orderStats}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="chart-container">
                    <h2>Recipes by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} recipes`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="chart-container">
                    <h2>Monthly Sales</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`Rs. ${value}`, 'Sales']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Bar dataKey="amount" fill="#16A34A" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="quick-stats">
                  <div className="stat-card">
                    <i className="fas fa-utensils"></i>
                    <h3>Recipes</h3>
                    <div className="stat-actions">
                      <Link to="/admindashboard/recipes/add">Add New</Link>
                      <Link to="/admindashboard/recipes/manage">Manage</Link>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-carrot"></i>
                    <h3>Ingredients</h3>
                    <div className="stat-actions">
                      <Link to="/admindashboard/ingredients/add">Add New</Link>
                      <Link to="/admindashboard/ingredients/manage">Manage</Link>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-shopping-bag"></i>
                    <h3>Orders</h3>
                    <Link to="/admindashboard/orders">View Orders</Link>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 