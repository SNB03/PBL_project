// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CustomerNavbar from '../components/CustomerNavbar';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
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

        // Simulate getting order ID from backend (Replace with your actual API later)
        const dummyOrderId = "order_" + Math.random().toString(36).substring(7);

        const options = {
          key: "YOUR_RAZORPAY_KEY", // Will use test key
          amount: finalTotal * 100, // Paisa
          currency: "INR",
          name: "UtensilPro",
          description: "Secure Online Payment",
          order_id: dummyOrderId,
          prefill: { name: user.name, email: user.email, contact: user.phone },
          // We DO NOT restrict the methods here. Razorpay will naturally show UPI, Card, Netbanking!
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

  return (
    <div className="storefront-container">
      <CustomerNavbar />
      <main className="store-main" style={{ display: 'flex', gap: '30px', paddingTop: '30px', flexWrap: 'wrap' }}>

        {/* LEFT COLUMN: Dynamic Steps */}
        <div style={{ flex: '2', minWidth: '350px' }}>

         {/* STEP 1: Address & Cart Review */}
         {checkoutStep === 1 && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#0f172a' }}>Checkout (Step 1 of 2)</h1>

             {/* 🚚 DELIVERY SECTION */}
             <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
               <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>🚚</span> Delivery Details
               </h2>
               <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                 {['Home Delivery', 'Store Pickup'].map(t => (
                   <button
                     key={t}
                     onClick={() => setFulfillmentType(t)}
                     style={{
                       flex: 1, padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s',
                       border: fulfillmentType === t ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                       backgroundColor: fulfillmentType === t ? '#eff6ff' : 'white',
                       color: fulfillmentType === t ? '#3b82f6' : '#475569'
                     }}
                   >
                     {t}
                   </button>
                 ))}
               </div>
               {fulfillmentType === 'Home Delivery' && (
                 <div className="animate-fade-in">
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>Shipping Address</label>
                   <textarea
                     rows="3"
                     placeholder="House No, Street, Landmark, Pincode..."
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem' }}
                   />
                 </div>
               )}
             </section>

             {/* 📦 DETAILED ORDER REVIEW SECTION */}
             <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
               <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <span>📦</span> Order Review
               </h2>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 {cartItems.map(item => (
                   <div key={item.id} style={{ display: 'flex', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>

                     {/* Product Image (Clickable) */}
                     <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                       <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                         {item.img && item.img.startsWith('http') ? (
                           <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                       {/* Features/Attributes Snippet */}
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

               {/* Tip for the user */}
               <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', color: '#b45309', fontSize: '0.85rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <span>💡</span> Need to change quantities? Go back to the cart home or use the + / - buttons on the item list.
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

              <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Payment (Step 2 of 2)</h1>

              <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Select Payment Method</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {/* Option 1: Razorpay (Handles all online logic) */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px', border: paymentType === 'ONLINE' ? '2px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: paymentType === 'ONLINE' ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                    <input type="radio" name="payment" checked={paymentType === 'ONLINE'} onChange={() => setPaymentType('ONLINE')} style={{ width: '20px', height: '20px' }} />
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '1.1rem' }}>Pay Online</span>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>UPI, Google Pay, PhonePe, Credit/Debit Cards</span>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px', border: paymentType === 'COD' ? '2px solid #3b82f6' : '1px solid #cbd5e1', backgroundColor: paymentType === 'COD' ? '#eff6ff' : 'white', cursor: 'pointer' }}>
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
        <aside style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Item Total</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee</span><span style={{ color: deliveryFee === 0 ? '#10b981' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform Fee</span><span>₹{platformFee}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '15px', marginTop: '10px', fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>
              <span>Total Pay</span>
              <span style={{ color: '#3b82f6' }}>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* 👉 THE CRITICAL SECURITY GUARD */}
          {!user ? (
            <button
              className="btn-add-to-cart"
              onClick={() => navigate('/login', { state: { from: '/cart' } })}
              style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.1rem', backgroundColor: '#f59e0b', color: 'white' }}
            >
              Login to Checkout
            </button>
          ) : checkoutStep === 1 ? (
            <button
              className="btn-add-to-cart"
              onClick={handleProceedToPayment}
              disabled={cartItems.length === 0}
              style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.1rem' }}
            >
              Proceed to Payment →
            </button>
          ) : (
            <button
              className="btn-add-to-cart"
              onClick={handleFinalCheckout}
              disabled={isProcessing}
              style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.1rem', backgroundColor: paymentType === 'COD' ? '#10b981' : '#0f172a' }}
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