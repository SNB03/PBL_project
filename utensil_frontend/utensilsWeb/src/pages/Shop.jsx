// src/pages/Shop.jsx
import React, { useState } from 'react';
import './Shop.css';

const Shop = () => {
  // MOCK MONGODB DATA: Notice how different products can have different specific attributes
  const [products] = useState([
    { id: 1, name: "Non-Stick Frying Pan", category: "Cookware", price: 1299, image: "🍳", attributes: { material: "Teflon", size: "28cm" } },
    { id: 2, name: "Professional Chef Knife", category: "Cutlery", price: 899, image: "🔪", attributes: { blade: "High-Carbon Steel", handle: "Wood" } },
    { id: 3, name: "Ceramic Mixing Bowls (Set of 3)", category: "Serveware", price: 1499, image: "🥣", attributes: { microwaveSafe: true } },
    { id: 4, name: "Wooden Spatula Set", category: "Accessories", price: 450, image: "🥄", attributes: { material: "Bamboo", pieces: 4 } },
    { id: 5, name: "Cast Iron Skillet", category: "Cookware", price: 2100, image: "🥘", attributes: { material: "Cast Iron", preSeasoned: true } },
    { id: 6, name: "Digital Kitchen Scale", category: "Accessories", price: 750, image: "⚖️", attributes: { maxWeight: "5kg", batteryIncluded: true } }
  ]);

  const [activeCategory, setActiveCategory] = useState('All');

  // Filter logic
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const categories = ['All', 'Cookware', 'Cutlery', 'Serveware', 'Accessories'];

  const handleAddToCart = (product) => {
    // 1. Get existing cart from local storage, or start an empty array
    const existingCart = JSON.parse(localStorage.getItem('utensil_cart')) || [];

    // 2. Add the new product
    existingCart.push(product);

    // 3. Save back to local storage
    localStorage.setItem('utensil_cart', JSON.stringify(existingCart));

    alert(`${product.name} added to cart!`);
    // Note: To make the Navbar cart badge update instantly without a refresh,
    // we will eventually need to move this cart state to a React Context.
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Our Collection</h1>
        <p>Browse our flexible catalog of premium kitchenware.</p>
      </div>

      {/* Category Filter */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="shop-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="shop-card">
            <div className="shop-card-image">{product.image}</div>
            <div className="shop-card-content">
              <span className="shop-category-tag">{product.category}</span>
              <h3>{product.name}</h3>

              {/* Dynamically rendering flexible attributes (simulating NoSQL schema) */}
              <div className="shop-attributes">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <span key={key} className="attribute-badge">
                    {key}: {value.toString()}
                  </span>
                ))}
              </div>

              <div className="shop-card-footer">
                <span className="shop-price">₹{product.price}</span>
                <button
                  className="shop-add-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;