// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerNavbar from '../components/CustomerNavbar';
import { Link } from 'react-router-dom';
import './Storefront.css';

const Profile = () => {
 const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
// Settings Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // Security Redirect: If a guest tries to access /profile, kick them to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch the user's specific orders
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:8080/api/orders/customer/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyOrders();
  }, [user]);

  if (!user) return null; // Prevent flicker before redirect

  // Filter orders based on the active tab
  const activeOrders = orders.filter(o => ['PENDING', 'OUT_FOR_DELIVERY'].includes(o.status));
  const pastOrders = orders.filter(o => ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(o.status));

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;
// Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        login(updatedUser); // Instantly updates the Navbar and Global State!
        setSaveMessage('✅ Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ Failed to update profile.');
      }
    } catch (err) {
      setSaveMessage('❌ Server error.');
    } finally {
      setIsSaving(false);
    }
  };
  // Helper function for status badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>⏳ Processing</span>;
      case 'OUT_FOR_DELIVERY': return <span style={{ background: '#dbeafe', color: '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>🚚 Out for Delivery</span>;
      case 'COMPLETED':
      case 'DELIVERED': return <span style={{ background: '#d1fae5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>✅ Delivered</span>;
      case 'CANCELLED': return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>❌ Cancelled</span>;
      default: return <span className="category-pill">{status}</span>;
    }
  };
// 👉 NEW: Function to trigger a clean print window for the invoice
const handlePrintInvoice = (order) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .items th, .items td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
          .total { text-align: right; font-size: 1.5rem; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>UtensilPro</h1>
            <p>Official Tax Invoice</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
        </div>
        <h3>Billed To: ${order.customerName}</h3>
        <p>${order.address || 'Store Pickup'}</p>

        <table class="items">
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          ${order.itemsList.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>₹${item.price}</td>
              <td>₹${item.price * item.qty}</td>
            </tr>
          `).join('')}
        </table>

        <div class="total">Grand Total: ₹${order.total}</div>
        <p style="text-align: center; margin-top: 50px; color: #888;">Thank you for shopping with UtensilPro!</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
  return (
    <div className="storefront-container">
      <CustomerNavbar />

      <main className="store-main" style={{ paddingTop: '40px', maxWidth: '1000px', margin: '0 auto' }}>

       {/* PROFILE HEADER */}
               <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                     {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: '#0f172a' }}>{user.name}</h1>
                     <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>{user.email} | {user.phone}</p>
                   </div>
                 </div>
                 <button onClick={() => { logout(); navigate('/'); }} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                   Sign Out
                 </button>
               </div>

               {/* TAB NAVIGATION */}
               <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0' }}>
                 <button onClick={() => setActiveTab('active')} style={{ background: 'none', border: 'none', padding: '15px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'active' ? '#3b82f6' : '#64748b', borderBottom: activeTab === 'active' ? '3px solid #3b82f6' : '3px solid transparent', marginBottom: '-2px' }}>
                   Active Orders ({activeOrders.length})
                 </button>
                 <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', padding: '15px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'history' ? '#3b82f6' : '#64748b', borderBottom: activeTab === 'history' ? '3px solid #3b82f6' : '3px solid transparent', marginBottom: '-2px' }}>
                   Order History ({pastOrders.length})
                 </button>
                 <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', padding: '15px 20px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', color: activeTab === 'settings' ? '#3b82f6' : '#64748b', borderBottom: activeTab === 'settings' ? '3px solid #3b82f6' : '3px solid transparent', marginBottom: '-2px' }}>
                   ⚙️ Account Settings
                 </button>
               </div>

               {/* --- SETTINGS TAB --- */}
               {activeTab === 'settings' && (
                 <div className="animate-slide-up" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '30px' }}>
                   <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#0f172a' }}>Personal Information</h2>

                   {saveMessage && <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '8px', backgroundColor: saveMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: saveMessage.includes('✅') ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>{saveMessage}</div>}

                   <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                     <div>
                       <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Full Name</label>
                       <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                     </div>

                     <div>
                       <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Phone Number</label>
                       <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                     </div>

                     <div>
                       <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Default Delivery Address</label>
                       <textarea rows="4" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, City, State, ZIP..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                       <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '5px 0 0 0' }}>This address will be auto-filled at checkout.</p>
                     </div>

                     <button type="submit" disabled={isSaving} style={{ backgroundColor: '#0f172a', color: 'white', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', border: 'none', marginTop: '10px' }}>
                       {isSaving ? 'Saving...' : 'Save Changes'}
                     </button>
                   </form>
                 </div>
               )}
        {isLoading ? (
                  <div className="loading-state"><div className="spinner"></div></div>
                ) : displayOrders.length === 0 ? (
                  <div className="empty-state">/*... existing empty state ...*/</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {displayOrders.map(order => (
                      <div key={order.id} className="animate-slide-up" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '25px' }}>

                        {/* Order Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Order ID: {order.id.substring(0, 8)}...</span>
                            <p style={{ margin: '5px 0 0 0', color: '#0f172a', fontWeight: 'bold' }}>Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                                                                                             {/* 👉 NEW: Show the Delivery PIN to the customer if it's out for delivery! */}
                                                                                                                 {order.status === 'OUT_FOR_DELIVERY' && (
                                                                                                                   <div style={{ marginTop: '15px', padding: '10px 15px', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                                                                                                                     <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af', fontWeight: 'bold' }}>
                                                                                                                       Delivery OTP: <span style={{ fontSize: '1.2rem', letterSpacing: '2px', backgroundColor: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{order.verificationPin}</span>
                                                                                                                    </p>
                                                                                                                     <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#3b82f6' }}>Please provide this code to the delivery rider.</p>
                                                                                                                   </div>
                                                                                                                 )}
                            {/* 👉 NEW: Print Invoice Button (Only for completed/delivered orders) */}
                            {['COMPLETED', 'DELIVERED'].includes(order.status) && (
                              <button
                                onClick={() => handlePrintInvoice(order)}
                                style={{ marginTop: '10px', background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                🖨️ Print Invoice
                              </button>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '10px' }}>{getStatusBadge(order.status)}</div>
                            <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#10b981' }}>₹{order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#64748b', textTransform: 'uppercase' }}>Items</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {order.itemsList.map((item, idx) => (
                              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>

                                {/* 👉 NEW: Clickable Product Link */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ color: '#64748b', fontWeight: 'bold' }}>{item.qty}x</span>
                                  <Link
                                    to={`/product/${item.productId}`}
                                    style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '600' }}
                                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                  >
                                    {item.name}
                                  </Link>
                                </div>

                                <span style={{ fontWeight: '500' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

      </main>
    </div>
  );
};

export default Profile;