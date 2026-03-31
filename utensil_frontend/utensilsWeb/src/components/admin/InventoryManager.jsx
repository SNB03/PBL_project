// src/components/admin/InventoryManager.jsx
import React, { useState, useMemo } from 'react';

const InventoryManager = ({ inventory, setInventory, fetchInventory }) => {
  // --- FILTER STATES ---
// --- FILTER STATES ---
  const [invSearch, setInvSearch] = useState('');
  const [invCat, setInvCat] = useState('All');
  const [invSubCat, setInvSubCat] = useState('All');
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [stockFilter, setStockFilter] = useState('All');
  // --- MODAL STATES ---
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null); // NEW: For the Details Modal
// --- NEW: CLEAR FILTERS LOGIC ---
  const clearFilters = () => {
    setInvSearch('');
    setInvCat('All');
    setInvSubCat('All');
    setDynamicFilters({});
    setStockFilter('All');
  };
// Check if any filter is currently active so we can show/hide the Clear button
  const hasActiveFilters =
    invSearch !== '' ||
    invCat !== 'All' ||
    invSubCat !== 'All' ||
    stockFilter !== 'All' ||
    Object.values(dynamicFilters).some(val => val !== 'All');
  // --- CASCADING DYNAMIC FILTERS LOGIC ---
  const availableCategories = ['All', ...new Set(inventory.map(i => i.category).filter(Boolean))];
  const availableSubCats = invCat === 'All' ? [] : [...new Set(inventory.filter(i => i.category === invCat).map(i => i.subcategory).filter(Boolean))];

  const availableAttributes = useMemo(() => {
    if (invSubCat === 'All') return {};
    const attrsMap = {};
    const relevantProducts = inventory.filter(i => i.category === invCat && i.subcategory === invSubCat);
    relevantProducts.forEach(product => {
      if (product.attrs) {
        Object.entries(product.attrs).forEach(([key, value]) => {
          if (!attrsMap[key]) attrsMap[key] = new Set();
          attrsMap[key].add(value);
        });
      }
    });
    const finalMap = {};
    Object.keys(attrsMap).forEach(key => { finalMap[key] = ['All', ...Array.from(attrsMap[key])]; });
    return finalMap;
  }, [inventory, invCat, invSubCat]);

  // THE FINAL FILTER ENGINE
  const filteredInventory = inventory.filter(item => {
    // 1. Text Search
    if (invSearch && !item.name.toLowerCase().includes(invSearch.toLowerCase())) return false;
    // 2. Category Search
    if (invCat !== 'All' && item.category !== invCat) return false;
    if (invSubCat !== 'All' && item.subcategory !== invSubCat) return false;
    // 3. Quick Stock Search
    if (stockFilter === 'Out' && item.stock > 0) return false;
    if (stockFilter === 'Low' && (item.stock === 0 || item.stock > 5)) return false;
    // 4. Dynamic Attribute Search
    for (const [attrKey, selectedValue] of Object.entries(dynamicFilters)) {
      if (selectedValue !== 'All') {
        if (!item.attrs || item.attrs[attrKey] !== selectedValue) return false;
      }
    }
    return true;
  });

  // --- HANDLERS ---
  const handleDynamicFilterChange = (key, value) => {
    setDynamicFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const res = await fetch(`http://localhost:8080/api/products/${productId}/stock?stock=${newStock}`, { method: 'PATCH' });
      if (res.ok) {
        setInventory(inventory.map(i => i.id === productId ? { ...i, stock: Number(newStock) } : i));
        alert("✅ Stock updated!");
      }
    } catch (err) { alert("Server error."); }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}" from the catalog permanently?`)) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) setInventory(inventory.filter(i => i.id !== productId));
    } catch (err) { alert("Server error."); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setInventory(inventory.map(i => i.id === updatedProduct.id ? updatedProduct : i));
        setEditingProduct(null);
        alert("✅ Product updated successfully!");
      }
    } catch (err) { alert("Server error."); }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch('http://localhost:8080/api/products/bulk-upload', { method: 'POST', body: formData });
      if (res.ok) { alert(`✅ Success!`); fetchInventory(); }
    } catch (error) { alert("Server error."); } finally { e.target.value = null; }
  };

  return (
    <div className="admin-section animate-fade-in relative">
      <div className="admin-header flex-between">
        <h2>Inventory Management</h2>
        <div className="bulk-upload-area">
          <input type="file" id="csv-upload" accept=".csv" onChange={handleBulkUpload} style={{ display: 'none' }} />
          <label htmlFor="csv-upload" className="btn-bulk-upload">📄 Bulk Upload (CSV)</label>
        </div>
      </div>

      {/* --- NEW: QUICK STOCK FILTERS --- */}
      <div className="mobile-tabs" style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <button className={`m-tab ${stockFilter === 'All' ? 'active' : ''}`} onClick={() => setStockFilter('All')}>
          Full Catalog ({inventory.length})
        </button>
        <button className={`m-tab ${stockFilter === 'Low' ? 'active' : ''}`} onClick={() => setStockFilter('Low')} style={{ color: stockFilter === 'Low' ? '#f59e0b' : '' }}>
          Low Stock ({inventory.filter(i => i.stock > 0 && i.stock <= 5).length})
        </button>
        <button className={`m-tab ${stockFilter === 'Out' ? 'active' : ''}`} onClick={() => setStockFilter('Out')} style={{ color: stockFilter === 'Out' ? '#ef4444' : '' }}>
          Out of Stock ({inventory.filter(i => i.stock === 0).length})
        </button>
      </div>

      {/* --- CASCADING FILTER PANEL --- */}
            <div className="deep-filter-panel" style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>

              {/* Filter Header & Clear Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>🔍 Search & Filter</h3>

                {/* THE CLEAR FILTERS BUTTON (Only visible when filters are active) */}
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    ✖ Clear All Filters
                  </button>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Showing all products</span>
                )}
              </div>

              {/* Search & Dropdowns Row */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>

                <div className="search-box" style={{ flex: '1', minWidth: '250px', margin: 0 }}>
                  <span className="icon">🔍</span>
                  <input type="text" placeholder="Search product name..." value={invSearch} onChange={(e) => setInvSearch(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>

                <select value={invCat} onChange={(e) => { setInvCat(e.target.value); setInvSubCat('All'); setDynamicFilters({}); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                </select>

                {availableSubCats.length > 0 && (
                  <select value={invSubCat} onChange={(e) => { setInvSubCat(e.target.value); setDynamicFilters({}); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}>
                    <option value="All">All Subcategories</option>
                    {availableSubCats.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                )}

                {/* Dynamic Attribute Dropdowns */}
                {Object.keys(availableAttributes).map(attrKey => (
                  <select key={attrKey} value={dynamicFilters[attrKey] || 'All'} onChange={(e) => handleDynamicFilterChange(attrKey, e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderLeft: '4px solid #3b82f6', minWidth: '150px' }}>
                    <option value="All">Any {attrKey}</option>
                    {availableAttributes[attrKey].filter(val => val !== 'All').map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                ))}

              </div>
            </div>

      {/* --- TABLE --- */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead><tr><th>Product Details</th><th>Category</th><th>Stock</th><th>Quick Actions</th></tr></thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td className="font-bold">
                  {item.name}<br/>
                  <span className="sub-text text-orange">₹{item.price}</span>
                </td>
                <td><span className="category-pill">{item.category} {item.subcategory ? `> ${item.subcategory}` : ''}</span></td>
                <td>{item.stock === 0 ? <span className="stock-badge out">Out</span> : item.stock <= 5 ? <span className="stock-badge low">{item.stock} Left</span> : <span className="stock-badge good">{item.stock} in Stock</span>}</td>
                <td>
                  <div className="quick-update-group">
                    <input type="number" defaultValue={item.stock} min="0" id={`stock-${item.id}`} className="stock-input" />
                    <button className="btn-update" onClick={() => handleStockUpdate(item.id, document.getElementById(`stock-${item.id}`).value)}>Save</button>

                    {/* NEW: VIEW DETAILS BUTTON */}
                    <button className="btn-action" style={{ backgroundColor: '#10b981', color: 'white', padding: '8px', marginLeft: '10px' }} onClick={() => setViewingProduct(item)} title="View Full Details">👁️</button>

                    <button className="btn-action" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', marginLeft: '5px' }} onClick={() => setEditingProduct(item)} title="Edit Product">✏️</button>
                    <button className="btn-action" style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px', marginLeft: '5px' }} onClick={() => handleDeleteProduct(item.id, item.name)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================
          MODAL 1: VIEW FULL PRODUCT DETAILS
          ========================================= */}
      {viewingProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content animate-slide-up" style={{ backgroundColor: 'white', padding: '0', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>

            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>Product Specifications</h2>
              <button onClick={() => setViewingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✖</button>
            </div>

            <div style={{ padding: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Product Image Placeholder/Real Image */}
              <div style={{ flex: '1', minWidth: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', fontSize: '4rem' }}>
                {viewingProduct.img ? (viewingProduct.img.startsWith('http') ? <img src={viewingProduct.img} alt={viewingProduct.name} style={{width: '100%', borderRadius: '12px'}}/> : viewingProduct.img) : '📦'}
              </div>

              {/* Core Details */}
              <div style={{ flex: '2', minWidth: '300px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: '#0f172a' }}>{viewingProduct.name}</h1>
                <p style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#f59e0b', fontWeight: 'bold' }}>
                  ₹{viewingProduct.price} {viewingProduct.originalPrice && <span style={{textDecoration:'line-through', color:'#94a3b8', fontSize:'1rem'}}>₹{viewingProduct.originalPrice}</span>}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <span className="category-pill" style={{ marginRight: '10px' }}>{viewingProduct.category} {viewingProduct.subcategory ? `> ${viewingProduct.subcategory}` : ''}</span>
                  {viewingProduct.stock === 0 ? <span className="stock-badge out">Out of Stock</span> : viewingProduct.stock <= 5 ? <span className="stock-badge low">{viewingProduct.stock} Left in Warehouse</span> : <span className="stock-badge good">{viewingProduct.stock} Available in Warehouse</span>}
                </div>

                <p style={{ color: '#475569', lineHeight: '1.6' }}>{viewingProduct.shortDesc || "No description provided."}</p>
              </div>
            </div>

            {/* Dynamic Attributes Grid */}
            <div style={{ padding: '20px 30px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>Technical & Variant Attributes</h3>
              {viewingProduct.attrs && Object.keys(viewingProduct.attrs).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {Object.entries(viewingProduct.attrs).map(([key, value]) => (
                    <div key={key} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>{key}</span>
                      <span style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '500' }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8' }}>No specific variant attributes recorded for this product.</p>
              )}
            </div>

            <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button className="btn-action primary" onClick={() => { setEditingProduct(viewingProduct); setViewingProduct(null); }}>✏️ Edit Product</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: EDIT PRODUCT
          ========================================= */}
      {editingProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          {/* ... (Your existing Edit Modal code stays exactly the same here) ... */}
           <div className="modal-content" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group"><label>Name</label><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}/></div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <div className="form-group flex-1"><label>Price (₹)</label><input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}/></div>
                <div className="form-group flex-1"><label>Original Price (₹)</label><input type="number" value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({...editingProduct, originalPrice: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}/></div>
              </div>
              <div className="form-group" style={{ marginTop: '15px' }}><label>Short Description</label><textarea value={editingProduct.shortDesc || ''} onChange={e => setEditingProduct({...editingProduct, shortDesc: e.target.value})} rows="3" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1'}}/></div>

              <button type="submit" className="btn-action primary" style={{ width: '100%', marginTop: '25px', padding: '15px', fontSize: '1.1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;