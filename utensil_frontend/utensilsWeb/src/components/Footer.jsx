// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Utensil<span>Pro</span></h3>
          <p>Your trusted local shop for premium quality kitchenware, cookware, and culinary accessories.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/shop">Shop All</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Visit Our Shop</h4>
          <p>📍 123 Market Street, City Center</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ hello@utensilpro.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} UtensilPro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;