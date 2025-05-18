import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ManageUsers.css';

const ManageUsers = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError(null);
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      setSuccess('User deleted successfully');
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  if (loading) {
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
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
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
          <div className="manage-users-container">
            <div className="manage-users-header">
              <h1>Manage Users</h1>
              <p>View and manage all registered users</p>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            <div className="users-table-container">
              {users.length === 0 ? (
                <div className="no-data-message">
                  <i className="fas fa-users"></i>
                  <p>No users found</p>
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(user._id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers; 