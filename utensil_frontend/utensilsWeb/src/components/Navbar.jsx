// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import our custom hook
import './Navbar.css';

const Navbar = () => {
  const { role, user, logout } = useAuth(); // Grab state and functions from Context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Send them back to login after logging out
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/"><h2>Utensil<span>Pro</span></h2></Link>
        </div>

        <nav className="navbar-links">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </nav>

        <div className="navbar-actions">

          {/* If nobody is logged in */}
          {role === null && (
            <div className="auth-links">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}

          {/* If Admin is logged in */}
          {role === 'admin' && (
            <div className="auth-links">
              <span className="admin-badge">Admin Panel</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}

          {/* If Customer is logged in */}
          {role === 'customer' && (
            <div className="auth-links">
              <Link to="/profile" className="profile-link">👤 {user?.fullName}</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}

          {/* Cart Icon (Hidden for Admins) */}
          {role !== 'admin' && (
            <Link to="/cart" className="cart-btn">
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
              {/* We can wire up the dynamic cart count here later! */}
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;