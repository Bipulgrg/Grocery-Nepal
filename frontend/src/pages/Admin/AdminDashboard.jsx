import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Admin from './Admin';
import AdminIngredients from './AdminIngredients';
import AdminOrders from './AdminOrders';
import ManageRecipes from './ManageRecipes';
import ManageIngredients from './ManageIngredients';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <div className="nav-section">
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