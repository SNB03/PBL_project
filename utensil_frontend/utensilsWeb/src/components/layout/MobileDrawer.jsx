// src/components/layout/MobileDrawer.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CategoryModal from '../ui/CategoryModal';

const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  // 👉 Close the side drawer when opening the bottom category sheet
  const handleCategoryClick = () => {
    setIsCategoryModalOpen(true);
    onClose();
  };

  return (
    <>
      {/* Dark background overlay */}
      <div
        className={`drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* The actual sliding drawer (From the Left) */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>

        <div className="drawer-header">
          <span className="nav-brand">Utensil<span>Pro</span></span>
          <button className="btn-close-drawer" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-links">
          <Link to="/" className="drawer-item" onClick={onClose}>🏠 Home</Link>
          <Link to="/shop" className="drawer-item" onClick={onClose}>🛍️ Shop All</Link>

          {/* 👉 Uses the new handler to manage both menus */}
          <button className="drawer-item" onClick={handleCategoryClick}>🗂️ Categories</button>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />

          {user ? (
            <>
              {user.role === 'ADMIN' && <Link to="/admin" className="drawer-item" onClick={onClose}>⚙️ Admin Panel</Link>}
              {user.role === 'DELIVERY' && <Link to="/delivery" className="drawer-item" onClick={onClose}>🛵 Rider App</Link>}
              <Link to="/profile" className="drawer-item" onClick={onClose}>👤 My Profile</Link>
            </>
          ) : (
            <Link to="/login" className="drawer-item" onClick={onClose}>🔑 Login / Register</Link>
          )}
        </div>

        {/* Footer actions */}
        {user && (
          <div className="drawer-footer">
            <button className="btn-drawer-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* The Mega-Menu Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
};

export default MobileDrawer;