// src/components/PaymentModal.jsx
import React, { useState } from 'react';

const PaymentModal = ({ totalAmount, onPaymentSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate network request to banking API (2 seconds)
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(); // Trigger the actual backend database save!
    }, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div className="animate-slide-up" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>🔒 Secure Checkout</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 5px 0', color: '#64748b' }}>Amount to Pay</p>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#10b981' }}>₹{totalAmount.toLocaleString()}</h3>
        </div>

        {isProcessing ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ borderColor: '#e2e8f0', borderTopColor: '#3b82f6', width: '50px', height: '50px', margin: '0 auto 15px auto' }}></div>
            <p style={{ color: '#0f172a', fontWeight: 'bold' }}>Contacting Bank...</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please do not close this window.</p>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Card Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                required 
                maxLength="16"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem', letterSpacing: '2px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Expiry</label>
                <input type="text" placeholder="MM/YY" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>CVV</label>
                <input type="password" placeholder="•••" required maxLength="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Pay Now
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;