// src/components/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if(email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-container">

          {/* Column 1: Brand & Socials */}
          <div className="footer-brand">
            <h3>Utensil<span>Pro</span></h3>
            <p>Your trusted neighborhood shop for premium quality kitchenware, professional cookware, and elegant dining accessories.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="footer-links">
            <h4>Shop Categories</h4>
            <ul>
              <li><Link to="/shop?category=Cookware">Professional Cookware</Link></li>
              <li><Link to="/shop?category=Serveware">Elegant Serveware</Link></li>
              <li><Link to="/shop?category=Dining">Dining & Table</Link></li>
              <li><Link to="/shop?category=Storage">Kitchen Storage</Link></li>
              <li><Link to="/shop">View All Products</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="footer-links">
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="footer-contact">
            <h4>Stay Updated</h4>
            <p className="newsletter-text">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>

            <div className="contact-info">
              <p>📍 Market Yard, Pune, Maharashtra</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ support@utensilpro.com</p>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} UtensilPro. All rights reserved.</p>
          <div className="payment-methods">
            <span title="Visa">💳</span>
            <span title="Mastercard">💳</span>
            <span title="UPI">📱</span>
            <span title="Cash on Delivery">💵</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;