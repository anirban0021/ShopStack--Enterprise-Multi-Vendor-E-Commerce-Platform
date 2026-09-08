import React, { useState, useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import Register from './components/Register';
import Login from './components/Login';
import HomeDashboard from './components/HomeDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import MobileBottomNav from './components/MobileBottomNav';
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

  // Logout Confirmation Modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem('shopstack_cart');
    localStorage.removeItem('shopstack_user');
    localStorage.removeItem('shopstack_orders');
    navigateTo('login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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

  // Cart open state (coordinated across navigation)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Pending submissions count for Admin badge in bottom nav
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'ADMIN')) {
      axios.get('http://localhost:8080/api/products/admin/pending')
        .then(res => setPendingAdminCount(Array.isArray(res.data) ? res.data.length : 0))
        .catch(err => console.error("Error fetching pending products for admin badge:", err));
    } else {
      setPendingAdminCount(0);
    }
  }, [currentUser]);

  const handleOpenCart = () => {
    if (view !== 'home') {
      navigateTo('home');
    }
    setIsCartOpen(true);
  };

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
            setIsCartOpen(false);
            setProfileTab(tab || 'profile');
            navigateTo('profile');
          }} 
          onGoToVendor={() => {
            setIsCartOpen(false);
            navigateTo('vendor-dashboard');
          }}
          onGoToAdmin={() => {
            setIsCartOpen(false);
            navigateTo('admin-dashboard');
          }}
          onGoToWarehouse={() => {
            setIsCartOpen(false);
            navigateTo('warehouse-dashboard');
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
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
          onLogout={handleLogout}
        />
      ) : view === 'admin-dashboard' && currentUser ? (
        <AdminDashboard 
          user={currentUser} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
        />
      ) : view === 'warehouse-dashboard' && currentUser ? (
        <WarehouseDashboard 
          user={currentUser} 
          onGoToHome={() => navigateTo('home')} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
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

      {/* Logout Re-assurance / Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 99999, padding: '16px' }}
          onClick={cancelLogout}
        >
          <div 
            className="dialog-content" 
            style={{ 
              maxWidth: '400px', 
              width: '100%', 
              padding: '24px 20px', 
              textAlign: 'center', 
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), var(--shadow-glow)', 
              borderRadius: 'var(--radius-lg)',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={cancelLogout} 
              className="btn-icon-only" 
              style={{ position: 'absolute', top: '14px', right: '14px', padding: '6px' }}
              title="Close"
            >
              <X size={16} />
            </button>

            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.12)', 
                border: '1px solid rgba(239, 68, 68, 0.25)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px', 
                color: 'var(--accent-rose)' 
              }}
            >
              <LogOut size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Log Out of ShopStack?
            </h3>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
              Are you sure you want to sign out? You will need to log back in to access your orders, cart, and account settings.
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                type="button" 
                onClick={cancelLogout} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px 14px', justifyContent: 'center', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmLogout} 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '10px 14px', justifyContent: 'center', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={15} /> Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {currentUser && view !== 'login' && view !== 'register' && (
        <MobileBottomNav 
          currentView={view}
          currentUser={currentUser}
          cartCount={Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0}
          pendingAdminCount={pendingAdminCount}
          profileTab={profileTab}
          isCartOpen={view === 'home' && isCartOpen}
          onNavigateHome={() => {
            setIsCartOpen(false);
            navigateTo('home');
          }}
          onNavigateProfile={(tab = 'profile') => {
            setIsCartOpen(false);
            setProfileTab(tab);
            navigateTo('profile');
          }}
          onNavigateDashboard={(dashView) => {
            setIsCartOpen(false);
            navigateTo(dashView);
          }}
          onOpenCart={handleOpenCart}
        />
      )}
    </div>
  );
}

export default App;