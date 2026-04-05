// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails'
import Shop from './pages/Shop'
import Home from './pages/Home';
import Login from './pages/Login'
import Profile  from './pages/Profile'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
// import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

{/*        <Navbar/> */}
      <main style={{ flex: 1, width: '100%' }}>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/profile" element={<Profile/>}/>
            <Route path="/register" element={<Register/>}/>
             <Route path="/admin" element={<AdminDashboard/>}/>
        </Routes>

      </main>
{/*    <Footer /> */}
    </div>
  );
}

export default App;