import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Package, RefreshCw, ArrowLeft, Edit2, Save, X, LogOut, 
  CheckCircle2, AlertCircle, Phone, MapPin, Sun, Moon, Heart, 
  ShoppingCart, Plus, Minus, Trash2 
} from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function CustomerDashboard({ 
  user, orders = [], setOrders, cart = [], setCart, wishlist = [], setWishlist, 
  toggleWishlist, addToCart, fetchOrders, onUpdateUser, onLogout, onGoToHome, theme, onToggleTheme,
  initialTab = 'profile'
}) {
  const [profile, setProfile] = useState({
    id: user?.id,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'CUSTOMER',
    vendorCode: user?.vendorCode || null
  });

  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [isEditing, setIsEditing] = useState(false);
  const [flash, setFlash] = useState({ type: '', title: '', text: '' });

  const [showVendorPromptModal, setShowVendorPromptModal] = useState(false);
  const [switchVendorCode, setSwitchVendorCode] = useState('');
  const [showUpgradedCodeModal, setShowUpgradedCodeModal] = useState(null);

  const showToast = (type, title, text) => {
    setFlash({ type, title, text });
    setTimeout(() => {
      setFlash({ type: '', title: '', text: '' });
    }, 3000);
  };

  const handleCheckout = async () => {
    const cartItems = Array.isArray(cart) ? cart : [];
    if (cartItems.length === 0) return;
    try {
      const sub = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.18;
      const shippingFee = 99.00;
      const totalAmount = sub === 0 ? 0 : sub + (sub * taxRate) + shippingFee;
      
      const payload = {
        items: cartItems,
        totalAmount: Math.round(totalAmount * 100) / 100
      };
      await axios.post(`http://localhost:8080/api/customer/${profile.id}/orders`, payload);
      setCart([]);
      showToast('success', 'Order Placed!', 'Your order has been checked out successfully.');
      fetchOrders();
    } catch (err) {
      showToast('error', 'Checkout Failed', 'Failed to place your order. Please check inventory stock.');
    }
  };

  const updateCartQuantity = (productId, amount, maxStock) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === productId);
    if (!existing) return;
    
    const newQty = existing.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(productId);
    } else if (newQty > maxStock) {
      showToast('error', 'Inventory Warning', `Only ${maxStock} items available in stock.`);
    } else {
      setCart(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    setCart(cartItems.filter(item => item.id !== productId));
    showToast('success', 'Removed', 'Item removed from your cart.');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8080/api/customer/${profile.id}`, profile);
      setProfile(res.data);
      onUpdateUser(res.data);
      setIsEditing(false);
      showToast('success', 'Profile updated successfully.', 'Your account details have been saved.');
    } catch (err) {
      showToast('error', 'Update failed.', err.response?.data || 'Could not update profile details.');
    }
  };

  const handleToggleRole = async (targetRole, enteredCode = null) => {
    if (!profile.id) {
      showToast('error', 'Action Failed', 'User ID is missing. Please log in again.');
      return;
    }

    // If target is VENDOR and user already has a code, but we didn't get it yet, show the prompt modal!
    if (targetRole === 'VENDOR' && profile.role === 'CUSTOMER' && profile.vendorCode && !enteredCode) {
      setSwitchVendorCode('');
      setShowVendorPromptModal(true);
      return;
    }

    try {
      const payload = { role: targetRole };
      if (enteredCode) {
        payload.vendorCode = enteredCode.trim();
      }

      const res = await axios.put(`http://localhost:8080/api/auth/customer/${profile.id}/role`, payload);
      
      const isFirstTimeVendor = targetRole === 'VENDOR' && !profile.vendorCode;

      setProfile(res.data);
      onUpdateUser(res.data);
      setShowVendorPromptModal(false);
      
      if (targetRole === 'VENDOR') {
        if (isFirstTimeVendor) {
          setShowUpgradedCodeModal(res.data.vendorCode);
        } else {
          showToast('success', 'Switched to Vendor View!', 'You now have selling privileges on ShopStack.');
        }
      } else if (targetRole === 'ADMINISTRATOR') {
        showToast('success', 'Switched to Admin View!', 'You now have administrative access.');
      } else if (targetRole === 'WAREHOUSE_STAFF') {
        showToast('success', 'Switched to Warehouse View!', 'You now have warehouse staff access.');
      } else {
        showToast('success', 'Switched to Customer View!', 'You are now browsing as a standard Customer.');
      }
    } catch (err) {
      showToast('error', 'Switch Failed', err.response?.data || 'Failed to switch account role.');
    }
  };

  return (
    <div className="dashboard-container">
      {flash.text && (
        <div className={`toast-notification ${flash.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flash.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flash.title}</strong>
            <div className="toast-message-desc">{flash.text}</div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 className="nav-logo" onClick={onGoToHome} style={{ cursor: 'pointer' }}>ShopStack</h1>
          <button onClick={onGoToHome} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>

        <div className="nav-right">
          {/* Theme Switch Button */}
          <button 
            type="button" 
            onClick={onToggleTheme} 
            className="btn-icon-only" 
            style={{ borderRadius: 'var(--radius-md)', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--accent-blue)' }} /> : <Moon size={16} style={{ color: 'var(--accent-indigo)' }} />}
          </button>

          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Signed in as: <strong style={{ color: 'var(--text-primary)' }}>{profile.fullName}</strong>
            <span className={`badge ${profile.role === 'VENDOR' ? 'badge-vendor' : 'badge-customer'}`} style={{ marginLeft: '10px' }}>
              {profile.role}
            </span>
          </span>
          <button onClick={onLogout} className="btn btn-danger" style={{ padding: '6px 16px', fontSize: '13px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Interactive Sidebar Tabs */}
        <div className="sidebar">
          <div 
            onClick={() => setActiveTab('profile')} 
            className={`sidebar-item ${activeTab === 'profile' ? 'sidebar-item-active' : ''}`}
          >
            <User size={18} /> Profile & Address
          </div>
          <div 
            onClick={() => setActiveTab('orders')} 
            className={`sidebar-item ${activeTab === 'orders' ? 'sidebar-item-active' : ''}`}
          >
            <Package size={18} /> My Orders ({orders.length})
          </div>
          <div 
            onClick={() => setActiveTab('wishlist')} 
            className={`sidebar-item ${activeTab === 'wishlist' ? 'sidebar-item-active' : ''}`}
          >
            <Heart size={18} /> My Wishlist ({wishlist.length})
          </div>
          <div 
            onClick={() => setActiveTab('cart')} 
            className={`sidebar-item ${activeTab === 'cart' ? 'sidebar-item-active' : ''}`}
          >
            <ShoppingCart size={18} /> My Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="main-content">
          {activeTab === 'profile' && (
            <>
              {profile.role === 'CUSTOMER' ? (
                profile.email.endsWith('@admin') ? (
                  <div className="banner-gradient banner-customer" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
                    <div>
                      <h3 className="banner-title">Administrator Account</h3>
                      <p className="banner-subtitle">
                        Switch your profile mode back to Administrator to review and approve product listings.
                      </p>
                    </div>
                    <button onClick={() => handleToggleRole('ADMINISTRATOR')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                      <RefreshCw size={16} /> Switch to Admin Mode
                    </button>
                  </div>
                ) : profile.email.endsWith('@staff') ? (
                  <div className="banner-gradient banner-customer" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div>
                      <h3 className="banner-title">Warehouse Staff Account</h3>
                      <p className="banner-subtitle">
                        Switch your profile mode back to Warehouse Staff mode.
                      </p>
                    </div>
                    <button onClick={() => handleToggleRole('WAREHOUSE_STAFF')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                      <RefreshCw size={16} /> Switch to Warehouse Mode
                    </button>
                  </div>
                ) : (
                  <div className="banner-gradient banner-customer">
                    <div>
                      <h3 className="banner-title">Want to sell on ShopStack?</h3>
                      <p className="banner-subtitle">
                        Switch your profile mode to Vendor to list products, track customer sales, and more.
                      </p>
                    </div>
                    <button onClick={() => handleToggleRole('VENDOR')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                      <RefreshCw size={16} /> Switch to Vendor Mode
                    </button>
                  </div>
                )
              ) : profile.role === 'VENDOR' ? (
                <div className="banner-gradient banner-vendor">
                  <div>
                    <h3 className="banner-title">Currently in Vendor Mode</h3>
                    <p className="banner-subtitle">
                      You have active seller privileges. You can switch back to browse as a customer anytime.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('CUSTOMER')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                    <RefreshCw size={16} /> Switch to Customer Mode
                  </button>
                </div>
              ) : profile.role === 'ADMINISTRATOR' ? (
                <div className="banner-gradient banner-vendor" style={{ background: 'var(--gradient-danger)' }}>
                  <div>
                    <h3 className="banner-title">Currently in Administrator Mode</h3>
                    <p className="banner-subtitle">
                      You have security access. You can switch back to browse as a customer anytime.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('CUSTOMER')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                    <RefreshCw size={16} /> Switch to Customer Mode
                  </button>
                </div>
              ) : (
                <div className="banner-gradient banner-vendor" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <div>
                    <h3 className="banner-title">Currently in Warehouse Staff Mode</h3>
                    <p className="banner-subtitle">
                      You have warehouse access. You can switch back to browse as a customer anytime.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('CUSTOMER')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                    <RefreshCw size={16} /> Switch to Customer Mode
                  </button>
                </div>
              )}

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Account Profile</h2>

              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="order-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Full Name</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{profile.fullName}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Account Mode</span>
                      <div>
                        <span className={`badge ${
                          profile.role === 'VENDOR' ? 'badge-vendor' : 
                          profile.role === 'ADMINISTRATOR' ? 'badge-rejected' : 
                          profile.role === 'WAREHOUSE_STAFF' ? 'badge-pending' : 'badge-customer'
                        }`}>
                          {profile.role}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</span>
                      <span style={{ color: 'var(--text-primary)' }}>{profile.email}</span>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</span>
                      <span style={{ color: profile.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profile.phone || 'No phone number linked'}
                      </span>
                    </div>

                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Shipping Address</span>
                      <span style={{ color: profile.address ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profile.address || 'No address registered'}
                      </span>
                    </div>
                  </div>
                  
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ width: 'fit-content' }}>
                    <Edit2 size={16} /> Edit Profile Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-icon-wrapper">
                      <User className="input-icon" />
                      <input 
                        type="text" 
                        value={profile.fullName} 
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                        required 
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-icon-wrapper">
                      <Phone className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="+1 (555) 000-0000"
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping Address</label>
                    <div className="input-icon-wrapper">
                      <MapPin className="input-icon" style={{ top: '14px', alignSelf: 'flex-start' }} />
                      <textarea 
                        rows="3" 
                        placeholder="Enter your street address, city, state, zip code..."
                        value={profile.address} 
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                        className="form-input"
                        style={{ paddingLeft: '44px', resize: 'vertical' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-success">
                      <Save size={16} /> Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Order History</h2>
              {orders.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((ord, i) => (
                  <div key={i} className="order-card" style={{ padding: '24px' }}>
                    <div className="order-card-header">
                      <span className="order-id" style={{ fontSize: '16px' }}>{ord.orderId}</span>
                      <span className="order-status-badge">{ord.status}</span>
                    </div>
                    <div className="order-date">Date: {ord.date}</div>
                    
                    <div className="order-items-list" style={{ background: 'var(--bg-primary)' }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="order-item-row" style={{ alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                              <ProductIcon name={item.name} category={item.category} size={12} />
                            </div>
                            <span>{item.name}</span>
                          </div>
                          <strong>₹{item.price}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-total-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Paid</span>
                      <strong style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>₹{ord.totalAmount}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Saved Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Heart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your wishlist is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {wishlist.map((prod) => (
                    <div key={prod.id} className="cart-item" style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {prod.imageUrl && prod.imageUrl.length > 4 ? (
                            <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ProductIcon name={prod.name} category={prod.category} size={20} />
                          )}
                         </div>
                         <div>
                           <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>{prod.name}</h4>
                           <span className="badge badge-customer" style={{ fontSize: '11px' }}>{prod.category}</span>
                         </div>
                       </div>
                       
                       <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <strong style={{ fontSize: '16px' }}>₹{prod.price}</strong>
                         <div style={{ display: 'flex', gap: '10px' }}>
                           <button 
                             type="button" 
                             onClick={() => addToCart(prod, (type, text) => showToast(type, type === 'success' ? 'Success' : 'Notification', text))} 
                             className="btn btn-primary" 
                             style={{ padding: '6px 14px', fontSize: '12px' }}
                             disabled={prod.stock <= 0}
                           >
                             Add to Cart
                           </button>
                           <button 
                             type="button" 
                             onClick={() => toggleWishlist(prod, (type, text) => showToast(type, type === 'success' ? 'Success' : 'Notification', text))} 
                             className="btn btn-secondary" 
                             style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                             title="Remove"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Shopping Cart</h2>
              {cart.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <ShoppingCart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="dashboard-layout" style={{ gap: '24px', alignItems: 'flex-start', padding: 0 }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item" style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.imageUrl && item.imageUrl.length > 4 ? (
                              <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <ProductIcon name={item.name} category={item.category} size={20} />
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>{item.name}</h4>
                            <span className="badge badge-customer" style={{ fontSize: '11px' }}>{item.category}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          {/* Quantity controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              type="button" 
                              onClick={() => updateCartQuantity(item.id, -1, item.stock)} 
                              className="btn-icon-only"
                              style={{ padding: '3px' }}
                            >
                              <Minus size={12} />
                            </button>
                            <strong style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</strong>
                            <button 
                              type="button" 
                              onClick={() => updateCartQuantity(item.id, 1, item.stock)} 
                              className="btn-icon-only"
                              style={{ padding: '3px' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <strong style={{ fontSize: '15px', minWidth: '80px', textAlign: 'right' }}>₹{item.price * item.quantity}</strong>
                          <button 
                            type="button" 
                            onClick={() => removeFromCart(item.id)} 
                            className="btn-icon-only"
                            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1, background: 'var(--bg-input)', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>Order Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div className="flex-between">
                        <span>Subtotal</span>
                        <strong>₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</strong>
                      </div>
                      <div className="flex-between">
                        <span>GST Tax (18%)</span>
                         <span>₹{Math.round(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.18 * 100) / 100}</span>
                       </div>
                       <div className="flex-between">
                         <span>Shipping</span>
                         <span>₹99.00</span>
                       </div>
                       <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px', fontSize: '16px', color: 'var(--text-primary)' }}>
                         <span>Total</span>
                         <strong style={{ color: 'var(--accent-emerald)' }}>
                           ₹{Math.round((cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.18 + 99) * 100) / 100}
                         </strong>
                       </div>
                     </div>

                     <button 
                       type="button" 
                       onClick={handleCheckout} 
                       className="btn btn-success btn-block" 
                       style={{ marginTop: '12px' }}
                     >
                       Checkout Order
                     </button>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Switch to Vendor Prompt Modal */}
      {showVendorPromptModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowVendorPromptModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Enter Vendor ID</h2>
              <button onClick={() => setShowVendorPromptModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleToggleRole('VENDOR', switchVendorCode);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                Please enter your unique 6-digit Vendor ID to verify your identity and switch to Vendor mode.
              </p>
              <div className="form-group">
                <input 
                  type="text" 
                  maxLength="6"
                  pattern="\d{6}"
                  placeholder="e.g. 123456"
                  value={switchVendorCode}
                  onChange={(e) => setSwitchVendorCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input" 
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontFamily: 'monospace' }}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-footer" style={{ borderTop: 'none', marginTop: '0', paddingTop: '0' }}>
                <button type="button" onClick={() => setShowVendorPromptModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgraded First-Time Vendor Code Center Overlay Dialog Modal */}
      {showUpgradedCodeModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="dialog-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '36px' }}>
            <div className="flex-center" style={{ marginBottom: '16px', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className="modal-title" style={{ marginBottom: '8px', fontSize: '20px' }}>Upgraded to Vendor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Congratulations! Your customer profile has been upgraded. Here is your permanent, unique **6-digit Vendor ID**. You will need this code to log in or switch back to Vendor mode.
            </p>
            <div style={{ 
              background: 'var(--bg-input)', 
              border: '2px dashed var(--accent-indigo)', 
              borderRadius: '10px', 
              padding: '12px', 
              fontSize: '28px', 
              fontWeight: '800', 
              letterSpacing: '6px',
              color: 'var(--text-primary)',
              marginBottom: '20px',
              fontFamily: 'monospace'
            }}>
              {showUpgradedCodeModal}
            </div>
            <button 
              type="button" 
              onClick={() => {
                setShowUpgradedCodeModal(null);
                showToast('success', 'Switched to Vendor View!', 'You now have selling privileges on ShopStack.');
              }} 
              className="btn btn-primary btn-block"
            >
              I have copied my Vendor ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
}