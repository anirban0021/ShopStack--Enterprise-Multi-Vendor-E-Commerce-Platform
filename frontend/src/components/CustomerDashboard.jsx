import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Package, RefreshCw, ArrowLeft, Edit2, Save, X, LogOut, 
  CheckCircle2, AlertCircle, Phone, MapPin, Sun, Moon, Heart, 
  ShoppingCart, Plus, Minus, Trash2, Check,
  CreditCard, QrCode, Smartphone, ArrowRight, ShieldCheck, Lock, Store, Truck
} from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function CustomerDashboard({ 
  user, orders = [], setOrders, cart = [], setCart, wishlist = [], setWishlist, 
  toggleWishlist, addToCart, fetchOrders, fetchWishlist, onUpdateUser, onLogout, onGoToHome, theme, onToggleTheme,
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

  useEffect(() => {
    if (activeTab === 'wishlist' && fetchWishlist) {
      fetchWishlist();
    }
  }, [activeTab, fetchWishlist]);

  const [isEditing, setIsEditing] = useState(false);
  const [flash, setFlash] = useState({ type: '', title: '', text: '' });

  const [showVendorPromptModal, setShowVendorPromptModal] = useState(false);
  const [switchVendorCode, setSwitchVendorCode] = useState('');
  const [showUpgradedCodeModal, setShowUpgradedCodeModal] = useState(null);

  // Address Management state
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState('add'); // 'add' | 'edit'
  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);

  // Auto-select all items in cart initially or when items are added
  useEffect(() => {
    if (Array.isArray(cart)) {
      setSelectedCartItemIds(prev => {
        const cartIds = cart.map(i => i.id);
        if (prev.length === 0 && cartIds.length > 0) return cartIds;
        const validPrev = prev.filter(id => cartIds.includes(id));
        const newIds = cartIds.filter(id => !prev.includes(id));
        const merged = Array.from(new Set([...validPrev, ...newIds]));
        return merged.length > 0 ? merged : cartIds;
      });
    }
  }, [cart]);

  const isAllSelected = Array.isArray(cart) && cart.length > 0 && selectedCartItemIds.length === cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds((Array.isArray(cart) ? cart : []).map(i => i.id));
    }
  };

  const toggleSelectItem = (productId) => {
    setSelectedCartItemIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCartItems = (Array.isArray(cart) ? cart : []).filter(item => selectedCartItemIds.includes(item.id));
  const [addressForm, setAddressForm] = useState({
    id: null,
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    addressType: 'HOME',
    isDefault: false
  });

  const fetchAddresses = async () => {
    if (!profile?.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${profile.id}/addresses`);
      if (Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [profile.id]);

  const handleOpenAddAddress = () => {
    setAddressModalMode('add');
    setAddressForm({
      id: null,
      fullName: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      addressType: 'HOME',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setAddressModalMode('edit');
    setAddressForm({
      id: addr.id,
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      addressType: addr.addressType || 'HOME',
      isDefault: !!addr.isDefault
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.streetAddress.trim()) {
      showToast('error', 'Incomplete Address', 'Street address is required.');
      return;
    }

    try {
      if (addressModalMode === 'add') {
        await axios.post(`http://localhost:8080/api/customer/${profile.id}/addresses`, addressForm);
        showToast('success', 'Address Saved', 'New shipping address added successfully.');
      } else {
        await axios.put(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressForm.id}`, addressForm);
        showToast('success', 'Address Updated', 'Shipping address updated successfully.');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', err.response?.data || 'Could not save address.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.put(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressId}/default`);
      showToast('success', 'Default Address Set', 'Default shipping address updated.');
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', 'Could not set default address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressId}`);
      showToast('success', 'Deleted', 'Address removed from your profile.');
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', 'Could not delete address.');
    }
  };

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okhdfcbank` : 'customer@upi');
  const [cardInfo, setCardInfo] = useState({
    number: '4532 8920 1290 8892',
    name: user?.fullName || 'CUSTOMER NAME',
    expiry: '08/29',
    cvv: '821'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const showToast = (type, title, text) => {
    setFlash({ type, title, text });
    setTimeout(() => {
      setFlash({ type: '', title: '', text: '' });
    }, 3000);
  };

  // Pricing & Discount calculations (based on SELECTED items)
  const calculateOriginalSubtotal = () => {
    return selectedCartItems.reduce((sum, item) => {
      const orig = Number(item?.originalPrice) || Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (orig * qty);
    }, 0);
  };

  const calculateSubtotal = () => {
    return selectedCartItems.reduce((sum, item) => {
      const pr = Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (pr * qty);
    }, 0);
  };

  const calculateDiscountSavings = () => {
    return Math.max(0, Math.round((calculateOriginalSubtotal() - calculateSubtotal()) * 100) / 100);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) return 0;
    return subtotal < 500 ? 99 : 0;
  };

  const calculateTotalSavings = () => {
    const discountSavings = calculateDiscountSavings();
    const deliverySavings = (calculateSubtotal() >= 500 && calculateSubtotal() > 0) ? 99 : 0;
    return discountSavings + deliverySavings;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) return 0;
    return Math.round((subtotal + calculateDeliveryFee()) * 100) / 100;
  };

  const handleStartCheckout = () => {
    if (selectedCartItems.length === 0) {
      showToast('error', 'Cart Selection', 'Please select at least 1 item from your cart to proceed to checkout.');
      return;
    }
    
    // Check if user has a default address
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    if (defaultAddr) {
      setDeliveryInfo({
        name: defaultAddr.fullName || '',
        phone: defaultAddr.phone || '',
        address: `${defaultAddr.streetAddress || ''}, ${defaultAddr.city || ''}, ${defaultAddr.state || ''} - ${defaultAddr.postalCode || ''}`.replace(/^, | - $/g, '').trim()
      });
    } else {
      setDeliveryInfo({
        name: '',
        phone: '',
        address: ''
      });
    }
    setPaymentStep(1);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!deliveryInfo.address.trim() || !deliveryInfo.name.trim()) {
      showToast('error', 'Incomplete Details', 'Please provide a valid delivery address and recipient name.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStep(3);

    try {
      await new Promise(resolve => setTimeout(resolve, 1400));
      const payload = {
        items: selectedCartItems,
        totalAmount: calculateTotal()
      };

      const res = await axios.post(`http://localhost:8080/api/customer/${profile.id}/orders`, payload);
      setConfirmedOrder(res.data);
      // Remove only purchased items from cart
      setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
      setSelectedCartItemIds([]);
      setIsProcessingPayment(false);
      setPaymentStep(4);
      fetchOrders();
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(2);
      showToast('error', 'Payment Failed', err.response?.data || 'Failed to complete payment.');
    }
  };

  const handleCheckout = async () => {
    handleStartCheckout();
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
            <User size={18} /> My Profile
          </div>
          <div 
            onClick={() => setActiveTab('addresses')} 
            className={`sidebar-item ${activeTab === 'addresses' ? 'sidebar-item-active' : ''}`}
          >
            <MapPin size={18} /> Your Addresses ({addresses.length})
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
            <ShoppingCart size={18} /> My Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0})
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

                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</span>
                      <span style={{ color: profile.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profile.phone || 'No phone number linked'}
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

          {activeTab === 'addresses' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Your Saved Addresses</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Manage multiple shipping addresses and configure your default delivery destination.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={handleOpenAddAddress} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '48px 24px' }}>
                  <MapPin className="cart-empty-icon" style={{ opacity: 0.2, width: '48px', height: '48px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '16px' }}>No saved addresses found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Add your home, office, or other delivery addresses for faster checkout.</p>
                  <button type="button" onClick={handleOpenAddAddress} className="btn btn-primary">
                    <Plus size={16} /> Add Your First Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {addresses.map((addr) => {
                    const isDef = !!addr.isDefault;
                    return (
                      <div 
                        key={addr.id} 
                        className="order-card"
                        style={{ 
                          padding: '20px', 
                          borderRadius: '12px',
                          border: isDef ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: isDef ? 'rgba(20, 184, 166, 0.04)' : 'var(--bg-input)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          boxShadow: isDef ? '0 4px 20px rgba(20, 184, 166, 0.12)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          {/* Header row: Address type & Default badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-customer" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                                {addr.addressType || 'HOME'}
                              </span>
                              {isDef && (
                                <span className="badge badge-approved" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                  <Check size={12} strokeWidth={3} /> DEFAULT ADDRESS
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recipient details */}
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                            {addr.fullName}
                          </h3>

                          {/* Address text */}
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                            {addr.streetAddress}
                          </p>
                          
                          {(addr.city || addr.state || addr.postalCode) && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', fontWeight: '500' }}>
                              {[addr.city, addr.state].filter(Boolean).join(', ')} {addr.postalCode ? `- ${addr.postalCode}` : ''}
                            </p>
                          )}

                          {addr.phone && (
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                              <Phone size={13} style={{ color: 'var(--accent-teal)' }} />
                              <span>Phone: <strong style={{ color: 'var(--text-primary)' }}>{addr.phone}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {!isDef && (
                            <button 
                              type="button" 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => handleOpenEditAddress(addr)}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="btn-icon-only"
                            style={{ color: 'var(--accent-rose)', padding: '6px 10px', marginLeft: 'auto' }}
                            title="Delete Address"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                             {prod.stock <= 0 ? "Out of Stock" : "Add to Cart"}
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
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Your Shopping Cart</h2>
                {cart.length > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Total {cart.length} item{cart.length === 1 ? '' : 's'} in cart
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <ShoppingCart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="dashboard-layout" style={{ gap: '24px', alignItems: 'flex-start', padding: 0 }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Select All Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', userSelect: 'none' }}>
                        <input 
                          type="checkbox" 
                          checked={isAllSelected} 
                          onChange={toggleSelectAll} 
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                        />
                        <span>Select All ({cart.length} items)</span>
                      </label>
                      <span style={{ fontSize: '12px', color: selectedCartItems.length > 0 ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: '700' }}>
                        {selectedCartItems.length} selected for checkout
                      </span>
                    </div>

                    {cart.map((item) => {
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const isItemSelected = selectedCartItemIds.includes(item.id);
                      return (
                        <div 
                          key={item.id} 
                          className="cart-item" 
                          style={{ 
                            background: 'var(--bg-input)', 
                            padding: '16px', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            opacity: isItemSelected ? 1 : 0.65,
                            border: isItemSelected ? '1px solid var(--border-light)' : '1px dashed var(--border-light)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Checkbox */}
                            <input 
                              type="checkbox" 
                              checked={isItemSelected} 
                              onChange={() => toggleSelectItem(item.id)}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: 'pointer', flexShrink: 0 }}
                              title={isItemSelected ? "Deselect item" : "Select item for purchase"}
                            />

                            <div style={{ width: '44px', height: '44px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {item.imageUrl && item.imageUrl.length > 4 ? (
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <ProductIcon name={item.name} category={item.category} size={20} />
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>{item.name}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{item.category}</span>
                                {hasDiscount && (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                    color: '#ffffff', 
                                    fontWeight: '800', 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                                  }}>
                                    {item.discountPercentage}% OFF
                                  </span>
                                )}
                              </div>
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

                            <div style={{ textAlign: 'right', minWidth: '95px' }}>
                              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </div>
                              {hasDiscount && (
                                <div style={{ fontSize: '12px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                                  ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>

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
                      );
                    })}
                  </div>

                  <div style={{ flex: 1, background: 'var(--bg-input)', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>Order Price Summary</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div className="flex-between">
                        <span>Total MRP ({selectedCartItems.length} selected)</span>
                        <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                      </div>
                      {calculateDiscountSavings() > 0 && (
                        <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                          <span style={{ fontWeight: '600' }}>Discount Savings</span>
                          <strong style={{ fontWeight: '700' }}>-₹{calculateDiscountSavings().toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      <div className="flex-between">
                        <span>Items Subtotal</span>
                        <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex-between">
                        <span>Delivery Charges</span>
                        {calculateDeliveryFee() === 0 ? (
                          <span style={{ color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>FREE</span>
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹99</span>
                          </span>
                        ) : (
                          <strong style={{ color: 'var(--text-primary)' }}>₹99</strong>
                        )}
                      </div>

                      {/* Delivery notification indicator */}
                      {calculateSubtotal() > 0 && calculateSubtotal() < 500 && (
                        <div style={{ 
                          background: 'rgba(245, 158, 11, 0.12)', 
                          border: '1px solid rgba(245, 158, 11, 0.3)', 
                          borderRadius: '6px', 
                          padding: '6px 10px', 
                          fontSize: '11px', 
                          color: '#f59e0b', 
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>🚚</span> Add ₹{(500 - calculateSubtotal()).toLocaleString('en-IN')} more for <strong>FREE Delivery</strong>!
                        </div>
                      )}
                      {/* Total Savings banner */}
                      {calculateTotalSavings() > 0 && (
                        <div style={{ 
                          background: 'rgba(16, 185, 129, 0.12)', 
                          border: '1px solid rgba(16, 185, 129, 0.35)', 
                          borderRadius: '8px', 
                          padding: '10px 14px', 
                          fontSize: '13px', 
                          color: '#10b981', 
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>💰</span> Total Savings
                          </span>
                          <strong style={{ fontSize: '15px', color: '#10b981', fontWeight: '800' }}>
                            ₹{calculateTotalSavings().toLocaleString('en-IN')}
                          </strong>
                        </div>
                      )}

                      <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '17px', color: 'var(--text-primary)' }}>
                        <span style={{ fontWeight: '700' }}>Total Amount</span>
                        <strong style={{ color: 'var(--accent-teal)', fontSize: '18px', fontWeight: '800' }}>
                          ₹{calculateTotal().toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleStartCheckout} 
                      disabled={selectedCartItems.length === 0}
                      className="btn btn-success btn-block" 
                      style={{ 
                        marginTop: '12px', 
                        padding: '12px', 
                        fontSize: '15px', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        opacity: selectedCartItems.length === 0 ? 0.5 : 1,
                        cursor: selectedCartItems.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {selectedCartItems.length === 0 ? "Select items to checkout" : `Proceed to Checkout (${selectedCartItems.length} item${selectedCartItems.length === 1 ? '' : 's'})`} <ArrowRight size={18} />
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

      {/* Interactive Checkout & Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 2500 }} onClick={() => { if (!isProcessingPayment) setShowPaymentModal(false); }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header & Progress Stepper */}
            <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--accent-teal)' }} />
                  {paymentStep === 1 && "Checkout: Delivery & Review"}
                  {paymentStep === 2 && "Secure Payment Gateway"}
                  {paymentStep === 3 && "Processing Payment"}
                  {paymentStep === 4 && "Order Confirmed!"}
                </h2>
                {!isProcessingPayment && (
                  <button onClick={() => setShowPaymentModal(false)} className="btn-icon-only">
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                {[
                  { num: 1, label: 'Review & Address' },
                  { num: 2, label: 'Payment' },
                  { num: 3, label: 'Verification' },
                  { num: 4, label: 'Order Created' }
                ].map((s, idx) => {
                  const isActive = paymentStep === s.num;
                  const isCompleted = paymentStep > s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--accent-emerald)' : isActive ? 'var(--accent-teal)' : 'var(--bg-card-hover)',
                          color: isCompleted || isActive ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          border: '1px solid var(--border-light)'
                        }}>
                          {isCompleted ? <Check size={14} /> : s.num}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {s.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <div style={{ flex: 1, height: '2px', background: paymentStep > s.num ? 'var(--accent-emerald)' : 'var(--border-light)', margin: '0 8px' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Dynamic per step */}
            <div className="modal-body" style={{ overflowY: 'auto', padding: '20px' }}>
              
              {/* STEP 1: Delivery Address & Order Review */}
              {paymentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Modern Compact Delivery Address Section */}
                  <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: addresses.length > 0 ? '10px' : '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} style={{ color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Delivery Address
                        </span>
                      </div>
                      {addresses.length > 0 && (
                        <button 
                          type="button" 
                          onClick={handleOpenAddAddress} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          + Add New Address
                        </button>
                      )}
                    </div>

                    {addresses.length > 0 ? (
                      <div>
                        {/* Horizontal Compact Address Selection Chips */}
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                          {addresses.map((addr) => {
                            const formattedAddr = `${addr.streetAddress}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
                            const isSelected = deliveryInfo.address === formattedAddr && deliveryInfo.name === addr.fullName;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setDeliveryInfo({
                                    name: addr.fullName,
                                    phone: addr.phone,
                                    address: formattedAddr
                                  });
                                  setShowCustomAddressInput(false);
                                }}
                                style={{
                                  flex: '1 1 0px',
                                  minWidth: '200px',
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  border: isSelected ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                                  background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-card)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span className="badge badge-customer" style={{ fontSize: '9px', padding: '1px 5px', fontWeight: '700' }}>
                                    {addr.addressType || 'HOME'}
                                  </span>
                                  {isSelected ? (
                                    <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <Check size={11} strokeWidth={3} /> Selected
                                    </span>
                                  ) : addr.isDefault ? (
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Default</span>
                                  ) : null}
                                </div>

                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {addr.fullName} <span style={{ fontWeight: '400', fontSize: '11px', color: 'var(--text-muted)' }}>({addr.phone})</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {addr.streetAddress}, {addr.city}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Toggle button for custom manual address */}
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setShowCustomAddressInput(!showCustomAddressInput)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {showCustomAddressInput ? '▲ Hide Custom Address Form' : '▼ Or enter a different delivery address'}
                          </button>
                        </div>

                        {showCustomAddressInput && (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--border-light)', paddingTop: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <input 
                                type="text" 
                                value={deliveryInfo.name} 
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })} 
                                className="form-input" 
                                placeholder="Recipient Name"
                                style={{ fontSize: '12px', padding: '8px 10px' }}
                                required
                              />
                              <input 
                                type="tel" 
                                value={deliveryInfo.phone} 
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })} 
                                className="form-input" 
                                placeholder="Contact Phone"
                                style={{ fontSize: '12px', padding: '8px 10px' }}
                                required
                              />
                            </div>
                            <input 
                              type="text" 
                              value={deliveryInfo.address} 
                              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })} 
                              className="form-input" 
                              placeholder="Street Address, City, State, PIN Code"
                              style={{ fontSize: '12px', padding: '8px 10px' }}
                              required
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={deliveryInfo.name} 
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })} 
                            className="form-input" 
                            placeholder="Recipient Name *"
                            style={{ fontSize: '12px', padding: '8px 10px' }}
                            required
                          />
                          <input 
                            type="tel" 
                            value={deliveryInfo.phone} 
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })} 
                            className="form-input" 
                            placeholder="Phone Number *"
                            style={{ fontSize: '12px', padding: '8px 10px' }}
                            required
                          />
                        </div>
                        <input 
                          type="text" 
                          value={deliveryInfo.address} 
                          onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })} 
                          className="form-input" 
                          placeholder="Full Street Address, City, State, PIN Code *"
                          style={{ fontSize: '12px', padding: '8px 10px' }}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700' }}>
                      Items to Purchase ({selectedCartItems.reduce((sum, it) => sum + it.quantity, 0)})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {selectedCartItems.map((item) => {
                        const hasDisc = item.originalPrice && item.originalPrice > item.price;
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)' }}>
                                {item.imageUrl && item.imageUrl.length > 4 ? (
                                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ProductIcon name={item.name} category={item.category} size={16} />
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                                  {hasDisc && (
                                    <span style={{ 
                                      marginLeft: '6px', 
                                      fontSize: '9px', 
                                      padding: '1px 5px', 
                                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                      color: '#ffffff',
                                      fontWeight: '800',
                                      borderRadius: '3px'
                                    }}>
                                      {item.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <strong style={{ fontSize: '14px', color: 'var(--accent-teal)' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Price Breakdown */}
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Total Regular MRP</span>
                      <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    {calculateDiscountSavings() > 0 && (
                      <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                        <span style={{ fontWeight: '600' }}>Total Discount Savings</span>
                        <strong style={{ fontWeight: '700' }}>-₹{calculateDiscountSavings().toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Items Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Delivery Charges</span>
                      {calculateDeliveryFee() === 0 ? (
                        <span style={{ color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>FREE</span>
                          <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹99</span>
                        </span>
                      ) : (
                        <strong style={{ color: 'var(--text-primary)' }}>₹99</strong>
                      )}
                    </div>
                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '16px', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: '700' }}>Final Amount Payable</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '18px', fontWeight: '800' }}>
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (!deliveryInfo.name.trim() || !deliveryInfo.address.trim()) {
                        showToast('error', 'Incomplete Details', 'Please fill in your recipient name and delivery address.');
                        return;
                      }
                      setPaymentStep(2);
                    }} 
                    className="btn btn-primary btn-block" 
                    style={{ padding: '12px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Proceed to Payment Options <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: Choose Payment Method */}
              {paymentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                      Select Payment Method
                    </h4>

                    {/* Payment Method Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { id: 'upi', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                        { id: 'netbanking', label: 'Net Banking', icon: Store, desc: 'All Major Indian Banks' },
                        { id: 'cod', label: 'Cash on Delivery', icon: Truck, desc: 'Pay on delivery via Cash/UPI' }
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <div 
                            key={pm.id} 
                            onClick={() => setPaymentMethod(pm.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                              background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-input)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Icon size={18} style={{ color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                              <strong style={{ fontSize: '13px', color: isSelected ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{pm.label}</strong>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pm.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Specific Form */}
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    {paymentMethod === 'upi' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <QrCode size={36} style={{ color: 'var(--accent-teal)' }} />
                          <div>
                            <strong style={{ fontSize: '14px' }}>Instant UPI Checkout</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan with any UPI App or enter your Virtual Payment Address (VPA)</div>
                          </div>
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Enter UPI ID / VPA</label>
                          <input 
                            type="text" 
                            value={upiId} 
                            onChange={(e) => setUpiId(e.target.value)} 
                            placeholder="username@okhdfcbank"
                            className="form-input" 
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Card Number</label>
                          <input 
                            type="text" 
                            value={cardInfo.number} 
                            onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })} 
                            placeholder="4532 •••• •••• 8892" 
                            className="form-input" 
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Name on Card</label>
                            <input 
                              type="text" 
                              value={cardInfo.name} 
                              onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })} 
                              placeholder="Name" 
                              className="form-input" 
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>Expiry</label>
                            <input 
                              type="text" 
                              value={cardInfo.expiry} 
                              onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })} 
                              placeholder="MM/YY" 
                              className="form-input" 
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '11px' }}>CVV</label>
                            <input 
                              type="password" 
                              value={cardInfo.cvv} 
                              onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })} 
                              placeholder="123" 
                              maxLength={4}
                              className="form-input" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Select Bank</label>
                        <select 
                          value={selectedBank} 
                          onChange={(e) => setSelectedBank(e.target.value)} 
                          className="form-select"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You will be redirected to your bank's secure authorization portal.</span>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Truck size={28} style={{ color: 'var(--accent-teal)' }} />
                        <div>
                          <strong style={{ fontSize: '13px' }}>Cash on Delivery Available</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay cash or scan dynamic QR upon package delivery.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Button & Security Note */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setPaymentStep(1)} 
                        className="btn btn-secondary" 
                        style={{ padding: '12px 18px' }}
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        onClick={handleProcessPayment} 
                        className="btn btn-success" 
                        style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Lock size={16} /> Pay ₹{calculateTotal().toLocaleString('en-IN')} & Confirm Order
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Lock size={12} /> 256-Bit SSL Encrypted & PCI-DSS Level 1 Certified
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Processing Screen */}
              {paymentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(20, 184, 166, 0.2)', borderTopColor: 'var(--accent-teal)', animation: 'spin 1s linear infinite' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Authorizing Payment</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
                      Communicating with payment gateway and securing order reservation. Please do not refresh.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Order Created Confirmation Screen */}
              {paymentStep === 4 && confirmedOrder && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 10px', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={38} />
                  </div>

                  <div>
                    <span className="badge badge-approved" style={{ fontSize: '12px', padding: '4px 10px', marginBottom: '8px' }}>PAYMENT SUCCESSFUL</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>Order Placed Successfully!</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Order reference: <strong style={{ color: 'var(--accent-blue)' }}>{confirmedOrder.orderId}</strong>
                    </p>
                  </div>

                  <div style={{ width: '100%', background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>
                      <strong>{confirmedOrder.date}</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Deliver to:</span>
                      <strong>{deliveryInfo.name} ({deliveryInfo.phone})</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '16px' }}>₹{confirmedOrder.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowPaymentModal(false);
                        setActiveTab('orders');
                      }} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      View Order History
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowPaymentModal(false)} 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Shipping Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" style={{ zIndex: 3100 }} onClick={() => setShowAddressModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: 'var(--accent-teal)' }} />
                {addressModalMode === 'add' ? 'Add New Address' : 'Edit Shipping Address'}
              </h2>
              <button onClick={() => setShowAddressModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma"
                  value={addressForm.fullName} 
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 43210"
                  value={addressForm.phone} 
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Flat, House no., Building, Street Address *</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Flat 402, Sunshine Heights, 12th Main, Indiranagar"
                  value={addressForm.streetAddress} 
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })} 
                  required 
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bengaluru"
                    value={addressForm.city} 
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Karnataka"
                    value={addressForm.state} 
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">PIN Code / Postal Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 560038"
                    value={addressForm.postalCode} 
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Type</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['HOME', 'WORK', 'OTHER'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, addressType: type })}
                        className={addressForm.addressType === type ? "btn btn-primary" : "btn btn-secondary"}
                        style={{ flex: 1, padding: '8px 4px', fontSize: '11px', textTransform: 'capitalize' }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <input 
                  type="checkbox" 
                  id="makeDefaultCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                />
                <label htmlFor="makeDefaultCheckbox" style={{ fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                  Make this my default shipping address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700' }}>
                  <Save size={16} /> Save Address
                </button>
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}