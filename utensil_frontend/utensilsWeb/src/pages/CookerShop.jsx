// src/pages/CookerShop.jsx
import React, { useState, useMemo } from 'react';
import './CookerShop.css';

const CookerShop = () => {
  // 1. ROBUST MOCK DATA FOR COOKERS
  const initialCookers = [
    { id: 101, brand: "Prestige", name: "Svachh Stainless Steel", size: "3L", lid: "Outer Lid", material: "Stainless Steel", price: 2100, img: "🍲", desc: "Deep lid design controls spillage. Tri-ply bottom for even heating." },
    { id: 102, brand: "Hawkins", name: "Contura Hard Anodized", size: "3L", lid: "Inner Lid", material: "Black (Anodized)", price: 1850, img: "🥘", desc: "Curved body for easy stirring. Doesn't react with food." },
    { id: 103, brand: "Prestige", name: "Nakshatra Plus", size: "5L", lid: "Inner Lid", material: "Black (Anodized)", price: 2400, img: "🥘", desc: "Aesthetic design with a heavy base for durability." },
    { id: 104, brand: "Pigeon", name: "Inox Stainless Steel", size: "5L", lid: "Outer Lid", material: "Stainless Steel", price: 1900, img: "🍲", desc: "High-quality steel with an ergonomic handle." },
    { id: 105, brand: "Hawkins", name: "Classic Aluminum", size: "5L", lid: "Inner Lid", material: "Aluminum", price: 1600, img: "🥘", desc: "The classic, reliable inner-lid cooker trusted for generations." },
    { id: 106, brand: "Prestige", name: "Svachh Deluxe Alpha", size: "6.5L", lid: "Outer Lid", material: "Stainless Steel", price: 3100, img: "🍲", desc: "Large capacity for joint families. Induction compatible." }
  ];

  // 2. FILTER STATES
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedLid, setSelectedLid] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');

  // 3. DYNAMIC LOGIC: Available Brands depends on Selected Size
  const availableBrands = useMemo(() => {
    if (selectedSize === 'All') {
      return [...new Set(initialCookers.map(c => c.brand))];
    }
    // Only show brands that actually manufacture the selected size
    const filteredBySize = initialCookers.filter(c => c.size === selectedSize);
    return [...new Set(filteredBySize.map(c => c.brand))];
  }, [selectedSize]);

  // Reset Brand if the newly selected size doesn't have that brand
  if (selectedBrand !== 'All' && !availableBrands.includes(selectedBrand)) {
    setSelectedBrand('All');
  }

  // 4. FINAL FILTERING LOGIC
  const filteredCookers = initialCookers.filter(cooker => {
    return (
      (selectedSize === 'All' || cooker.size === selectedSize) &&
      (selectedBrand === 'All' || cooker.brand === selectedBrand) &&
      (selectedLid === 'All' || cooker.lid === selectedLid) &&
      (selectedMaterial === 'All' || cooker.material === selectedMaterial)
    );
  });
// --- ADD TO CART LOGIC ---
  const handleAddToCart = (cooker) => {
    // 1. Get the existing cart from local storage, or start an empty array
    const existingCart = JSON.parse(localStorage.getItem('utensil_cart')) || [];

    // 2. Format the cooker data to match what the Cart page expects
    const cartItem = {
      id: cooker.id,
      name: `${cooker.brand} ${cooker.name}`,
      category: "Cookware",
      price: cooker.price,
      image: cooker.img
    };

    // 3. Add to cart and save
    existingCart.push(cartItem);
    localStorage.setItem('utensil_cart', JSON.stringify(existingCart));

    alert(`${cartItem.name} added to your cart! 🛒`);
  };
  return (
    <div className="cooker-shop-container">

      <div className="shop-header">
        <h1>Pressure Cookers</h1>
        <p>Find the perfect cooker for your family's needs.</p>
      </div>

      <div className="shop-layout">

        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className="filter-sidebar">
          <h3>Filters</h3>
          <button
            className="clear-btn"
            onClick={() => {
              setSelectedSize('All'); setSelectedBrand('All');
              setSelectedLid('All'); setSelectedMaterial('All');
            }}
          >
            Clear All
          </button>

          {/* 1. Size Filter */}
          <div className="filter-group">
            <h4>Capacity (Size)</h4>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="All">All Sizes</option>
              <option value="3L">3 Liters</option>
              <option value="5L">5 Liters</option>
              <option value="6.5L">6.5 Liters</option>
            </select>
          </div>

          {/* 2. Brand Filter (Depends on Size) */}
          <div className="filter-group">
            <h4>Brand {selectedSize !== 'All' && <span className="dep-text">(Available in {selectedSize})</span>}</h4>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
              <option value="All">All Brands</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* 3. Lid Type Filter */}
          <div className="filter-group radio-group">
            <h4>Lid Type</h4>
            <label><input type="radio" name="lid" checked={selectedLid === 'All'} onChange={() => setSelectedLid('All')} /> Any</label>
            <label><input type="radio" name="lid" checked={selectedLid === 'Inner Lid'} onChange={() => setSelectedLid('Inner Lid')} /> Inner Lid</label>
            <label><input type="radio" name="lid" checked={selectedLid === 'Outer Lid'} onChange={() => setSelectedLid('Outer Lid')} /> Outer Lid</label>
          </div>

          {/* 4. Material Filter */}
          <div className="filter-group radio-group">
            <h4>Material</h4>
            <label><input type="radio" name="mat" checked={selectedMaterial === 'All'} onChange={() => setSelectedMaterial('All')} /> Any</label>
            <label><input type="radio" name="mat" checked={selectedMaterial === 'Stainless Steel'} onChange={() => setSelectedMaterial('Stainless Steel')} /> Stainless Steel</label>
            <label><input type="radio" name="mat" checked={selectedMaterial === 'Black (Anodized)'} onChange={() => setSelectedMaterial('Black (Anodized)')} /> Black (Hard Anodized)</label>
            <label><input type="radio" name="mat" checked={selectedMaterial === 'Aluminum'} onChange={() => setSelectedMaterial('Aluminum')} /> Aluminum</label>
          </div>
        </aside>

        {/* --- RIGHT SIDE: PRODUCT GRID --- */}
        <main className="product-results">
          <div className="results-header">
            <span>Showing {filteredCookers.length} Cookers</span>
          </div>

          {filteredCookers.length === 0 ? (
            <div className="no-results">
              <p>No cookers match your selected filters.</p>
              <button onClick={() => setSelectedSize('All')}>Reset Filters</button>
            </div>
          ) : (
            <div className="cooker-grid">
              {filteredCookers.map(cooker => (
                <div key={cooker.id} className="cooker-card">
                  <div className="cooker-img-box">
                    <span className="cooker-emoji">{cooker.img}</span>
                    <span className="size-badge">{cooker.size}</span>
                  </div>
                  <div className="cooker-info">
                    <span className="brand-name">{cooker.brand}</span>
                    <h3>{cooker.name}</h3>

                    {/* Key Attributes */}
                    <div className="attribute-tags">
                      <span className="tag">{cooker.lid}</span>
                      <span className="tag">{cooker.material}</span>
                    </div>

                    <p className="cooker-desc">{cooker.desc}</p>

                    <div className="cooker-footer">
                      <span className="price">₹{cooker.price}</span>
                      <button className="btn-add" onClick={() => handleAddToCart(cooker)}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CookerShop;