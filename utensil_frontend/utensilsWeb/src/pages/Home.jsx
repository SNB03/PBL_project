// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // MOCK DATA: Added a real 3L cooker instead of the gateway card
  const products = [
    // Cookware
    { id: 101, name: "Prestige Svachh Cooker (3L)", category: "Cookware", price: 2100, img: "🍲", tag: "Top Rated" },
    { id: 2, name: "Premium Non-Stick Tawa", category: "Cookware", price: 650, img: "🍳", tag: "Best Seller" },
    { id: 3, name: "Heavy Duty Iron Kadai", category: "Cookware", price: 850, img: "🥘", tag: "Long Lasting" },
    { id: 4, name: "Copper Bottom Saucepan", category: "Cookware", price: 450, img: "🥘", tag: "Fast Heating" },

    // Cutlery
    { id: 5, name: "Professional Chef Knife", category: "Cutlery", price: 850, img: "🔪", tag: "Sharp Edge" },
    { id: 6, name: "Everyday Knife Set (3 Pcs)", category: "Cutlery", price: 350, img: "🗡️", tag: "Value Pack" },
    { id: 7, name: "Heavy Kitchen Scissors", category: "Cutlery", price: 250, img: "✂️", tag: "Multi-purpose" },
    { id: 8, name: "Wooden Chopping Board", category: "Cutlery", price: 400, img: "🪵", tag: "Organic Wood" },

    // Serveware
    { id: 9, name: "Steel Dinner Plates (Set of 6)", category: "Serveware", price: 850, img: "🍽️", tag: "Rust Free" },
    { id: 10, name: "Glass Water Jug (1.5L)", category: "Serveware", price: 450, img: "🏺", tag: "Elegant" },
    { id: 11, name: "Ceramic Serving Bowls", category: "Serveware", price: 600, img: "🥣", tag: "Microwave Safe" },
    { id: 12, name: "Guest Tea Cup Set (6 Pcs)", category: "Serveware", price: 350, img: "☕", tag: "Classic" }
  ];

  const displayedProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriesToPreview = ["Cookware", "Cutlery", "Serveware"];

  // --- CART LOGIC ---
  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('utensil_cart')) || [];

    existingCart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.img
    });

    localStorage.setItem('utensil_cart', JSON.stringify(existingCart));
    alert(`${product.name} added to your cart! 🛒`);
  };

  // --- EXPLORE LOGIC ---
  const handleExplore = (product) => {
    // If it's a cooker, route them to the special Cooker page.
    if (product.name.toLowerCase().includes('cooker')) {
      navigate('/cookers');
    } else {
      // Otherwise, route them to the general shop filtered by that category.
      navigate(`/shop?category=${product.category}`);
    }
  };

  // --- DYNAMIC CARD RENDERER ---
    const renderProductCard = (product) => (
      <div key={product.id} className="item-card">
        <span className="quality-tag">{product.tag}</span>

        {/* 1. Make the Image Clickable */}
        <Link to={`/product/${product.id}`} className="clickable-product-link">
          <div className="item-img">
            {product.img}
          </div>
        </Link>

        <div className="item-details">
          {/* 2. Make the Title Clickable */}
          <Link to={`/product/${product.id}`} className="clickable-product-link">
            <h4>{product.name}</h4>
          </Link>
          <span className="item-price">₹{product.price}</span>
        </div>

        <div className="card-actions">
          <button className="btn-add-small" onClick={() => handleAddToCart(product)}>
            Add to Cart
          </button>
          <button className="btn-explore" onClick={() => handleExplore(product)}>
            Explore All
          </button>
        </div>
      </div>
    );

  return (
    <div className="local-store-home">

      <div className="shop-info-banner">
        <div className="shop-info-content">
          <span>📍 Market Yard, Pune</span>
          <span>📞 Store: +91 98765 43210</span>
          <span className="open-status">🟢 Open today until 9:00 PM</span>
        </div>
      </div>

      <div className="welcome-section">
        <h1>Welcome to UtensilPro</h1>
        <p>Your trusted neighborhood shop for premium quality kitchenware.</p>

        <div className="simple-search">
          <input
            type="text"
            placeholder="Search for Tawa, Knives, Plates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      {searchTerm !== '' ? (
        <div className="store-section">
          <h2>Search Results</h2>
          <div className="simple-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map(renderProductCard)
            ) : (
              <p>Sorry, we couldn't find anything matching "{searchTerm}".</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {categoriesToPreview.map(category => {
            const categoryTopPicks = products.filter(p => p.category === category).slice(0, 4);

            return (
              <div key={category} className="store-section category-preview-section">
                <div className="section-header-row">
                  <div>
                    <h2>Best in {category}</h2>
                    <p className="section-subtitle">Our top quality picks for your kitchen.</p>
                  </div>
                  <Link to={`/shop?category=${category}`} className="view-all-link">
                    See all {category} →
                  </Link>
                </div>

                <div className="simple-grid">
                  {categoryTopPicks.map(renderProductCard)}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Home;