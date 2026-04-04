// src/components/ui/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAdd, onExplore }) => {
  // Normalize attributes to extract distinguishing factors (e.g., Capacity, Material)
  const attrs = product.attributes || product.attrs || product.specs || {};
  const distinguishingFactors = Object.entries(attrs).slice(0, 2); // Get first 2 specs

  const renderImage = () => {
    if (product.img && product.img.startsWith('http')) {
      return <img src={product.img} alt={product.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />;
    }
    return <span style={{ fontSize: '4rem' }}>{product.img || '📦'}</span>;
  };

  return (
    <div className="item-card">
      {product.tag && <span className="quality-tag">{product.tag}</span>}

      <Link to={`/product/${product.id}`} className="clickable-product-link">
        <div className="item-img">
          {renderImage()}
        </div>
      </Link>

      <div className="item-details">
        <div style={{ marginBottom: '8px' }}>
          {/* Display Category > Subcategory */}
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
            {product.category} {product.subcategory && `• ${product.subcategory}`}
          </span>
          <Link to={`/product/${product.id}`} className="clickable-product-link">
            <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.1rem' }}>{product.name}</h4>
          </Link>
        </div>

        {/* 👉 NEW: Show Distinguishing Factors on the card */}
        {distinguishingFactors.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
            {distinguishingFactors.map(([key, val]) => (
              <span key={key} style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <strong>{key}:</strong> {val}
              </span>
            ))}
          </div>
        )}

        <span className="item-price">₹{product.price?.toLocaleString()}</span>
      </div>

      <div className="card-actions">
        <button className="btn-add-small" onClick={() => onAdd(product)}>Add to Cart</button>
        <button className="btn-explore" onClick={() => onExplore(product)}>Explore</button>
      </div>
    </div>
  );
};

export default ProductCard;