// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Brand Logo */}
        <div className="navbar-brand">
          <Link to={role === 'admin' ? '/admin' : '/'}>
            <h2>Utensil<span>Pro</span></h2>
          </Link>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="navbar-links">
          <ul>
            {role === 'admin' ? (
              // --- ADMIN LINKS ---
              <>
                <li><Link to="/admin">Dashboard Workspace</Link></li>
                <li><Link to="/">View Live Storefront</Link></li>
              </>
            ) : (
              // --- CUSTOMER / GUEST LINKS ---
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop All</Link></li>
                <li><Link to="/cookers">Pressure Cookers</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* Right Side Actions */}
        <div className="navbar-actions">

          {role === null && (
            <div className="auth-links">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}

          {role === 'admin' && (
            <div className="auth-links">
              <span className="admin-badge">Admin Mode</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}

          {role === 'customer' && (
            <div className="auth-links">
              <Link to="/profile" className="profile-link">👤 {user?.fullName}</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}

{/*            */}{/* Hide cart completely from Admin to keep their UI clean */}
{/*           {role !== 'admin' && ( */}
{/*             <Link to="/cart" className="cart-btn"> */}
{/*               <button className="nav-btn-cart" onClick={() => setIsCartOpen(true)}> */}
{/*                 🛒 Cart <span className="cart-badge">{cartCount}</span> */}
{/*               </button> */}
{/*             </Link> */}
{/*           )} */}

        </div>
      </div>
    </header>
  );
};

export default Navbar;