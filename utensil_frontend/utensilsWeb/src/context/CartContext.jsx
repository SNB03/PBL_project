// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load cart from LocalStorage on first load, or start empty
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('utensilCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to LocalStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem('utensilCart', JSON.stringify(cartItems));
  }, [cartItems]);

 const addToCart = (product) => {
     setCartItems(prev => {
       const existingItem = prev.find(item => item.id === product.id);

       if (existingItem) {
         // Prevent adding more than what is in stock
         if (existingItem.qty >= product.stock) {
           alert(`Sorry, we only have ${product.stock} of "${product.name}" left in stock.`);
           return prev;
         }
         return prev.map(item =>
           item.id === product.id ? { ...item, qty: item.qty + 1 } : item
         );
       }

       // If adding for the first time, ensure stock is at least 1
       if (product.stock < 1) {
         alert("This item is currently out of stock.");
         return prev;
       }
       return [...prev, { ...product, qty: 1 }];
     });
   };

   const updateQuantity = (productId, newQty) => {
     if (newQty < 1) {
       removeFromCart(productId);
       return;
     }

     setCartItems(prev =>
       prev.map(item => {
         if (item.id === productId) {
           // Prevent the user from typing a massive number or clicking '+' too many times
           if (newQty > item.stock) {
             alert(`You can only buy up to ${item.stock} units of this item.`);
             return item; // Keep the quantity unchanged
           }
           return { ...item, qty: newQty };
         }
         return item;
       })
     );
   };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };



  const clearCart = () => setCartItems([]);

  // Calculate Totals
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};