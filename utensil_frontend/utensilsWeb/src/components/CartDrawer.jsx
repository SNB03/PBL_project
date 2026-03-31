// src/components/CartDrawer.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css'; // We'll create a quick CSS file for this next
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isCartOpen) return null;
  const handleCheckout = async () => {
    setIsCheckingOut(true);

        // 3. Attach REAL user data to the order
        const newOrder = {
          customerId: user.id.toString(), // Link to the SQL User ID!
          customerName: user.name,        // Link to the SQL User Name!
          type: "Home Delivery",
          total: cartTotal,
          status: "PENDING",
          itemsList: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            qty: item.qty,
            price: item.price
          }))
        };

    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (response.ok) {
        alert("🎉 Order placed successfully! The admin has been notified.");
        clearCart();
        setIsCartOpen(false);
      } else {
        alert("❌ Failed to place order. Please try again.");
      }
    } catch (error) {
      alert("Server error. Could not connect to backend.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}></div>
      <div className="cart-drawer animate-slide-left">

        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-btn">✖</button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-msg">Your cart is empty.</div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <span className="cart-item-price">₹{item.price}</span>
                </div>

                <div className="cart-qty-controls">
                  <button onClick={() => updateQuantity(item.id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>

       {cartItems.length > 0 && (
                 <div className="cart-footer">
                   <div className="cart-total-row">
                     <span>Subtotal:</span>
                     <span className="cart-total-price">₹{cartTotal.toLocaleString()}</span>
                   </div>

                   {/* 4. DYNAMIC CHECKOUT BUTTON */}
                   {user ? (
                     <button className="btn-checkout" onClick={handleCheckout} disabled={isCheckingOut}>
                       {isCheckingOut ? 'Processing...' : `Checkout as ${user.name}`}
                     </button>
                   ) : (
                     <button className="btn-checkout" style={{ backgroundColor: '#f59e0b' }} onClick={() => { setIsCartOpen(false); navigate('/login'); }}>
                       Login to Checkout
                     </button>
                   )}

                 </div>
               )}
      </div>
    </div>
  );
};

export default CartDrawer;