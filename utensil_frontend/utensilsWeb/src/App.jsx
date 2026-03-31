// src/App.jsx
import { Routes, Route } from 'react-router-dom';

// We remove the global Navbar/Footer because Storefront, Admin, and Delivery have their own!
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';

import Home from './pages/Home';

import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import ProductDetails from './pages/ProductDetails';

import AdminDashboard from './pages/AdminDashboard';

import Storefront from './pages/Storefront';

import CartDrawer from './components/CartDrawer'; // Bring in the slide-out cart
import CategoryPage from './pages/CategoryPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
function App() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* 🛒 The global Cart Drawer will slide out over whatever route is active */}
{/*       <CartDrawer /> */}

      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          {/* Main Customer Facing Routes */}
          <Route path="/" element={<Storefront />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
<Route path="/category/:categoryName" element={<CategoryPage />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Employee Portals */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;