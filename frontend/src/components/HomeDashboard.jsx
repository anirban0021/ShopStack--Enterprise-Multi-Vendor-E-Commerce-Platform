import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomeDashboard({ user, cart, setCart, orders, setOrders, onLogout, onGoToProfile }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      fetchProducts();
    } else {
      try {
        const res = await axios.get(`http://localhost:8080/api/products/search?query=${query}`);
        setProducts(res.data);
      } catch (err) {
        console.error("Search failed", err);
      }
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const toggleWishlist = (product) => {
    if (wishlist.some(p => p.id === product.id)) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  // 1st & 2nd Fix: Add to Order History and Clear Cart
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      items: [...cart],
      totalAmount: calculateTotal(),
      status: 'CONFIRMED'
    };

    setOrders([newOrder, ...orders]); // Add new order to history
    setCart([]); // Clear cart
    setShowCartModal(false);
    alert(`Order Placed Successfully! Order ID: ${newOrder.orderId}`);
  };

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <h1 style={styles.logo}>ShopStack</h1>
          <div style={styles.searchBar}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More" 
              value={searchQuery}
              onChange={handleSearch}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.navRight}>
          <div 
            style={styles.userMenuWrapper}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div style={styles.userMenu}>
              <span>👤</span>
              <strong>{user?.fullName || 'User'}</strong>
            </div>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>Your Account</div>
                <div onClick={onGoToProfile} style={styles.dropdownItem}>👤 My Profile</div>
                <div onClick={() => setShowOrdersModal(true)} style={styles.dropdownItem}>
                  📦 Orders ({orders.length})
                </div>
                <div onClick={onGoToProfile} style={styles.dropdownItem}>❤️ Wishlist ({wishlist.length})</div>
                <div onClick={onGoToProfile} style={styles.dropdownItem}>📍 Saved Addresses</div>
                <div style={styles.dropdownDivider} />
                <div onClick={onLogout} style={{ ...styles.dropdownItem, color: '#ef4444' }}>🚪 Logout</div>
              </div>
            )}
          </div>

          <div onClick={() => setShowCartModal(true)} style={styles.cartBtn}>
            🛒 Cart ({cart.length})
          </div>
        </div>
      </div>

      {/* Cart Modal Overlay */}
      {showCartModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>Your Cart ({cart.length})</h2>
              <button onClick={() => setShowCartModal(false)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={styles.modalBody}>
              {cart.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={styles.cartItem}>
                    <span style={{ fontSize: '24px' }}>{item.imageUrl}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                      <div style={{ color: '#0284c7', fontSize: '14px' }}>₹{item.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(idx)} style={styles.removeBtn}>Remove</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={styles.modalFooter}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
                  Total: ₹{calculateTotal()}
                </div>
                <button onClick={handleCheckout} style={styles.checkoutBtn}>
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders History Modal Overlay */}
      {showOrdersModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, width: '450px' }}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>Order History ({orders.length})</h2>
              <button onClick={() => setShowOrdersModal(false)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={styles.modalBody}>
              {orders.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>No orders placed yet.</p>
              ) : (
                orders.map((order, idx) => (
                  <div key={idx} style={styles.orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a' }}>{order.orderId}</strong>
                      <span style={styles.statusBadge}>{order.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Placed on: {order.date}</div>
                    
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                      {order.items.map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                          <span>{it.imageUrl} {it.name}</span>
                          <strong>₹{it.price}</strong>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#0284c7' }}>
                      Total Amount: ₹{order.totalAmount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div style={styles.sectionContainer}>
        <h3 style={styles.sectionTitle}>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse All Products'}
        </h3>
        <div style={styles.productGrid}>
          {products.map((prod) => (
            <div key={prod.id} style={styles.productCard}>
              <button onClick={() => toggleWishlist(prod)} style={styles.wishlistBtn}>
                {wishlist.some(p => p.id === prod.id) ? '❤️' : '🤍'}
              </button>
              <div style={styles.imagePlaceholder}>{prod.imageUrl}</div>
              <h4 style={styles.productTitle}>{prod.name}</h4>
              <p style={styles.productPrice}>₹{prod.price}</p>
              <button onClick={() => addToCart(prod)} style={styles.addCartBtn}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', background: '#1e293b', borderBottom: '1px solid #334155' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '30px', flex: 1 },
  logo: { color: '#38bdf8', margin: 0, fontSize: '24px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: '1px solid #475569', width: '50%' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', color: '#fff', width: '100%', fontSize: '14px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '25px' },
  userMenuWrapper: { position: 'relative', paddingBottom: '10px' },
  userMenu: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#334155', padding: '8px 16px', borderRadius: '6px' },
  dropdown: { position: 'absolute', top: '100%', right: 0, width: '220px', background: '#ffffff', color: '#1e293b', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', padding: '12px 0', zIndex: 100 },
  dropdownHeader: { padding: '8px 20px', fontWeight: 'bold', fontSize: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  dropdownDivider: { height: '1px', background: '#e2e8f0', margin: '6px 0' },
  cartBtn: { cursor: 'pointer', background: '#0284c7', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' },
  sectionContainer: { padding: '30px 40px' },
  sectionTitle: { margin: '0 0 20px 0', color: '#e2e8f0', fontSize: '20px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  productCard: { position: 'relative', background: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' },
  wishlistBtn: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  imagePlaceholder: { fontSize: '48px', margin: '10px 0' },
  productTitle: { margin: '10px 0 5px 0', color: '#fff', fontSize: '16px' },
  productPrice: { margin: '0 0 15px 0', color: '#38bdf8', fontWeight: 'bold', fontSize: '18px' },
  addCartBtn: { padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
  modalContent: { width: '400px', background: '#fff', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' },
  modalBody: { flex: 1, overflowY: 'auto', padding: '15px 0' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  removeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  modalFooter: { borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  checkoutBtn: { background: '#22c55e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  
  orderCard: { background: '#ffffff', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '15px' },
  statusBadge: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }
};