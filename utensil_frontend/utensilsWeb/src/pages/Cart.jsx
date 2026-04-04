// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/layout/Navbar'; // 👉 Uses the new global Navbar
import './Cart.css'; // 👉 Hooks into our new responsive CSS

const Cart = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step Management
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Address, 2 = Payment Selection

  // Form States
  const [fulfillmentType, setFulfillmentType] = useState('Home Delivery');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentType, setPaymentType] = useState('ONLINE'); // 'ONLINE' or 'COD'
  const [isProcessing, setIsProcessing] = useState(false);

  // Billing Math
  const deliveryFee = fulfillmentType === 'Home Delivery' && cartTotal < 999 ? 50 : 0;
  const platformFee = 5;
  const finalTotal = cartTotal + deliveryFee + platformFee;

  // Step 1 Validation
  const handleProceedToPayment = () => {
    if (fulfillmentType === 'Home Delivery' && address.trim().length < 10) {
      return alert("Please enter a complete delivery address to continue.");
    }
    setCheckoutStep(2); // Move to Payment Screen
    window.scrollTo(0, 0);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step 2 Finalization
  const handleFinalCheckout = async () => {
    setIsProcessing(true);

    const orderPayload = {
      customerId: user.id.toString(),
      customerName: user.name,
      phone: user.phone,
      type: fulfillmentType,
      address: fulfillmentType === 'Home Delivery' ? address : 'Store Pickup',
      paymentMethod: paymentType,
      deliveryFee: deliveryFee,
      total: finalTotal,
      status: paymentType === 'COD' ? "PENDING" : "AWAITING_PAYMENT",
      itemsList: cartItems.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price }))
    };

    try {
      if (paymentType === 'COD') {
        // --- COD DIRECT SAVE ---
        const res = await fetch('http://localhost:8080/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (res.ok) {
          alert("🎉 Order Placed! Please keep cash ready at delivery.");
          clearCart();
          navigate('/profile');
        }
      } else {
        // --- RAZORPAY FLOW ---
        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) throw new Error("Razorpay failed to load");

        const dummyOrderId = "order_" + Math.random().toString(36).substring(7);

        const options = {
          key: "YOUR_RAZORPAY_KEY",
          amount: finalTotal * 100,
          currency: "INR",
          name: "UtensilPro",
          description: "Secure Online Payment",
          order_id: dummyOrderId,
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: "#0f172a" },
          handler: async (response) => {
            orderPayload.status = "PAID";
            await fetch('http://localhost:8080/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload)
            });
            clearCart();
            navigate('/profile');
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty, show empty state immediately
  if (cartItems.length === 0) {
    return (
      <div className="storefront-container">

        <main className="store-main" style={{ justifyContent: 'center', textAlign: 'center', paddingTop: '100px' }}>
          <div>
            <span style={{ fontSize: '4rem' }}>🛒</span>
            <h2>Your Cart is Empty</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Add some items to checkout.</p>
            <Link to="/shop" className="btn-primary-action" style={{ backgroundColor: '#0f172a', padding: '15px 30px', display: 'inline-block', textDecoration: 'none' }}>
              Return to Shop
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="storefront-container">


      <main className="store-main">
        {/* LEFT COLUMN: Dynamic Steps */}
        <div className="checkout-left-column">

         {/* STEP 1: Address & Cart Review */}
         {checkoutStep === 1 && (
           <div className="animate-fade-in">
             <h1 className="checkout-step-title">Checkout (Step 1 of 2)</h1>

             {/* 🚚 DELIVERY SECTION */}
             <section className="checkout-card">
               <h2 className="checkout-card-header">
                 <span>🚚</span> Delivery Details
               </h2>

               <div className="fulfillment-options">
                 {['Home Delivery', 'Store Pickup'].map(t => (
                   <button
                     key={t}
                     onClick={() => setFulfillmentType(t)}
                     className={`btn-fulfillment ${fulfillmentType === t ? 'active' : 'inactive'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>

               {fulfillmentType === 'Home Delivery' && (
                 <div className="animate-fade-in">
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>
                     Shipping Address
                   </label>
                   <textarea
                     rows="3"
                     placeholder="House No, Street, Landmark, Pincode..."
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     className="address-textarea"
                   />
                 </div>
               )}
             </section>

             {/* 📦 DETAILED ORDER REVIEW SECTION */}
             <section className="checkout-card">
               <h2 className="checkout-card-header">
                 <span>📦</span> Order Review
               </h2>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 {cartItems.map(item => (
                   <div key={item.id} className="review-item-row">

                     {/* Product Image */}
                     <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                       <div className="review-item-img">
                         {item.img && item.img.startsWith('http') ? (
                           <img src={item.img} alt={item.name} />
                         ) : (
                           <span style={{ fontSize: '3rem' }}>{item.img || '📦'}</span>
                         )}
                       </div>
                     </Link>

                     {/* Product Details */}
                     <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                           <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 'bold' }}>{item.name}</h3>
                         </Link>
                         <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '1.1rem' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                       </div>

                       {/* Attributes Snippet */}
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                         {item.attrs && Object.entries(item.attrs).slice(0, 2).map(([key, val]) => (
                           <span key={key} style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                             {key.toUpperCase()}: {val}
                           </span>
                         ))}
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                           Qty: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.qty}</span> × ₹{item.price.toLocaleString()}
                         </span>
                         <Link to={`/product/${item.id}`} style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>
                           View Details →
                         </Link>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           </div>
         )}

          {/* STEP 2: Payment Method Selection */}
          {checkoutStep === 2 && (
            <div className="animate-slide-up">
              <button onClick={() => setCheckoutStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                ← Back to Address
              </button>

              <h1 className="checkout-step-title">Payment (Step 2 of 2)</h1>

              <section className="checkout-card">
                <h2 className="checkout-card-header">Select Payment Method</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                  {/* Option 1: Razorpay */}
                  <label className={`payment-option-label ${paymentType === 'ONLINE' ? 'active' : 'inactive'}`}>
                    <input type="radio" name="payment" checked={paymentType === 'ONLINE'} onChange={() => setPaymentType('ONLINE')} style={{ width: '20px', height: '20px' }} />
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.1rem' }}>Pay Online</span>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>UPI, Google Pay, PhonePe, Credit/Debit Cards</span>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label className={`payment-option-label ${paymentType === 'COD' ? 'active' : 'inactive'}`}>
                    <input type="radio" name="payment" checked={paymentType === 'COD'} onChange={() => setPaymentType('COD')} style={{ width: '20px', height: '20px' }} />
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.1rem' }}>Cash on Delivery (COD)</span>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Pay with cash when your order arrives</span>
                    </div>
                  </label>

                </div>
              </section>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Static Billing Summary */}
        <aside className="checkout-right-column">
          <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Order Summary</h2>

          <div className="summary-details">
            <div className="summary-row"><span>Item Total</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Delivery Fee</span><span style={{ color: deliveryFee === 0 ? '#10b981' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            <div className="summary-row"><span>Platform Fee</span><span>₹{platformFee}</span></div>

            <div className="summary-total-row">
              <span>Total Pay</span>
              <span style={{ color: '#3b82f6' }}>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* THE CRITICAL SECURITY GUARD */}
          {!user ? (
            <button
              className="btn-primary-action"
              onClick={() => navigate('/login', { state: { from: '/cart' } })}
              style={{ backgroundColor: '#f59e0b' }}
            >
              Login to Checkout
            </button>
          ) : checkoutStep === 1 ? (
            <button
              className="btn-primary-action"
              onClick={handleProceedToPayment}
              disabled={cartItems.length === 0}
              style={{ backgroundColor: '#0f172a' }}
            >
              Proceed to Payment →
            </button>
          ) : (
            <button
              className="btn-primary-action"
              onClick={handleFinalCheckout}
              disabled={isProcessing}
              style={{ backgroundColor: paymentType === 'COD' ? '#10b981' : '#0f172a' }}
            >
              {isProcessing ? 'Processing...' : paymentType === 'COD' ? 'Confirm COD Order' : `Pay ₹${finalTotal.toLocaleString()} Securely`}
            </button>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Cart;