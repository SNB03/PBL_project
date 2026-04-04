// src/components/recommendations/FSDPRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './FSDPRecommendations.css'; // Uses the same CSS we built earlier

const FSDPRecommendations = ({ currentCategory, currentProductId, showToast }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [seasonData, setSeasonData] = useState({ title: "Trending Now", icon: "🔥", subtitle: "Highly requested items" });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRealRecommendations = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/products');
        if (res.ok) {
          const data = await res.json();
          const productsArray = Array.isArray(data) ? data : (data.content || []);

          // 1. FSDP Contextual Logic (April = Summer/Festive in India)
          const currentMonth = new Date().getMonth(); // 0 = Jan, 3 = April
          let context = { title: "Recommended for You", icon: "⭐", subtitle: "Top picks from our catalog" };

          if (currentMonth >= 2 && currentMonth <= 5) {
            context = { title: "Summer & Festive Essentials", icon: "🍹", subtitle: "Trending for the current season" };
          }
          setSeasonData(context);

          // 2. Filter out the current product & out-of-stock items
          let validProducts = productsArray.filter(
            p => p.id?.toString() !== currentProductId?.toString() && p.stock > 0
          );

          // 3. Smart Sorting: Prioritize similar category, then fill with the rest
          let recommended = validProducts.filter(p => p.category === currentCategory);

          if (recommended.length < 5) {
            const others = validProducts.filter(p => p.category !== currentCategory);
            recommended = [...recommended, ...others];
          }

          // 4. Data Normalization for the UI
          const finalRecs = recommended.slice(0, 6).map(p => ({
            id: p.id,
            name: p.name || 'Unnamed',
            price: p.price || 0,
            img: p.img || p.imageUrl || p.image || '📦'
          }));

          setRecommendations(finalRecs);
        }
      } catch (err) {
        console.error("Failed to fetch FSDP recommendations", err);
      }
    };

    fetchRealRecommendations();
  }, [currentCategory, currentProductId]);

  const handleQuickAdd = (product) => {
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart!`);
  };

  const renderImage = (img) => {
    if (img && img.startsWith('http')) return <img src={img} alt="Product" style={{width: '80%', height: '80%', objectFit: 'contain'}} />;
    return img || '📦';
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="fsdp-container animate-fade-in">
      <div className="fsdp-header">
        <div className="fsdp-icon">{seasonData.icon}</div>
        <div className="fsdp-title">
          <h3>{seasonData.title}</h3>
          <p>{seasonData.subtitle}</p>
        </div>
      </div>

      <div className="fsdp-scroll-wrapper">
        {recommendations.map(product => (
          <div key={product.id} className="fsdp-card">
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <div className="fsdp-img-box">
                {renderImage(product.img)}
              </div>
              <h4>{product.name}</h4>
              <div className="price">₹{product.price.toLocaleString()}</div>
            </Link>
            <button className="fsdp-btn" onClick={() => handleQuickAdd(product)}>
              Quick Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FSDPRecommendations;