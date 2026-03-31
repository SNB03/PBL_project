// src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Storefront.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products?size=500');
        if (res.ok) {
          const data = await res.json();
          const catalog = data.content ? data.content : data;

          // 1. Filter out zero-stock items
          // 2. Filter ONLY items matching this category
          const validProducts = catalog.filter(p => p.stock > 0 && p.category === categoryName);

          setProducts(validProducts);

          // Dynamically extract subcategories for the sidebar filter
          const uniqueSubcats = ['All', ...new Set(validProducts.map(p => p.subcategory).filter(Boolean))];
          setSubcategories(uniqueSubcats);
        }
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryProducts();
    // Reset filters when category changes
    setActiveSubcat('All');
    setSearchQuery('');
  }, [categoryName]);

  // Deep Filter Engine for the Category Page
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubcat = activeSubcat === 'All' || p.subcategory === activeSubcat;
    return matchesSearch && matchesSubcat;
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast(`Added ${product.name} to your cart!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="storefront-container">
      {/* NAVBAR */}
      <nav className="store-navbar">
        <div className="nav-brand" onClick={() => navigate('/')}><h2>Utensil<span>Pro</span></h2></div>
        <div className="nav-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder={`Search within ${categoryName}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn-text">Sign In</Link>
          <button className="nav-btn-cart" onClick={() => setIsCartOpen(true)}>
            🛒 Cart {cartCount > 0 && <span className="cart-badge animate-pop">{cartCount}</span>}
          </button>
        </div>
      </nav>

      <main className="store-main" style={{ paddingTop: '40px', maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ marginBottom: '30px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Home</Link>
          <span style={{ margin: '0 10px' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{categoryName}</span>
        </div>

        {/* --- SPLIT LAYOUT: SIDEBAR + GRID --- */}
        <div className="category-page-layout" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

          {/* THE SIDEBAR FILTER */}
          <aside className="category-sidebar" style={{ width: '250px', flexShrink: 0, backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
              Filters
            </h3>

            <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px' }}>Subcategories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveSubcat(sub)}
                  style={{
                    textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                    padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s',
                    backgroundColor: activeSubcat === sub ? '#eff6ff' : 'transparent',
                    color: activeSubcat === sub ? '#3b82f6' : '#475569',
                    fontWeight: activeSubcat === sub ? 'bold' : 'normal'
                  }}
                >
                  {sub === 'All' ? `All ${categoryName}` : sub}
                </button>
              ))}
            </div>
          </aside>

          {/* THE MAIN CONTENT GRID */}
          <div className="category-content" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '2.5rem', color: '#0f172a', margin: 0 }}>{activeSubcat === 'All' ? `All ${categoryName}` : activeSubcat}</h1>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>{filteredProducts.length} items found</span>
            </div>

            {isLoading ? (
              <div className="loading-state"><div className="spinner"></div><p>Loading items...</p></div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{fontSize: '4rem'}}>🍽️</span>
                <h3>No items found</h3>
                <p>We couldn't find any {activeSubcat} matching your search.</p>
                <button className="btn-reset" onClick={() => {setSearchQuery(''); setActiveSubcat('All');}}>Clear Filters</button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (



                  // Inside the product map loop:
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
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {toast && <div className="customer-toast animate-slide-up-toast">✅ {toast}</div>}
    </div>
  );
};

export default CategoryPage;