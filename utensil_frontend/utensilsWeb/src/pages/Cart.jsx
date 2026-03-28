// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load cart and user session on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('utensil_cart')) || [];
    setCartItems(savedCart);

    const session = localStorage.getItem('current_session');
    if (session === 'customer') {
      const userData = JSON.parse(localStorage.getItem('utensil_user'));
      setUser(userData);
    }
  }, []);

  // --- Bill Calculation ---
  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const handleRemoveItem = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem('utensil_cart', JSON.stringify(updatedCart));
  };

  // --- PDF Generation & Checkout Flow ---
  const handleCheckout = () => {
    if (!user) {
      alert("Please log in to place an order.");
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // 1. Initialize PDF
    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // #2c3e50 (Your primary color)
    doc.text("UtensilPro - Invoice", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Customer: ${user.fullName}`, 14, 32);
    doc.text(`Email: ${user.email}`, 14, 38);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);

    // 2. Prepare Table Data
    const tableColumn = ["Item Name", "Category", "Price (INR)"];
    const tableRows = [];

    cartItems.forEach(item => {
      const itemData = [item.name, item.category, `Rs. ${item.price}`];
      tableRows.push(itemData);
    });

    // 3. Generate Table
    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [211, 84, 0] }, // #d35400 (Your accent color)
    });

    // 4. Add Totals below the table
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 14, finalY);
    doc.text(`Tax (18% GST): Rs. ${taxAmount.toFixed(2)}`, 14, finalY + 8);

    doc.setFontSize(14);
    doc.setTextColor(211, 84, 0);
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 14, finalY + 18);

    // 5. Save the PDF
    doc.save(`UtensilPro_Invoice_${Date.now()}.pdf`);

    // 6. Complete Transaction
    alert("Order placed successfully! Your invoice is downloading.");

    // Clear the cart after successful order
    setCartItems([]);
    localStorage.removeItem('utensil_cart');

    // In the future, this is where you will send the order data to your Spring Boot/MySQL backend!
  };

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is currently empty.</p>
          <Link to="/shop" className="continue-shopping-btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items List */}
          <div className="cart-items-section">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-icon">{item.image}</div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>{item.category}</p>
                </div>
                <div className="item-price">₹{item.price}</div>
                <button className="remove-btn" onClick={() => handleRemoveItem(index)}>✖</button>
              </div>
            ))}
          </div>

          {/* Billing Summary Section */}
          <div className="cart-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (18%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Conditional Button based on Login Status */}
            {!user ? (
              <button className="checkout-btn login-prompt" onClick={() => navigate('/login')}>
                Log in to Checkout
              </button>
            ) : (
              <button className="checkout-btn place-order" onClick={handleCheckout}>
                Place Order & Download Bill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;