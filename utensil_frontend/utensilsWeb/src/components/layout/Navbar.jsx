// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import MobileDrawer from './MobileDrawer';
import './Navbar.css';
import CartDrawer from '../CartDrawer';

const Navbar = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [isCartOpen, setIsCartOpen] = useState(false);
  // Calculate total items in cart (sum of quantities, not just unique items)
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  return (
    <>
      <nav className="global-navbar">
        <div className="navbar-container">

          {/* 1. BRAND LOGO */}
          <Link to="/" className="nav-brand">
            🍳 Utensil<span>Pro</span>
          </Link>

          {/* 2. DESKTOP LINKS (Hidden on Mobile) */}
          <div className="nav-links-desktop">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/shop" className="nav-item">Shop</Link>
            <Link to="/categories" className="nav-item">Categories</Link>

            {user?.role === 'ADMIN' && <Link to="/admin" className="nav-item">Admin</Link>}
            {user?.role === 'DELIVERY' && <Link to="/delivery" className="nav-item">Rider</Link>}
          </div>

          {/* 3. ACTIONS (Cart, Login, Hamburger) */}
          <div className="nav-actions">

            {/* Always show Cart */}
           <button
                         className="cart-icon-wrapper"
                         onClick={() => setIsCartOpen(true)}
                         style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                       >
                         🛒
                         {cartItemCount > 0 && (
                           <span className="cart-badge">{cartItemCount}</span>
                         )}
                       </button>

            {/* Desktop Login/Profile Button */}
            {user ? (
              <Link to="/profile" className="btn-nav-login">Profile</Link>
            ) : (
              <Link to="/login" className="btn-nav-login">Login</Link>
            )}

            {/* Mobile Hamburger Button (Hidden on Desktop) */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
            >
              ☰
            </button>
          </div>

        </div>
      </nav>

      {/* 4. THE MOBILE DRAWER COMPONENT */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      {/* 👉 4. RENDER CART DRAWER */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />

    </>

  );
};

export default Navbar;