// src/pages/Storefront.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Storefront.css';

import CustomerNavbar from '../components/CustomerNavbar';

const Storefront = () => {
  const navigate = useNavigate();
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products?size=500');
        if (res.ok) {
          const data = await res.json();
          const catalog = data.content ? data.content : data;
          const inStockCatalog = catalog.filter(p => p.stock > 0);
         setProducts(inStockCatalog);

          // Extract unique categories
          const uniqueCats = [...new Set(catalog.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);
// Filter Engine
  const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(`Added ${product.name} to your cart!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Helper function to render product cards (keeps code clean)
  const ProductCard = ({ product }) => (
    <div className="product-card animate-slide-up">
{/*       // Inside the product map loop: */}
      <div key={product.id} className="product-card animate-slide-up">

        {/* Wrap the image in a Link */}
        <Link to={`/product/${product.id}`} className="product-image-container" style={{ textDecoration: 'none', color: 'inherit' }}>
          {product.img && product.img.startsWith('http') ? (
            <img src={product.img} alt={product.name} loading="lazy" />
          ) : (
            <div className="emoji-placeholder">{product.img || '📦'}</div>
          )}
        </Link>

        <div className="product-details">
          <span className="product-category">{product.subcategory || product.category}</span>

          {/* Wrap the Title in a Link */}
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="product-name" title={product.name}>{product.name}</h3>
          </Link>

          <div className="product-price-row">
            <span className="product-price">₹{Number(product.price).toLocaleString()}</span>
          </div>

          <button className="btn-add-to-cart" onClick={() => handleAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="storefront-container">
      {/* NAVBAR */}
      <CustomerNavbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

      {/* HERO BANNER */}
      <header className="store-hero animate-fade-in">
        <div className="hero-content">
          <h1>Upgrade Your Kitchen</h1>
          <p>Professional grade utensils, delivered right to your door.</p>
        </div>
      </header>

      <main className="store-main">
        {isLoading ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading the latest catalog...</p></div>
        ) : (
          // DYNAMIC CATEGORY SECTIONS
          categories.map(category => {
            // Get products for this category and grab ONLY the first 4
            const categoryProducts = products.filter(p => p.category === category);
            const displayProducts = categoryProducts.slice(0, 4);

            return (
              <section key={category} className="category-section" style={{ marginBottom: '60px' }}>

                {/* Section Header with "Explore All" button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 5px 0' }}>{category}</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Discover our premium {category.toLowerCase()} collection.</p>
                  </div>
                  <Link
                    to={`/category/${category}`}
                    style={{ fontWeight: 'bold', color: '#3b82f6', textDecoration: 'none', padding: '10px 20px', backgroundColor: '#eff6ff', borderRadius: '30px', transition: 'background 0.2s' }}
                  >
                    Explore All {categoryProducts.length} Items →
                  </Link>
                </div>

                {/* 4-Item Grid */}
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {displayProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </section>
            );
          })
        )}
      </main>

      {toast && <div className="customer-toast animate-slide-up-toast">✅ {toast}</div>}

      <footer className="store-footer">
        <div className="footer-content"><div className="footer-brand">UtensilPro</div><p>Premium kitchenware for everyday chefs.</p></div>
      </footer>
    </div>
  );
};

export default Storefront;