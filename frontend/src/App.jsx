import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import HomeDashboard from './components/HomeDashboard';
import CustomerDashboard from './components/CustomerDashboard';

function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'home', or 'profile'
  
  // Persistent user state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('shopstack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Persistent cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopstack_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persistent order history state
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('shopstack_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

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

  return (
    <div>
      {view === 'home' && currentUser ? (
        <HomeDashboard 
          user={currentUser} 
          cart={cart}
          setCart={setCart}
          orders={orders}
          setOrders={setOrders}
          onLogout={handleLogout} 
          onGoToProfile={() => navigateTo('profile')} 
        />
      ) : view === 'profile' && currentUser ? (
        <CustomerDashboard 
          user={currentUser} 
          orders={orders}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout} 
          onGoToHome={() => navigateTo('home')} 
        />
      ) : view === 'login' ? (
        <Login 
          switchToRegister={() => navigateTo('register')} 
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Register switchToLogin={() => navigateTo('login')} />
      )}
    </div>
  );
}

export default App;