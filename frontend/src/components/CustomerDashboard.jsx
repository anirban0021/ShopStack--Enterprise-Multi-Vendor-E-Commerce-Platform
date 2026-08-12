import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Package, RefreshCw, ArrowLeft, Edit2, Save, X, LogOut, 
  CheckCircle2, AlertCircle, Phone, MapPin, Sun, Moon, Heart, 
  ShoppingCart, Plus, Minus, Trash2, Check,
  CreditCard, QrCode, Smartphone, ArrowRight, ShieldCheck, Lock, Store, Truck,
  Receipt, RotateCcw, DollarSign, Clock, HelpCircle, FileText, CheckCircle, Search, Filter, AlertTriangle
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
  const [products, setProducts] = useState([]);

  // Transactions & Refunds State
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('ALL');
  const [transactionSearch, setTransactionSearch] = useState('');
  
  // Customer Return / Refund Request Modal State
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [returnReasonCategory, setReturnReasonCategory] = useState('DEFECTIVE_DAMAGED');
  const [resolutionType, setResolutionType] = useState('REFUND');
  const [refundReason, setRefundReason] = useState('Defective or damaged item received');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [orderRefundHistory, setOrderRefundHistory] = useState([]);
  
  // Return Timeline Tracking Modal
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);

  const fetchTransactions = async () => {
    if (!profile.id) return;
    setIsLoadingTransactions(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/transactions?userId=${profile.id}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to load customer transactions", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleOpenRefundModal = async (order) => {
    setRefundModalOrder(order);
    const rem = order.refundableBalance !== undefined ? order.refundableBalance : order.totalAmount;
    setRefundAmount(rem.toString());
    setReturnReasonCategory('DEFECTIVE_DAMAGED');
    setResolutionType('REFUND');
    setRefundReason('Defective or damaged item received');
    setCustomerNotes('');
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/refund/${order.orderId}`);
      setOrderRefundHistory(res.data || []);
    } catch (err) {
      setOrderRefundHistory([]);
    }
  };

  const handleSubmitRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundModalOrder) return;
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid refund amount.');
      return;
    }
    setIsSubmittingRefund(true);
    try {
      const res = await axios.post('http://localhost:8080/api/payment/refund/request', {
        orderId: refundModalOrder.orderId,
        amount: amt,
        returnReasonCategory: returnReasonCategory,
        resolutionType: resolutionType,
        reason: refundReason.trim() || 'Customer requested return',
        customerNotes: customerNotes.trim()
      });
      showToast('success', 'Return Request Submitted!', `Your request is PENDING inspection. Once the item is returned and verified, your ${resolutionType.toLowerCase()} of ₹${amt} will be approved.`);
      setRefundModalOrder(null);
      if (fetchOrders) fetchOrders();
      fetchTransactions();
    } catch (err) {
      showToast('error', 'Request Failed', err.response?.data || 'Failed to submit return request.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to load products in CustomerDashboard", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, [profile.id]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  // Auto-select valid in-stock items in cart initially or when items/products change
  useEffect(() => {
    if (Array.isArray(cart)) {
      const inStockIds = cart.filter(item => {
        const liveProd = products.find(p => p.id === item.id);
        const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
        return stock > 0;
      }).map(i => i.id);

      setSelectedCartItemIds(prev => {
        if (prev.length === 0 && inStockIds.length > 0) return inStockIds;
        const validPrev = prev.filter(id => inStockIds.includes(id));
        const newIds = inStockIds.filter(id => !prev.includes(id));
        const merged = Array.from(new Set([...validPrev, ...newIds]));
        return merged;
      });
    }
  }, [cart, products]);

  const inStockCartItems = (Array.isArray(cart) ? cart : []).filter(item => {
    const liveProd = products.find(p => p.id === item.id);
    const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
    return stock > 0;
  });

  const isAllSelected = inStockCartItems.length > 0 && inStockCartItems.every(i => selectedCartItemIds.includes(i.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(inStockCartItems.map(i => i.id));
    }
  };

  const toggleSelectItem = (productId) => {
    const liveProd = products.find(p => p.id === productId);
    const itemInCart = (Array.isArray(cart) ? cart : []).find(i => i.id === productId);
    const stock = liveProd != null ? liveProd.stock : (itemInCart?.stock ?? 0);
    
    if (stock <= 0) {
      showToast('error', 'Item Out of Stock', "This product is currently out of stock and cannot be selected for purchase.");
      return;
    }

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
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
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
      showToast('error', 'Cart Selection', 'Please select at least 1 in-stock item from your cart to proceed to checkout.');
      return;
    }

    // Check if any selected item is out of stock or exceeds inventory
    const outOfStockItem = selectedCartItems.find(item => {
      const liveProd = products.find(p => p.id === item.id);
      const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
      return stock <= 0 || item.quantity > stock;
    });

    if (outOfStockItem) {
      const liveProd = products.find(p => p.id === outOfStockItem.id);
      const stock = liveProd != null ? liveProd.stock : (outOfStockItem.stock ?? 0);
      if (stock <= 0) {
        showToast('error', 'Out of Stock', `Cannot proceed to checkout: "${outOfStockItem.name}" is currently out of stock. Please remove it from your selection.`);
      } else {
        showToast('error', 'Insufficient Stock', `Cannot proceed to checkout: "${outOfStockItem.name}" only has ${stock} units available.`);
      }
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProcessPayment = async () => {
    if (!deliveryInfo.address.trim() || !deliveryInfo.name.trim()) {
      showToast('error', 'Incomplete Details', 'Please provide a valid delivery address and recipient name.');
      return;
    }

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      setPaymentStep(3);

      try {
        const payload = {
          userId: profile.id,
          items: selectedCartItems,
          deliveryInfo: deliveryInfo,
          paymentMethod: 'COD'
        };

        const res = await axios.post('http://localhost:8080/api/payment/verify-and-order', payload);
        setConfirmedOrder(res.data);
        setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
        setSelectedCartItemIds([]);
        setIsProcessingPayment(false);
        setPaymentStep(4);
        if (fetchOrders) fetchOrders();
      } catch (err) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showToast('error', 'Order Failed', err.response?.data || 'Failed to place Cash on Delivery order.');
      }
      return;
    }

    // Razorpay Online Gateway flow (UPI, Card, NetBanking)
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        showToast('error', 'Gateway Error', 'Could not load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const totalAmount = calculateTotal();
      const orderRes = await axios.post('http://localhost:8080/api/payment/create-order', {
        amount: totalAmount,
        receipt: `rcpt_${profile.id}_${Date.now()}`
      });

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId || 'rzp_test_TOD9vXSNPzLLOn',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopStack Enterprise',
        description: `Order Checkout (${selectedCartItems.length} items)`,
        order_id: razorpayOrderId,
        prefill: {
          name: deliveryInfo.name || profile.fullName,
          email: profile.email || '',
          contact: deliveryInfo.phone || profile.phone || ''
        },
        notes: {
          address: deliveryInfo.address
        },
        theme: {
          color: '#0d9488'
        },
        handler: async function (response) {
          setPaymentStep(3); // Authorizing / processing animation
          try {
            const verifyPayload = {
              userId: profile.id,
              items: selectedCartItems,
              deliveryInfo: deliveryInfo,
              paymentMethod: 'RAZORPAY',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            };

            const verifyRes = await axios.post('http://localhost:8080/api/payment/verify-and-order', verifyPayload);
            setConfirmedOrder(verifyRes.data);
            setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
            setSelectedCartItemIds([]);
            setIsProcessingPayment(false);
            setPaymentStep(4);
            if (fetchOrders) fetchOrders();
            fetchTransactions();
          } catch (err) {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showToast('error', 'Verification Failed', err.response?.data || 'Could not verify Razorpay payment.');
          }
        },
        modal: {
          ondismiss: async function () {
            setIsProcessingPayment(false);
            showToast('info', 'Payment Cancelled', 'Razorpay checkout was dismissed.');
            try {
              await axios.post('http://localhost:8080/api/payment/record-failed', {
                userId: profile.id,
                razorpayOrderId: razorpayOrderId,
                errorMessage: 'Payment window was dismissed by customer',
                amount: totalAmount,
                items: selectedCartItems,
                deliveryInfo: deliveryInfo
              });
              if (fetchOrders) fetchOrders();
              fetchTransactions();
            } catch (e) {
              console.error("Failed to record cancelled checkout", e);
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showToast('error', 'Payment Failed', response.error?.description || 'Razorpay transaction was unsuccessful.');
        try {
          await axios.post('http://localhost:8080/api/payment/record-failed', {
            userId: profile.id,
            razorpayOrderId: razorpayOrderId,
            errorMessage: response.error?.description || 'Razorpay transaction unsuccessful',
            amount: totalAmount,
            items: selectedCartItems,
            deliveryInfo: deliveryInfo
          });
          if (fetchOrders) fetchOrders();
          fetchTransactions();
        } catch (e) {
          console.error("Failed to record failed checkout", e);
        }
      });
      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(2);
      showToast('error', 'Payment Initialization Failed', err.response?.data || 'Failed to initialize Razorpay checkout.');
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
            onClick={() => setActiveTab('transactions')} 
            className={`sidebar-item ${activeTab === 'transactions' ? 'sidebar-item-active' : ''}`}
          >
            <Receipt size={18} /> Transactions ({transactions.length})
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
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Your Order History</h2>
                <button 
                  type="button" 
                  onClick={() => { if (fetchOrders) fetchOrders(); fetchTransactions(); }} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map((ord, i) => {
                    const payStatus = ord.paymentStatus || 'PENDING';
                    const isPaid = payStatus === 'PAID';
                    const isRefunded = payStatus === 'REFUNDED';
                    const isPartiallyRefunded = payStatus === 'PARTIALLY_REFUNDED';
                    const isFailed = payStatus === 'FAILED';

                    return (
                      <div key={ord.id || i} className="order-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--bg-input)' }}>
                        <div className="order-card-header" style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="order-id" style={{ fontSize: '16px', fontWeight: '700' }}>{ord.orderId}</span>
                            <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                              {ord.paymentMethod || 'RAZORPAY'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* Fulfillment Status */}
                            <span className="order-status-badge">
                              {ord.status}
                            </span>

                            {/* Payment Status Badge */}
                            {isPaid && (
                              <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <Check size={12} strokeWidth={3} /> PAID
                              </span>
                            )}
                            {isRefunded && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <RotateCcw size={12} /> REFUNDED
                              </span>
                            )}
                            {isPartiallyRefunded && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                <RotateCcw size={12} /> PARTIAL REFUND
                              </span>
                            )}
                            {isFailed && (
                              <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={12} /> PAYMENT FAILED
                              </span>
                            )}
                            {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <Clock size={12} /> {payStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div>Date: <strong style={{ color: 'var(--text-primary)' }}>{ord.date}</strong></div>
                          {ord.razorpayPaymentId && (
                            <div style={{ fontSize: '12px' }}>
                              Payment ID: <code style={{ color: 'var(--accent-teal)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{ord.razorpayPaymentId}</code>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="order-items-list" style={{ background: 'var(--bg-primary)', margin: '14px 0', borderRadius: '8px', padding: '12px' }}>
                          {ord.items && ord.items.map((item, idx) => (
                            <div key={idx} className="order-item-row" style={{ alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ProductIcon name={item.productName || item.name} category={item.category} size={14} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.productName || item.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                                </div>
                              </div>
                              <strong style={{ fontSize: '13px' }}>₹{Math.round(item.price * item.quantity * 100) / 100}</strong>
                            </div>
                          ))}
                        </div>

                        {/* Delivery address snippet */}
                        {ord.deliveryAddress && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={13} style={{ color: 'var(--accent-teal)' }} />
                            <span>Delivery to: <strong style={{ color: 'var(--text-primary)' }}>{ord.recipientName || profile.fullName}</strong> — {ord.deliveryAddress}</span>
                          </div>
                        )}

                        <div className="order-total-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block' }}>Order Total</span>
                            <strong style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>₹{ord.totalAmount}</strong>
                          </div>

                          {/* Refund / Return Action Buttons */}
                          {(payStatus === 'REFUND_PENDING' || ord.status === 'RETURN_REQUESTED' || ord.hasPendingRefund) ? (
                            <button 
                              type="button" 
                              onClick={() => setTrackingModalOrder(ord)} 
                              className="btn btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}
                            >
                              <Clock size={14} /> Track Return (QC Pending)
                            </button>
                          ) : (isPaid || isPartiallyRefunded) ? (
                            <button 
                              type="button" 
                              onClick={() => handleOpenRefundModal(ord)} 
                              className="btn btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}
                            >
                              <RotateCcw size={14} /> Request Return / Refund
                            </button>
                          ) : isRefunded ? (
                            <button 
                              type="button"
                              onClick={() => setTrackingModalOrder(ord)}
                              className="badge" 
                              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '12px', padding: '6px 12px', border: '1px solid rgba(139, 92, 246, 0.3)', cursor: 'pointer' }}
                            >
                              ✓ Refunded (View Audit)
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Payment Transactions Ledger</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Complete audit trail of your checkout transactions, gateway responses, and refunds.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchTransactions} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingTransactions ? "spin-animation" : ""} /> Refresh
                </button>
              </div>

              {/* Transactions Overview Metric Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Paid Volume</span>
                    <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{transactions
                      .filter(t => t.paymentStatus === 'PAID' || t.paymentStatus === 'REFUNDED' || t.paymentStatus === 'PARTIALLY_REFUNDED')
                      .reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Successful transactions</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Completed Orders</span>
                    <CheckCircle size={16} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {transactions.filter(t => t.paymentStatus === 'PAID').length}
                  </div>
                  <div className="analytics-card-desc">Active paid orders</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Refunded Amount</span>
                    <RotateCcw size={16} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{transactions.reduce((sum, t) => sum + (Number(t.totalRefunded) || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Returned to source</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Failed Attempts</span>
                    <AlertTriangle size={16} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {transactions.filter(t => t.paymentStatus === 'FAILED').length}
                  </div>
                  <div className="analytics-card-desc">Cancelled or rejected</div>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID or Razorpay Payment ID..." 
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTransactionFilter(st)}
                      className={`btn ${transactionFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '6px 12px', height: '38px' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              {transactions.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Receipt className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No transaction history recorded yet.</p>
                </div>
              ) : (
                <div className="table-container" style={{ background: 'var(--bg-input)', borderRadius: '10px', overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Order ID</th>
                        <th>Method</th>
                        <th>Razorpay Payment ID</th>
                        <th>Total Amount</th>
                        <th>Payment Status</th>
                        <th>Refunds</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(tx => {
                          if (transactionFilter !== 'ALL') {
                            if (transactionFilter === 'REFUNDED') {
                              if (tx.paymentStatus !== 'REFUNDED' && tx.paymentStatus !== 'PARTIALLY_REFUNDED') return false;
                            } else if (tx.paymentStatus !== transactionFilter) {
                              return false;
                            }
                          }
                          if (transactionSearch.trim()) {
                            const query = transactionSearch.toLowerCase();
                            const matchOrderId = tx.orderId?.toLowerCase().includes(query);
                            const matchPaymentId = tx.razorpayPaymentId?.toLowerCase().includes(query);
                            return matchOrderId || matchPaymentId;
                          }
                          return true;
                        })
                        .map((tx) => {
                          const isPaid = tx.paymentStatus === 'PAID';
                          const isRefunded = tx.paymentStatus === 'REFUNDED';
                          const isPartiallyRefunded = tx.paymentStatus === 'PARTIALLY_REFUNDED';
                          const isFailed = tx.paymentStatus === 'FAILED';

                          return (
                            <tr key={tx.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tx.date}</td>
                              <td>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{tx.orderId}</strong>
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  {tx.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {tx.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {tx.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>
                                  ₹{tx.totalAmount}
                                </strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                    PAID
                                  </span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                                    REFUNDED
                                  </span>
                                )}
                                {isPartiallyRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                                    PARTIAL REFUND
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px' }}>
                                    FAILED
                                  </span>
                                )}
                                {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    {tx.paymentStatus}
                                  </span>
                                )}
                              </td>
                              <td>
                                {tx.totalRefunded > 0 ? (
                                  <div style={{ fontSize: '12px', color: '#c084fc' }}>
                                    <strong>₹{tx.totalRefunded}</strong> ({tx.refunds?.length} refund{tx.refunds?.length === 1 ? '' : 's'})
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {(tx.paymentStatus === 'REFUND_PENDING' || tx.hasPendingRefund) ? (
                                  <button
                                    type="button"
                                    onClick={() => setTrackingModalOrder(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 8px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                                    title="View Return & Inspection Status"
                                  >
                                    <Clock size={12} /> Pending QC
                                  </button>
                                ) : (isPaid || isPartiallyRefunded) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRefundModal(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                                  >
                                    <RotateCcw size={12} /> Return
                                  </button>
                                ) : isRefunded ? (
                                  <button
                                    type="button"
                                    onClick={() => setTrackingModalOrder(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 8px', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                    title="View Refund Audit"
                                  >
                                    <Check size={12} /> Refunded
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
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
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px', userSelect: 'none', opacity: inStockCartItems.length > 0 ? 1 : 0.6 }}>
                        <input 
                          type="checkbox" 
                          checked={isAllSelected} 
                          disabled={inStockCartItems.length === 0}
                          onChange={toggleSelectAll} 
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed' }}
                        />
                        <span>Select All In-Stock ({inStockCartItems.length}/{cart.length})</span>
                      </label>
                      <span style={{ fontSize: '12px', color: selectedCartItems.length > 0 ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: '700' }}>
                        {selectedCartItems.length} selected for checkout
                      </span>
                    </div>

                    {cart.map((item) => {
                      const liveProduct = products.find(p => p.id === item.id);
                      const currentStock = liveProduct != null ? liveProduct.stock : (item.stock ?? 0);
                      const isOutOfStock = currentStock <= 0;
                      const isExceedingStock = !isOutOfStock && item.quantity > currentStock;
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const isItemSelected = selectedCartItemIds.includes(item.id) && !isOutOfStock;

                      return (
                        <div 
                          key={item.id} 
                          className="cart-item" 
                          style={{ 
                            background: isOutOfStock ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-input)', 
                            padding: '16px', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            opacity: isOutOfStock ? 0.65 : (isItemSelected ? 1 : 0.65),
                            border: isOutOfStock ? '1px dashed rgba(239, 68, 68, 0.35)' : (isItemSelected ? '1px solid var(--border-light)' : '1px dashed var(--border-light)'),
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Checkbox */}
                            <input 
                              type="checkbox" 
                              checked={isItemSelected} 
                              disabled={isOutOfStock}
                              onChange={() => toggleSelectItem(item.id)}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: isOutOfStock ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                              title={isOutOfStock ? "Out of stock - cannot be selected" : (isItemSelected ? "Deselect item" : "Select item for purchase")}
                            />

                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {item.imageUrl && item.imageUrl.length > 4 ? (
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOutOfStock ? 'grayscale(0.7)' : 'none' }} />
                              ) : (
                                <ProductIcon name={item.name} category={item.category} size={20} />
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)' }}>{item.name}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{item.category}</span>
                                
                                {isOutOfStock ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))', 
                                    color: '#ef4444', 
                                    fontWeight: '800', 
                                    fontSize: '11px', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px',
                                    border: '1px solid rgba(239, 68, 68, 0.35)'
                                  }}>
                                    🚫 OUT OF STOCK
                                  </span>
                                ) : isExceedingStock ? (
                                  <span style={{ 
                                    background: 'rgba(245, 158, 11, 0.15)', 
                                    color: '#f59e0b', 
                                    fontWeight: '700', 
                                    fontSize: '11px', 
                                    padding: '2px 7px', 
                                    borderRadius: '4px',
                                    border: '1px solid rgba(245, 158, 11, 0.35)'
                                  }}>
                                    ⚠️ Only {currentStock} in stock (in cart: {item.quantity})
                                  </span>
                                ) : hasDiscount ? (
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
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            {/* Quantity controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                type="button" 
                                onClick={() => updateCartQuantity(item.id, -1, currentStock)} 
                                className="btn-icon-only"
                                style={{ padding: '3px' }}
                                title="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <strong style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center', color: isOutOfStock ? 'var(--accent-rose)' : 'inherit' }}>{item.quantity}</strong>
                              <button 
                                type="button" 
                                onClick={() => updateCartQuantity(item.id, 1, currentStock)} 
                                disabled={isOutOfStock || item.quantity >= currentStock}
                                className="btn-icon-only"
                                style={{ 
                                  padding: '3px',
                                  opacity: (isOutOfStock || item.quantity >= currentStock) ? 0.35 : 1,
                                  cursor: (isOutOfStock || item.quantity >= currentStock) ? 'not-allowed' : 'pointer'
                                }}
                                title={isOutOfStock ? "Product is out of stock" : (item.quantity >= currentStock ? "Reached maximum available stock" : "Increase quantity")}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '95px' }}>
                              <div style={{ fontSize: '16px', fontWeight: '800', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)' }}>
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
                              title="Remove item from cart"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const hasOutOfStockInCart = cart.some(item => {
                      const liveProd = products.find(p => p.id === item.id);
                      const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
                      return stock <= 0;
                    });

                    const selectedOutOfStockItems = selectedCartItems.filter(item => {
                      const liveProd = products.find(p => p.id === item.id);
                      const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
                      return stock <= 0 || item.quantity > stock;
                    });

                    const hasInvalidSelection = selectedOutOfStockItems.length > 0;
                    const canProceed = selectedCartItems.length > 0 && !hasInvalidSelection;

                    return (
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

                        {/* Out of Stock Notice */}
                        {hasOutOfStockInCart && (
                          <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>🚫</span>
                            <span>Out-of-stock items in cart cannot be checked out. Please remove or uncheck them.</span>
                          </div>
                        )}

                        <button 
                          type="button" 
                          onClick={handleStartCheckout} 
                          disabled={!canProceed}
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
                            opacity: !canProceed ? 0.5 : 1,
                            cursor: !canProceed ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {selectedCartItems.length === 0 
                            ? "Select items to checkout" 
                            : hasInvalidSelection
                              ? "Cannot Checkout (Out of Stock items selected)"
                              : `Proceed to Checkout (${selectedCartItems.length} item${selectedCartItems.length === 1 ? '' : 's'})`} 
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    );
                  })()}
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
              {/* STEP 2: Choose Payment Method */}
              {paymentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                      Select Payment Method
                    </h4>

                    {/* Payment Method Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div 
                        onClick={() => setPaymentMethod('razorpay')}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: paymentMethod === 'razorpay' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'razorpay' ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={20} style={{ color: paymentMethod === 'razorpay' ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                            <strong style={{ fontSize: '14px', color: paymentMethod === 'razorpay' ? 'var(--accent-teal)' : 'var(--text-primary)' }}>Razorpay Checkout</strong>
                          </div>
                          {paymentMethod === 'razorpay' && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Check size={12} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UPI, Cards, NetBanking, Wallets</span>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('cod')}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: paymentMethod === 'cod' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'cod' ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={20} style={{ color: paymentMethod === 'cod' ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                            <strong style={{ fontSize: '14px', color: paymentMethod === 'cod' ? 'var(--accent-teal)' : 'var(--text-primary)' }}>Cash on Delivery</strong>
                          </div>
                          {paymentMethod === 'cod' && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Check size={12} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay cash or UPI upon package arrival</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Details Preview */}
                  <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    {paymentMethod === 'razorpay' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>
                            <ShieldCheck size={26} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Razorpay Payment Gateway</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Instant verification • Official Razorpay Sandbox Active
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {['UPI / QR', 'Google Pay', 'PhonePe', 'Paytm', 'Visa / Mastercard', 'RuPay', 'NetBanking (All Banks)', 'Wallets'].map((tag, i) => (
                            <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          Clicking below will securely open the official Razorpay Checkout popup with test mode support.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>
                          <Truck size={26} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Cash on Delivery (COD)</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Pay ₹{calculateTotal().toLocaleString('en-IN')} in cash or scan QR when your order is delivered.
                          </div>
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
                        {paymentMethod === 'cod' ? (
                          <>
                            <Truck size={18} /> Confirm Cash on Delivery (₹{calculateTotal().toLocaleString('en-IN')})
                          </>
                        ) : (
                          <>
                            <Lock size={18} /> Pay ₹{calculateTotal().toLocaleString('en-IN')} with Razorpay
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Lock size={12} /> 256-Bit SSL Encrypted & PCI-DSS Level 1 Certified via Razorpay
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

      {/* Customer Return & Refund Request Modal */}
      {refundModalOrder && (
        <div className="modal-overlay" onClick={() => setRefundModalOrder(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: '#a78bfa' }} />
                <h2 className="modal-title">Initiate Return & Refund</h2>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            {/* Return Policy Banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', 
              border: '1px solid rgba(20, 184, 166, 0.3)', 
              borderRadius: '8px', 
              padding: '10px 14px', 
              marginBottom: '16px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>7-Day Buyer Protection Return Policy Active</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Free pickup will be arranged. Refund will be approved once product passes quality inspection at warehouse.</span>
              </div>
            </div>

            {/* Return Progress Preview */}
            <div style={{ 
              background: 'var(--bg-input)', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Return Lifecycle Stages
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                <div style={{ padding: '6px', background: 'rgba(20, 184, 166, 0.15)', borderRadius: '6px', color: 'var(--accent-teal)', fontWeight: '700' }}>
                  1. Request (Pending)
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  2. Pickup & Transit
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  3. Quality Check
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  4. Refund Disbursed
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{refundModalOrder.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order Total:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{refundModalOrder.totalAmount}</strong>
                </div>
                {refundModalOrder.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Razorpay Payment ID:</span>
                    <code style={{ color: 'var(--accent-teal)' }}>{refundModalOrder.razorpayPaymentId}</code>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refundable Balance:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>
                    ₹{refundModalOrder.refundableBalance !== undefined ? refundModalOrder.refundableBalance : refundModalOrder.totalAmount}
                  </strong>
                </div>
              </div>

              {/* Reason Category Selection */}
              <div className="form-group">
                <label className="form-label">Return Reason Category *</label>
                <select 
                  value={returnReasonCategory}
                  onChange={(e) => {
                    setReturnReasonCategory(e.target.value);
                    if (e.target.value === 'DEFECTIVE_DAMAGED') setRefundReason('Defective or damaged item received');
                    else if (e.target.value === 'WRONG_ITEM') setRefundReason('Wrong item delivered by seller');
                    else if (e.target.value === 'SIZE_FIT_ISSUE') setRefundReason('Size or fit issue');
                    else if (e.target.value === 'CHANGED_MIND') setRefundReason('Changed mind / No longer needed');
                    else if (e.target.value === 'NOT_AS_DESCRIBED') setRefundReason('Product does not match catalog description');
                  }}
                  className="form-select"
                >
                  <option value="DEFECTIVE_DAMAGED">Defective / Damaged Product</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="SIZE_FIT_ISSUE">Size or Fit Issue</option>
                  <option value="NOT_AS_DESCRIBED">Item Not As Described / Missing Parts</option>
                  <option value="CHANGED_MIND">Changed Mind / Accidental Purchase</option>
                </select>
              </div>

              {/* Resolution Type Selection */}
              <div className="form-group">
                <label className="form-label">Desired Resolution *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setResolutionType('REFUND')}
                    className={`btn ${resolutionType === 'REFUND' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    💳 Refund to Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionType('REPLACEMENT')}
                    className={`btn ${resolutionType === 'REPLACEMENT' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    🔄 Replacement
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionType('EXCHANGE')}
                    className={`btn ${resolutionType === 'EXCHANGE' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    👕 Size Exchange
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Refund Amount (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="1"
                  max={refundModalOrder.refundableBalance !== undefined ? refundModalOrder.refundableBalance : refundModalOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter amount to refund"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason Summary *</label>
                <input 
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Broken screen on arrival"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Comments / Item Condition</label>
                <textarea 
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Provide any additional details about the packaging, accessories, or defects..."
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setRefundModalOrder(null)} 
                  className="btn btn-secondary"
                  disabled={isSubmittingRefund}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' }}
                  disabled={isSubmittingRefund || !refundAmount}
                >
                  {isSubmittingRefund ? "Submitting Request..." : "Submit Return Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Lifecycle Progress Tracking Modal */}
      {trackingModalOrder && (
        <div className="modal-overlay" onClick={() => setTrackingModalOrder(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Return & Refund Lifecycle Status</h2>
              </div>
              <button onClick={() => setTrackingModalOrder(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{trackingModalOrder.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                  <span className={`badge ${trackingModalOrder.paymentStatus === 'REFUNDED' ? 'badge-approved' : trackingModalOrder.paymentStatus === 'REFUND_PENDING' ? 'badge-pending' : 'badge-customer'}`}>
                    {trackingModalOrder.paymentStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>₹{trackingModalOrder.totalAmount}</strong>
                </div>
              </div>

              {/* Visual 4-Step Stepper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
                {/* Step 1: Return Requested */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    ✓
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>1. Return Request Submitted</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Request registered in system. Reverse pickup initiated with logistics partner.
                    </div>
                  </div>
                </div>

                {/* Step 2: Item Shipped Back */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackingModalOrder.paymentStatus === 'REFUNDED' ? '#10b981' : '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    {trackingModalOrder.paymentStatus === 'REFUNDED' ? '✓' : '2'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>2. Courier Pickup & Warehouse Inward</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {trackingModalOrder.paymentStatus === 'REFUNDED' ? 'Package received at fulfillment center.' : 'Package in transit to ShopStack warehouse for inspection.'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Quality Check Inspection */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackingModalOrder.paymentStatus === 'REFUNDED' ? '#10b981' : 'var(--bg-input)', color: trackingModalOrder.paymentStatus === 'REFUNDED' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    {trackingModalOrder.paymentStatus === 'REFUNDED' ? '✓' : '3'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>3. Warehouse Quality Check (QC)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {trackingModalOrder.paymentStatus === 'REFUNDED' ? 'Passed quality check. Verified condition matched return reason.' : 'Inspection team verifies item condition against buyer reason.'}
                    </div>
                  </div>
                </div>

                {/* Step 4: Refund Disbursed */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: trackingModalOrder.paymentStatus === 'REFUNDED' ? '#10b981' : 'var(--bg-input)', color: trackingModalOrder.paymentStatus === 'REFUNDED' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                    {trackingModalOrder.paymentStatus === 'REFUNDED' ? '✓' : '4'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>4. Refund Disbursed via Razorpay</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {trackingModalOrder.paymentStatus === 'REFUNDED' ? 'Refund transferred back to original payment method.' : 'Awaiting quality check clearance before payment reversal.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Refund Records if any */}
              {trackingModalOrder.refunds && trackingModalOrder.refunds.length > 0 && (
                <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#a78bfa', display: 'block', marginBottom: '6px' }}>
                    Refund Log Details
                  </span>
                  {trackingModalOrder.refunds.map((rf, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Status: <strong style={{ color: rf.status === 'PROCESSED' ? '#10b981' : '#f59e0b' }}>{rf.status}</strong></span>
                        <strong style={{ color: '#c084fc' }}>₹{rf.amount}</strong>
                      </div>
                      {rf.adminNotes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Admin/QC Note: {rf.adminNotes}</div>}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setTrackingModalOrder(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}