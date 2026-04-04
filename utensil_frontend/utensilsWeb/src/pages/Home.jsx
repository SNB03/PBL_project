// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 1. Pull the global cart action
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 👉 2. Setup the Toast State and Function
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  // 👉 3. Fetch Real Data from Spring Boot
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products');
        if (res.ok) {
          const data = await res.json();

          const productsArray = Array.isArray(data) ? data : (data.content || []);

          const formattedProducts = productsArray.map(p => ({
            id: p.id,
            name: p.name || 'Unnamed Product',
            category: p.category || 'General',
            subcategory: p.subcategory || '',
            price: p.price || 0,
            img: p.img || p.imageUrl || p.image || '📦',
            tag: p.tag || '',
            stock: p.stock || 0
          }));

          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Failed to connect to backend API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayedProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const availableCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // 👉 4. Upgraded Add to Cart logic
  const handleAddToCart = (product) => {
    addToCart(product, 1); // Triggers Context
    showToast(`${product.name} added to your cart!`); // Triggers Toast
  };

  const handleExplore = (product) => {
    if (product.name.toLowerCase().includes('cooker')) {
      navigate('/cookers');
    } else {
      navigate(`/shop?category=${product.category}`);
    }
  };

  return (
    <div className="local-store-home relative">

      {/* Top Banner */}
      <div className="shop-info-banner">
        <div className="shop-info-content">
          <span>📍 Market Yard, Pune</span>
          <span>📞 Store: +91 98765 43210</span>
          <span className="open-status">🟢 Open today until 9:00 PM</span>
        </div>
      </div>

      {/* Hero Search Section */}
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

      {/* Dynamic Content Area */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ color: '#64748b' }}>Loading Storefront...</h2>
        </div>
      ) : searchTerm !== '' ? (
        <div className="store-section">
          <div className="section-header-row">
            <h2>Search Results for "{searchTerm}"</h2>
          </div>
          <div className="simple-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                  onExplore={handleExplore}
                />
              ))
            ) : (
              <p style={{ color: '#64748b' }}>Sorry, we couldn't find anything matching your search.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {availableCategories.slice(0, 4).map(category => {
            const categoryTopPicks = products.filter(p => p.category === category).slice(0, 4);
            if (categoryTopPicks.length === 0) return null;

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
                  {categoryTopPicks.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={handleAddToCart}
                      onExplore={handleExplore}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* 👉 5. The Toast Component at the very bottom */}
      {toast.visible && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '8px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', animation: 'slideInRight 0.3s ease-out' }}>
          ✅ {toast.message}
        </div>
      )}
    </div>
  );
};

export default Home;