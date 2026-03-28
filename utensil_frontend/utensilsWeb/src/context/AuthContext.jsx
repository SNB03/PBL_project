// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Custom hook so other files can easily grab auth data
export const useAuth = () => useContext(AuthContext);

// 3. The Provider that wraps our app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'customer', 'admin', or null

  // When the app loads, check if they are already logged in via localStorage
  useEffect(() => {
    const sessionRole = localStorage.getItem('current_session');
    const savedUser = JSON.parse(localStorage.getItem('utensil_user'));

    if (sessionRole === 'customer' && savedUser) {
      setRole('customer');
      setUser(savedUser);
    } else if (sessionRole === 'admin') {
      setRole('admin');
      setUser({ fullName: 'Admin' }); // Mock admin user object
    }
  }, []);

  // Login function to update state and localStorage simultaneously
  const login = (userData, userRole) => {
    localStorage.setItem('current_session', userRole);
    if (userData) {
      localStorage.setItem('utensil_user', JSON.stringify(userData));
    }
    setRole(userRole);
    setUser(userData || { fullName: 'Admin' });
  };

  // Logout function to clear everything
  const logout = () => {
    localStorage.removeItem('current_session');
    localStorage.removeItem('utensil_user');
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};