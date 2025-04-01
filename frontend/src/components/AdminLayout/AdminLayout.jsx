import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className="nav-item">
            <i className="fas fa-chart-line"></i>
            Dashboard
          </NavLink>
          <NavLink to="/admin/recipes" className="nav-item">
            <i className="fas fa-utensils"></i>
            Recipes
          </NavLink>
          <NavLink to="/admin/ingredients" className="nav-item">
            <i className="fas fa-carrot"></i>
            Ingredients
          </NavLink>
          <NavLink to="/admin/orders" className="nav-item">
            <i className="fas fa-shopping-bag"></i>
            Orders
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/" className="nav-item">
            <i className="fas fa-arrow-left"></i>
            Back to Site
          </NavLink>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 