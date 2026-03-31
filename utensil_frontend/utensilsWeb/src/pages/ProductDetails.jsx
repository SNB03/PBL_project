import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Storefront.css'; // Reuse our beautiful CSS
import CustomerNavbar from '../components/CustomerNavbar';

const ProductDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Security State
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch ALL products (We filter locally for simplicity, but in production use a /api/products/{id} endpoint)
        const res = await fetch('http://localhost:8080/api/products?size=500');
        if (res.ok) {
          const data = await res.json();
          const catalog = data.content ? data.content : data;

          // Find the exact product
          const currentProduct = catalog.find(p => p.id === id);
          setProduct(currentProduct);

          // Find 4 similar products (same category, but not this exact one)
          if (currentProduct) {
            const similar = catalog
              .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
              .slice(0, 4);
            setSimilarProducts(similar);
          }
        }

        // 2. Security Check: Did this specific user buy this specific item?
        if (user) {
          // You will need a backend endpoint for this. Simulating the check here:
          const orderRes = await fetch(`http://localhost:8080/api/orders/customer/${user.id}`);
          if (orderRes.ok) {
            const userOrders = await orderRes.json();
            // Check if any COMPLETED order contains this product ID
            const boughtIt = userOrders.some(order =>
              order.status === 'COMPLETED' &&
              order.itemsList.some(item => item.productId === id)
            );
            setHasPurchased(boughtIt);
          }
        }

      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0); // Scroll to top when loading a new product
  }, [id, user]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!hasPurchased) return alert("You can only review products you have purchased.");

    // Send to backend (You will need to create this Spring Boot endpoint!)
    alert(`Review submitted! Rating: ${rating} Stars. Text: ${reviewText}`);
    setReviewText('');
  };

  if (isLoading) return <div className="loading-state"><div className="spinner"></div></div>;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  return (
    <div className="storefront-container">
      {/* NAVBAR */}

            <CustomerNavbar />


      <main className="store-main" style={{ paddingTop: '40px' }}>

        {/* BREADCRUMBS */}
        <div style={{ marginBottom: '30px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
          <span style={{ margin: '0 10px' }}>/</span>
          <Link to={`/category/${product.category}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>{product.category}</Link>
          <span style={{ margin: '0 10px' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{product.name}</span>
        </div>

        {/* HERO SECTION: Image & Core Details */}
        <div style={{ display: 'flex', gap: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '40px', flexWrap: 'wrap' }}>

          {/* Left: Image */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', fontSize: '8rem' }}>
            {product.img && product.img.startsWith('http') ? (
              <img src={product.img} alt={product.name} style={{ width: '100%', objectFit: 'contain' }} />
            ) : (
              product.img || '📦'
            )}
          </div>

          {/* Right: Info & Checkout */}
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
            <span className="product-category" style={{ fontSize: '1rem', marginBottom: '10px' }}>{product.category} {product.subcategory ? `> ${product.subcategory}` : ''}</span>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 20px 0', color: '#0f172a', lineHeight: '1.2' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '30px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>₹{Number(product.price).toLocaleString()}</span>
              {product.originalPrice && <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{Number(product.originalPrice).toLocaleString()}</span>}
            </div>

            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
              {product.shortDesc || "Professional grade kitchen equipment designed for durability and daily use."}
            </p>

            {/* Dynamic Attributes Grid */}
            {product.attrs && Object.keys(product.attrs).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                {Object.entries(product.attrs).map(([key, value]) => (
                  <div key={key}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>{key}</span>
                    <span style={{ color: '#0f172a', fontWeight: '500' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-add-to-cart"
              style={{ padding: '20px', fontSize: '1.2rem', marginTop: 'auto' }}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8rem' }}>Customer Reviews</h2>

          {hasPurchased ? (
            <form onSubmit={submitReview} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>Write a Review</h4>
              <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '10px', marginBottom: '15px', width: '100px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
              </select>
              <textarea
                rows="4"
                placeholder="How did you like this product?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontFamily: 'inherit' }}
                required
              />
              <button type="submit" className="btn-add-to-cart" style={{ width: 'auto', padding: '10px 30px' }}>Submit Review</button>
            </form>
          ) : (
            <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '15px 20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #fde68a' }}>
              ℹ️ Only customers who have purchased and received this item can leave a review.
            </div>
          )}

          {/* Render Mock Reviews (Will be replaced with real data from MongoDB) */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{rev.userName} <span style={{ color: '#f59e0b' }}>{"⭐".repeat(rev.rating)}</span></div>
                  <p style={{ color: '#475569', margin: '5px 0 0 0' }}>{rev.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b' }}>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>

        {/* SIMILAR PRODUCTS SECTION */}
        {similarProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '20px' }}>You Might Also Like</h2>
            <div className="product-grid">
              {similarProducts.map(p => (
                <div key={p.id} className="product-card">
                  <Link to={`/product/${p.id}`} className="product-image-container" style={{ textDecoration: 'none', color: 'inherit', height: '200px' }}>
                    {p.img && p.img.startsWith('http') ? <img src={p.img} alt={p.name} /> : <div className="emoji-placeholder" style={{fontSize: '4rem'}}>{p.img || '📦'}</div>}
                  </Link>
                  <div className="product-details" style={{ padding: '15px' }}>
                    <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="product-name" style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{p.name}</h3>
                    </Link>
                    <span className="product-price" style={{ fontSize: '1.2rem' }}>₹{Number(p.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProductDetails;