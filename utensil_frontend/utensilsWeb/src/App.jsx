// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';       // Import Login
import Register from './pages/Register'; // Import Register
import Profile from './pages/Profile';
import CookerShop from './pages/CookerShop';

function App() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* flex: 1 ensures the main content pushes the footer to the bottom */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />       {/* Add Login Route */}
          <Route path="/register" element={<Register />} />
       <Route path="/profile" element={<Profile />} />
       <Route path="/cookers" element={<CookerShop />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;