// src/pages/Shop.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar'
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [activeAttributes, setActiveAttributes] = useState({});

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSubcategory = searchParams.get('subcategory') || 'All';

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products');
        if (res.ok) {
          const data = await res.json();
          const productsArray = Array.isArray(data) ? data : (data.content || []);

          const formattedProducts = productsArray.map(p => ({
            id: p.id,
            name: p.name || 'Unnamed',
            category: p.category || 'General',
            subcategory: p.subcategory || 'General',
            price: p.price || 0,
            img: p.img || p.imageUrl || p.image || '📦',
            tag: p.tag || '',
            stock: p.stock || 0,
            attrs: p.attributes || p.attrs || p.specs || {}
          }));

          setProducts(formattedProducts.filter(p => p.stock > 0));
        }
      } catch (err) { console.error("Failed to load catalog."); }
      finally { setIsLoading(false); }
    };
    fetchCatalog();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setActiveAttributes({}); }, [selectedCategory, selectedSubcategory]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);
  const subcategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    return ['All', ...new Set(products.filter(p => p.category === selectedCategory && p.subcategory).map(p => p.subcategory))].sort();
  }, [products, selectedCategory]);

  const availableAttributes = useMemo(() => {
    let baseProducts = products;
    if (selectedCategory !== 'All') baseProducts = baseProducts.filter(p => p.category === selectedCategory);
    if (selectedSubcategory !== 'All') baseProducts = baseProducts.filter(p => p.subcategory === selectedSubcategory);

    const attrMap = {};
    baseProducts.forEach(p => {
      Object.entries(p.attrs).forEach(([key, val]) => {
        if (!attrMap[key]) attrMap[key] = new Set();
        attrMap[key].add(val);
      });
    });

    const finalAttrs = {};
    for (let key in attrMap) {
      if (attrMap[key].size > 1) finalAttrs[key] = Array.from(attrMap[key]).sort();
    }
    return finalAttrs;
  }, [products, selectedCategory, selectedSubcategory]);

  const displayedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category & Subcat Filter
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    if (selectedSubcategory !== 'All') result = result.filter(p => p.subcategory === selectedSubcategory);

    // 2. Search Filter
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.category && p.category.toLowerCase().includes(lowerQuery)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(lowerQuery))
      );
    }

    // 3. Attribute Filter
    if (Object.keys(activeAttributes).length > 0) {
      result = result.filter(p => Object.entries(activeAttributes).every(([attrKey, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        return selectedValues.includes(p.attrs[attrKey]);
      }));
    }

    // 4. Sort & FSDP
    if (sortOrder === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortOrder === 'default') {
      const isSummerFestive = new Date().getMonth() >= 2 && new Date().getMonth() <= 5;
      const userFav = user ? "Cookware" : null;

      result.sort((a, b) => {
        let scoreA = 0; let scoreB = 0;
        if (isSummerFestive) {
          if (a.category === 'Serveware') scoreA += 10;
          if (b.category === 'Serveware') scoreB += 10;
        }
        if (userFav) {
          if (a.category === userFav) scoreA += 5;
          if (b.category === userFav) scoreB += 5;
        }
        if (a.tag) scoreA += 2;
        if (b.tag) scoreB += 2;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, selectedCategory, selectedSubcategory, searchQuery, activeAttributes, sortOrder, user]);

  // 👉 NEW: The Categorization Engine
  const groupedProducts = useMemo(() => {
    const groups = {};
    if (displayedProducts.length === 0) return groups;

    // If viewing "All", group by Main Category
    if (selectedCategory === 'All') {
      displayedProducts.forEach(p => {
        const groupName = p.category || 'Uncategorized';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(p);
      });
    }
    // If viewing a specific Category, group by Subcategory
    else {
      displayedProducts.forEach(p => {
        const groupName = p.subcategory || 'General Items';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(p);
      });
    }

    return groups;
  }, [displayedProducts, selectedCategory]);


  // Handlers
  const handleCategorySelect = (cat) => {
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const handleSubcategorySelect = (subcat) => {
    if (subcat === 'All') setSearchParams({ category: selectedCategory });
    else setSearchParams({ category: selectedCategory, subcategory: subcat });
  };

  const handleAttributeToggle = (attrKey, val) => {
    setActiveAttributes(prev => {
      const currentSelections = prev[attrKey] || [];
      const newSelections = currentSelections.includes(val)
        ? currentSelections.filter(v => v !== val)
        : [...currentSelections, val];
      return { ...prev, [attrKey]: newSelections };
    });
  };

  return (
    <div className="shop-page-wrapper">
<Navbar/>

      <div className="shop-container animate-fade-in">
        <div className="shop-header">
          <h1>Store Catalog</h1>
          <p>Discover premium kitchenware tailored to your exact needs.</p>
        </div>

        <div className="shop-layout">

          <aside className="shop-sidebar">
            <div className="filter-card">
              <h3>Categories</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`btn-category ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                    <span style={{ fontSize: '0.85rem', opacity: selectedCategory === cat ? 1 : 0.6 }}>
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>

              {subcategories.length > 1 && (
                <div className="subcategory-section animate-fade-in">
                  <h4>Filter {selectedCategory}</h4>
                  <div className="subcategory-list">
                    {subcategories.map(subcat => (
                      <button
                        key={subcat}
                        className={`btn-subcat ${selectedSubcategory === subcat ? 'active' : ''}`}
                        onClick={() => handleSubcategorySelect(subcat)}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(availableAttributes).length > 0 && (
                <div className="attribute-section animate-fade-in">
                  {Object.entries(availableAttributes).map(([attrKey, values]) => (
                    <div key={attrKey} className="attribute-group">
                      <h4>{attrKey}</h4>
                      {values.map(val => (
                        <label key={val} className="attribute-checkbox-label">
                          <input
                            type="checkbox"
                            checked={(activeAttributes[attrKey] || []).includes(val)}
                            onChange={() => handleAttributeToggle(attrKey, val)}
                          />
                          {val}
                        </label>
                      ))}
                    </div>
                  ))}

                  {Object.values(activeAttributes).flat().length > 0 && (
                    <button className="btn-clear-filters" onClick={() => setActiveAttributes({})}>
                      Clear Specifications
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          <main className="shop-main">
            <div className="shop-controls">
              <div className="shop-search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="shop-search-input"
                  placeholder="Search for cookers, tawas, knives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select className="shop-sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">✨ Smart Recommended (FSDP)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}><h2 style={{ color: '#64748b' }}>Loading Catalog...</h2></div>
            ) : displayedProducts.length > 0 ? (

              /* 👉 NEW: RENDER THE CATEGORIZED GROUPS */
              <div>
                {Object.entries(groupedProducts).map(([groupName, groupItems]) => (
                  <div key={groupName} className="category-group-section animate-fade-in">

                    <div className="category-group-header">
                      <h2>{groupName}</h2>
                      <span className="category-group-count">{groupItems.length} Items</span>
                    </div>

                    <div className="shop-product-grid">
                      {groupItems.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={(p) => { addToCart(p, 1); showToast(`${p.name} added!`); }}
                          onExplore={(p) => navigate(`/product/${p.id}`)}
                        />
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            ) : (
              <div className="shop-empty-state">
                <span>🤔</span>
                <h3>No products match your exact filters.</h3>
                <button onClick={() => { setSearchQuery(''); setActiveAttributes({}); handleCategorySelect('All'); }} style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {toast.visible && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
          ✅ {toast.message}
        </div>
      )}
    </div>
  );
};

export default Shop;