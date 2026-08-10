import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import HomeDashboard from './components/HomeDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import axios from 'axios';

function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'home', or 'profile'
  
  // Persistent user state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('shopstack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Persistent cart state
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shopstack_cart');
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Persistent order history state
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('shopstack_orders');
      const parsed = savedOrders ? JSON.parse(savedOrders) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Global Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Active Profile Tab state
  const [profileTab, setProfileTab] = useState('profile');

  // Global Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shopstack_theme');
    return savedTheme ? savedTheme : 'dark'; // Default theme is dark
  });

  // Sync theme with document class/attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shopstack_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Save state updates to localStorage
  useEffect(() => {
    localStorage.setItem('shopstack_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shopstack_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shopstack_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shopstack_user');
    }
  }, [currentUser]);

  const navigateTo = (newView) => {
    setView(newView);
    window.history.pushState({ view: newView }, '', '');
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    navigateTo('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem('shopstack_cart');
    localStorage.removeItem('shopstack_user');
    localStorage.removeItem('shopstack_orders');
    navigateTo('login');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Global Wishlist fetcher
  const fetchWishlist = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${currentUser.id}/wishlist`);
      if (Array.isArray(res.data)) {
        setWishlist(res.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist", err);
      setWishlist([]);
    }
  };

  // Global Wishlist toggle
  const toggleWishlist = async (product, showFlash = null) => {
    if (!currentUser || !currentUser.id) return;
    const wishlistItems = Array.isArray(wishlist) ? wishlist : [];
    const isWishlisted = wishlistItems.some(p => p.id === product.id);
    try {
      if (isWishlisted) {
        await axios.delete(`http://localhost:8080/api/customer/${currentUser.id}/wishlist/${product.id}`);
        setWishlist(wishlistItems.filter(p => p.id !== product.id));
        if (showFlash) showFlash('success', "Removed from wishlist.");
      } else {
        await axios.post(`http://localhost:8080/api/customer/${currentUser.id}/wishlist/${product.id}`);
        setWishlist([...wishlistItems, product]);
        if (showFlash) showFlash('success', "Added to wishlist.");
      }
    } catch (err) {
      console.error("Failed to update wishlist", err);
      if (showFlash) showFlash('error', "Failed to update wishlist.");
    }
  };

  // Global Cart adder
  const addToCart = (product, showFlash = null) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === product.id);

    const discPct = Number(product.discountPercentage) || 0;
    const origPrice = Number(product.price) || 0;
    const effectivePrice = product.finalPrice != null 
      ? Number(product.finalPrice) 
      : (discPct > 0 ? Math.round(origPrice * (1 - discPct / 100) * 100) / 100 : origPrice);

    if (existing) {
      if (existing.quantity >= product.stock) {
        if (showFlash) showFlash('error', `Insufficient stock. Only ${product.stock} units available.`);
        return;
      }
      setCart(cartItems.map(item => 
        item.id === product.id ? { 
          ...item, 
          price: effectivePrice,
          originalPrice: origPrice,
          discountPercentage: discPct,
          quantity: item.quantity + 1 
        } : item
      ));
    } else {
      if (product.stock <= 0) {
        if (showFlash) showFlash('error', "This product is currently out of stock.");
        return;
      }
      setCart([...cartItems, { 
        ...product, 
        price: effectivePrice,
        originalPrice: origPrice,
        discountPercentage: discPct,
        quantity: 1 
      }]);
    }
    if (showFlash) showFlash('success', `${product.name} added to cart at ₹${effectivePrice.toLocaleString('en-IN')}.`);
  };

  // Global Orders fetcher
  const fetchOrders = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${currentUser.id}/orders`);
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
      setOrders([]);
    }
  };

  // Sync wishlist and orders on user login or switch
  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
      fetchOrders();
    } else {
      setWishlist([]);
      setOrders([]);
    }
  }, [currentUser]);

  return (
    <div>
      {view === 'home' && currentUser ? (
        <HomeDashboard 
          user={currentUser} 
          cart={cart}
          setCart={setCart}
          orders={orders}
          setOrders={setOrders}
          wishlist={wishlist}
          setWishlist={setWishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          fetchOrders={fetchOrders}
          onLogout={handleLogout} 
          onGoToProfile={(tab) => {
            setProfileTab(tab || 'profile');
            navigateTo('profile');
          }} 
          onGoToVendor={() => navigateTo('vendor-dashboard')}
          onGoToAdmin={() => navigateTo('admin-dashboard')}
          onGoToWarehouse={() => navigateTo('warehouse-dashboard')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : view === 'profile' && currentUser ? (
        <CustomerDashboard 
          user={currentUser} 
          orders={orders}
          setOrders={setOrders}
          cart={cart}
          setCart={setCart}
          wishlist={wishlist}
          setWishlist={setWishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          fetchOrders={fetchOrders}
          fetchWishlist={fetchWishlist}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          initialTab={profileTab}
        />
      ) : view === 'vendor-dashboard' && currentUser ? (
        <VendorDashboard 
          user={currentUser} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : view === 'admin-dashboard' && currentUser ? (
        <AdminDashboard 
          user={currentUser} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : view === 'warehouse-dashboard' && currentUser ? (
        <WarehouseDashboard 
          user={currentUser} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : view === 'login' ? (
        <Login 
          switchToRegister={() => navigateTo('register')} 
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <Register 
          switchToLogin={() => navigateTo('login')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}
    </div>
  );
}

export default App;