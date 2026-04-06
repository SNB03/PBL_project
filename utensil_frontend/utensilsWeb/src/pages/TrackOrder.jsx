// src/pages/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { FaClipboardList, FaBoxOpen, FaTruck, FaCheckCircle } from 'react-icons/fa';
import './TrackOrder.css';

const TrackOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Security & Fetching
  useEffect(() => {
    // 1. Kick out guests immediately
    if (!user) {
      navigate('/');
      return;
    }

    // 2. Fetch Order History
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/orders/customer/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Sort newest orders first
          data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  // 👉 The Progress Bar Logic Engine
  const getStepStatus = (orderStatus, stepIndex) => {
    // Map your DB string to a numerical step
    const statusMap = {
      'PLACED': 1,
      'PROCESSING': 2,
      'SHIPPED': 3,
      'DELIVERED': 4,
      'COMPLETED': 4 // Fallback if your DB uses COMPLETED
    };

    const currentStep = statusMap[orderStatus?.toUpperCase()] || 1;

    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'active';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="orders-page-wrapper">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px' }}><h2 style={{color: '#64748b'}}>Loading your orders...</h2></div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <Navbar />

      <div className="orders-container animate-fade-in">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track your recent shipments and view your purchase history.</p>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <span style={{ fontSize: '3rem' }}>🛍️</span>
            <h3 style={{ margin: '15px 0 10px 0', color: '#0f172a' }}>No orders yet.</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Looks like you haven't made your first purchase.</p>
            <Link to="/shop" style={{ padding: '12px 25px', backgroundColor: '#d35400', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">

              {/* HEADER INFO */}
              <div className="order-header-row">
                <div className="order-meta">
                  <div>Order Placed</div>
                  <span>{new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="order-meta">
                  <div>Total Amount</div>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="order-meta">
                  <div>Order ID</div>
                  <span style={{ fontFamily: 'monospace' }}>#{order.id.toString().padStart(6, '0')}</span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="order-tracking-section">
                <div className="progress-track">

                  <div className={`step ${getStepStatus(order.status, 1)}`}>
                    <div className="step-icon"><FaClipboardList /></div>
                    <span className="step-label">Order<br/>Placed</span>
                  </div>

                  <div className={`step ${getStepStatus(order.status, 2)}`}>
                    <div className="step-icon"><FaBoxOpen /></div>
                    <span className="step-label">Processing</span>
                  </div>

                  <div className={`step ${getStepStatus(order.status, 3)}`}>
                    <div className="step-icon"><FaTruck /></div>
                    <span className="step-label">Shipped</span>
                  </div>

                  <div className={`step ${getStepStatus(order.status, 4)}`}>
                    <div className="step-icon"><FaCheckCircle /></div>
                    <span className="step-label">Delivered</span>
                  </div>

                </div>
              </div>

              {/* ITEMS IN THIS ORDER */}
              <div className="order-items-section">
                <h4>Items in your package</h4>
                {order.itemsList?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <div className="item-thumbnail">
                      {item.img && item.img.startsWith('http') ? <img src={item.img} alt={item.productName} /> : '📦'}
                    </div>
                    <div className="item-details">
                      <h5>{item.productName || 'UtensilPro Item'}</h5>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-line-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrackOrder;