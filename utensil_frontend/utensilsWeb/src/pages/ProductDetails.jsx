// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar'
import FSDPRecommendations from '../components/recommendations/FSDPRecommendations';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Review State
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Product
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          data.normalizedAttrs = data.attributes || data.attrs || data.specs || {};
          setProduct(data);
          setQty(1);
        }

        // 2. Security Check: Did user buy this? (Restored your logic exactly)
        if (user) {
          const orderRes = await fetch(`http://localhost:8080/api/orders/customer/${user.id}`);
          if (orderRes.ok) {
            const userOrders = await orderRes.json();
            const boughtIt = userOrders.some(order =>
              order.status === 'COMPLETED' &&
              order.itemsList.some(item => item.productId?.toString() === id?.toString())
            );
            setHasPurchased(boughtIt);
          }
        }
      } catch (err) {
        console.error("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, user]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast(`Added ${qty}x ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!hasPurchased) return alert("You can only review products you have purchased.");

    // Note: You will need a Spring Boot POST endpoint for this!
    showToast(`Review submitted! Rating: ${rating} Stars.`);
    setReviewText('');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Product not found</div>;

  return (
    <div className="product-page-wrapper">
<Navbar/>

      <div className="product-container animate-fade-in">

        {/* 👉 EASY NAVIGATION BAR */}
        <div className="nav-breadcrumb-bar">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="breadcrumb" style={{ margin: 0 }}>
            <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.category}
          </div>
        </div>

        {/* MAIN PRODUCT INFO */}
        <div className="product-main-grid">

          <div className="product-gallery">
            <div className="main-image-box">
              {product.img && product.img.startsWith('http') ? (
                <img src={product.img} alt={product.name} />
              ) : (
                <span>{product.img || '📦'}</span>
              )}
            </div>
          </div>

          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>

            {product.stock > 0 ? (
              <span className="product-badge">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="product-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>Out of Stock</span>
            )}

            <div className="product-price-box">
              <span className="product-price">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="product-mrp">MRP: ₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="product-desc">
              {product.description || product.shortDesc || "Upgrade your kitchen experience with this premium utensil."}
            </p>

            <div className="purchase-box">
              <div className="qty-row">
                <span style={{ fontWeight: '600', color: '#475569' }}>Quantity:</span>
                <div className="qty-controls">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-add-cart" onClick={handleAddToCart} disabled={product.stock <= 0}>
                  Add to Cart
                </button>
                <button className="btn-buy-now" onClick={handleBuyNow} disabled={product.stock <= 0}>
                  Buy it Now
                </button>
              </div>
            </div>

            {Object.keys(product.normalizedAttrs).length > 0 && (
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.normalizedAttrs).map(([key, val]) => (
                    <tr key={key}>
                      <th>{key.toUpperCase()}</th>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 👉 RESTORED REVIEWS SECTION */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          {hasPurchased ? (
            <form className="review-form-card" onSubmit={submitReview}>
              <h4 style={{ margin: '0 0 15px 0' }}>Write a Review</h4>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
              <textarea
                className="review-textarea"
                rows="4"
                placeholder="How did you like this product?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
              <button type="submit" className="review-submit-btn">Submit Review</button>
            </form>
          ) : (
            <div className="review-locked-msg">
              ℹ️ Only customers who have purchased and received this item can leave a review.
            </div>
          )}

          <div>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {rev.userName} <span style={{ color: '#f59e0b', marginLeft: '10px' }}>{"⭐".repeat(rev.rating)}</span>
                  </div>
                  <p style={{ color: '#475569', margin: '5px 0 0 0', lineHeight: '1.5' }}>{rev.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b' }}>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>

        {/* REAL FSDP RECOMMENDATION ENGINE */}
        <FSDPRecommendations
          currentCategory={product.category}
          currentProductId={product.id}
          showToast={showToast}
        />

      </div>

      {/* TOAST NOTIFICATION */}
      {toast.visible && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '12px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
          ✅ {toast.message}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;