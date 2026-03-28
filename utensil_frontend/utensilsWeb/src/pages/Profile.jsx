// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, role, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'settings'

  // Form state for Account Settings
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    if (role !== 'customer' || !user) {
      navigate('/login');
    } else {
      setEditName(user.fullName);
      setEditEmail(user.email);
    }
  }, [user, role, navigate]);

  // MOCK ORDERS
  const [orders] = useState([
    { id: "ORD-8472", date: "2026-03-25", total: 2450.00, status: "Delivered", items: 3 },
    { id: "ORD-9102", date: "2026-03-27", total: 899.00, status: "Shipped", items: 1 }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // In a real app, you would send a PUT request to Spring Boot here
    const updatedUser = { ...user, fullName: editName, email: editEmail };

    // Update global context & local storage
    login(updatedUser, 'customer');
    alert("Profile updated successfully!");
  };

  if (!user) return null;

  return (
    <div className="profile-container">

      {/* Sidebar Navigation */}
      <aside className="profile-sidebar">
        <div className="user-avatar">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <h2>{user.fullName}</h2>
        <p className="user-email">{user.email}</p>

        <div className="sidebar-actions">
          <button
            className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 My Orders
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Account Settings
          </button>
          <button className="sidebar-btn logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="profile-content">

        {/* --- TAB 1: ORDER HISTORY --- */}
        {activeTab === 'orders' && (
          <div className="tab-section animate-fade-in">
            <div className="content-header">
              <h2>Order History</h2>
              <p>Track your recent purchases and download invoices.</p>
            </div>

            <div className="orders-list">
              {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-label">Order Placed</span>
                        <span className="order-value">{order.date}</span>
                      </div>
                      <div>
                        <span className="order-label">Total</span>
                        <span className="order-value">₹{order.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="order-label">Order #</span>
                        <span className="order-value">{order.id}</span>
                      </div>
                    </div>

                    <div className="order-body">
                      <div className="order-status">
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                        <p>{order.items} item(s) in this order</p>
                      </div>
                      <div className="order-actions">
                        <button className="action-btn">Track Package</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: ACCOUNT SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="tab-section animate-fade-in">
            <div className="content-header">
              <h2>Account Settings</h2>
              <p>Update your personal information.</p>
            </div>

            <form className="settings-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled
                  title="Password reset feature coming soon"
                />
                <small>Contact support to reset your password.</small>
              </div>

              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};

export default Profile;