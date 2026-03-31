// src/components/CustomerNavbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CustomerNavbar = ({ searchQuery, setSearchQuery, placeholder = "Search for cookware, knives, etc..." }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // Removed setIsCartOpen
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="store-navbar">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <h2>Utensil<span>Pro</span></h2>
      </div>

      {setSearchQuery && (
        <div className="nav-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="nav-links">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/profile" className="nav-btn-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>👤</span> {user.name}
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/login" className="nav-btn-text">Sign In</Link>
            <Link to="/register" className="nav-btn-text" style={{ backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '20px' }}>
              Sign Up
            </Link>
          </div>
        )}

        {/* UPDATED: Now navigates directly to the dedicated Cart page */}
        <button className="nav-btn-cart" onClick={() => navigate('/cart')}>
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge animate-pop">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
};

export default CustomerNavbar;