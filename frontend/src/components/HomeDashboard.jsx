import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, User, ChevronDown, ShoppingCart, Heart, MapPin, 
  Package, LogOut, X, Trash2, Plus, Minus, Sun, Moon, Star, 
  MessageSquare, ShieldAlert, Store, ShoppingBag, Send, Truck, Check, Bell,
  CreditCard, QrCode, Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Lock,
  ExternalLink, Maximize2
} from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function HomeDashboard({ 
  user, cart, setCart, orders, setOrders, onLogout, 
  onGoToProfile, onGoToVendor, onGoToAdmin, onGoToWarehouse, theme, onToggleTheme,
  wishlist, setWishlist, toggleWishlist, addToCart, fetchOrders
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Checkout & Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Review & Address, 2: Payment Method, 3: Processing, 4: Confirmed
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);

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
      showFlash('error', "This product is currently out of stock and cannot be selected for purchase.");
      return;
    }

    setSelectedCartItemIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCartItems = (Array.isArray(cart) ? cart : []).filter(item => selectedCartItemIds.includes(item.id));

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${user.id}/addresses`);
      if (Array.isArray(res.data)) {
        setSavedAddresses(res.data);
      }
    } catch (e) {
      console.error("Could not fetch addresses", e);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [user?.id]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  // Product reviews & details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });

  // Lightbox keyboard navigation (Left/Right arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox || !selectedProduct) return;
      
      const allImgs = [];
      if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
        allImgs.push(selectedProduct.imageUrl);
      }
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        selectedProduct.images.forEach(img => {
          if (!allImgs.includes(img)) allImgs.push(img);
        });
      }
      if (allImgs.length === 0) allImgs.push(selectedProduct.imageUrl || '📦');

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveImageIndex(prev => (prev - 1 + allImgs.length) % allImgs.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveImageIndex(prev => (prev + 1) % allImgs.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowLightbox(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, selectedProduct]);
  
  // Toast notifications
  const [flash, setFlash] = useState({ type: '', text: '' });

  // Pending products count for Admin notification bell
  const [pendingProductsCount, setPendingProductsCount] = useState(0);

  const fetchPendingProductsCount = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products/pending');
      setPendingProductsCount(res.data.length);
    } catch (err) {
      console.error("Failed to load pending products count", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    if (user && user.role === 'ADMINISTRATOR') {
      fetchPendingProductsCount();
      const interval = setInterval(fetchPendingProductsCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash({ type: '', text: '' }), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // Local cart adjustments
  const updateCartQuantity = (productId, amount, maxStock) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === productId);
    if (!existing) return;
    
    const newQty = existing.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(productId);
    } else if (newQty > maxStock) {
      showFlash('error', `Only ${maxStock} items available in inventory.`);
    } else {
      setCart(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    setCart(cartItems.filter(item => item.id !== productId));
    showFlash('success', "Item removed from cart.");
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
      showFlash('error', 'Please select at least 1 in-stock item from your cart to proceed to checkout.');
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
        showFlash('error', `Cannot proceed to checkout: "${outOfStockItem.name}" is currently out of stock. Please remove it from your selection.`);
      } else {
        showFlash('error', `Cannot proceed to checkout: "${outOfStockItem.name}" only has ${stock} units available.`);
      }
      return;
    }

    const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
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
    setShowCartModal(false);
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
      showFlash('error', 'Please provide a valid delivery address and recipient name.');
      return;
    }

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      setPaymentStep(3); // Processing screen

      try {
        const payload = {
          userId: user.id,
          items: selectedCartItems,
          deliveryInfo: deliveryInfo,
          paymentMethod: 'COD'
        };

        const res = await axios.post('http://localhost:8080/api/payment/verify-and-order', payload);
        setConfirmedOrder(res.data);
        setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
        setSelectedCartItemIds([]);
        setIsProcessingPayment(false);
        setPaymentStep(4); // Confirmed screen
        fetchOrders();
        fetchProducts();
      } catch (err) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showFlash('error', err.response?.data || "Failed to place Cash on Delivery order.");
      }
      return;
    }

    // Razorpay Online Gateway flow
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        showFlash('error', 'Could not load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const totalAmount = calculateTotal();
      const orderRes = await axios.post('http://localhost:8080/api/payment/create-order', {
        amount: totalAmount,
        receipt: `rcpt_${user.id}_${Date.now()}`
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
          name: deliveryInfo.name || user.fullName,
          email: user.email || '',
          contact: deliveryInfo.phone || user.phone || ''
        },
        notes: {
          address: deliveryInfo.address
        },
        theme: {
          color: '#0d9488'
        },
        handler: async function (response) {
          setPaymentStep(3);
          try {
            const verifyPayload = {
              userId: user.id,
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
            fetchOrders();
            fetchProducts();
          } catch (err) {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showFlash('error', err.response?.data || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            showFlash('info', 'Razorpay checkout cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showFlash('error', response.error?.description || 'Razorpay transaction failed.');
      });
      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(2);
      showFlash('error', err.response?.data || "Failed to initialize Razorpay payment.");
    }
  };

  // Details & Reviews modal
  const handleOpenProductDetails = async (product) => {
    setSelectedProduct(product);
    setVendorDetails(null);
    setActiveImageIndex(0);
    try {
      const res = await axios.get(`http://localhost:8080/api/products/${product.id}/reviews`);
      setProductReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
    if (product.vendorId) {
      try {
        const res = await axios.get(`http://localhost:8080/api/customer/${product.vendorId}`);
        setVendorDetails(res.data);
      } catch (err) {
        console.error("Failed to load vendor details", err);
      }
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      showFlash('error', "Please enter a comment for your review.");
      return;
    }

    try {
      const payload = {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewerName: user.fullName || "Anonymous Customer",
        userId: user.id,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      
      await axios.post(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`, payload);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      setReviewForm({ rating: 5, comment: '' });
      showFlash('success', "Review submitted successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', "Failed to submit review.");
    }
  };

  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditReviewForm({ rating: rev.rating, comment: rev.comment });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewForm({ rating: 5, comment: '' });
  };

  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault();
    if (!editReviewForm.comment.trim()) {
      showFlash('error', "Please enter a comment for your review.");
      return;
    }
    try {
      const payload = {
        rating: editReviewForm.rating,
        comment: editReviewForm.comment,
        userId: user.id
      };
      await axios.put(`http://localhost:8080/api/products/reviews/${reviewId}`, payload);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      setEditingReviewId(null);
      showFlash('success', "Review updated successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', err.response?.data || "Failed to update review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/reviews/${reviewId}?userId=${user.id}`);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      showFlash('success', "Review deleted successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', err.response?.data || "Failed to delete review.");
    }
  };

  // Calculate dynamic average rating
  const getAverageRating = (reviewsList) => {
    if (reviewsList.length === 0) return 0.0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviewsList.length) * 10) / 10;
  };

  // Filters logic
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter;
    const disc = Number(prod.discountPercentage) || 0;
    const effectiveP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
    const matchesPrice = !maxPriceFilter || effectiveP <= parseFloat(maxPriceFilter);
    
    const ratingScore = prod.averageRating !== null && prod.averageRating !== undefined ? prod.averageRating : 0.0;
    const matchesRating = ratingScore >= minRatingFilter;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  return (
    <div className="dashboard-container">
      {/* Toast Alert Banner */}
      {flash.text && (
        <div className={`toast-notification ${flash.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flash.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flash.type === 'success' ? 'Success' : 'Notification'}</strong>
            <div className="toast-message-desc">{flash.text}</div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo" onClick={() => fetchProducts()} style={{ cursor: 'pointer' }}>ShopStack</h1>
          <div className="nav-search">
            <Search className="nav-search-icon" />
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </div>
        </div>

        <div className="nav-right">
          {/* Admin link */}
          {user.role === 'ADMINISTRATOR' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={onGoToAdmin} 
                className="btn-icon-only" 
                style={{ position: 'relative', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                title={`${pendingProductsCount} pending product submissions`}
              >
                <Bell size={16} />
                {pendingProductsCount > 0 && (
                  <span className="notification-badge" style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--accent-rose)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid var(--bg-card)',
                    animation: 'pulse-ring 2s infinite'
                  }}>
                    {pendingProductsCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={onGoToAdmin} 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)' }}
              >
                <ShieldAlert size={16} /> Admin Panel
              </button>
            </div>
          )}

          {/* Vendor link */}
          {user.role === 'VENDOR' && (
            <button 
              onClick={onGoToVendor} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}
            >
              <Store size={16} /> Seller Console
            </button>
          )}

          {/* Warehouse link */}
          {user.role === 'WAREHOUSE_STAFF' && (
            <button 
              onClick={onGoToWarehouse} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-indigo)' }}
            >
              <Truck size={16} strokeWidth={2} /> Warehouse Panel
            </button>
          )}

          {/* Theme Switch Button */}
          <button 
            type="button" 
            onClick={onToggleTheme} 
            className="btn-icon-only" 
            style={{ borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--accent-blue)' }} /> : <Moon size={18} style={{ color: 'var(--accent-indigo)' }} />}
          </button>

          <div 
            className="nav-user-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="nav-user-trigger">
              <User size={18} style={{ color: 'var(--accent-blue)' }} />
              <strong>{user?.fullName || 'User'}</strong>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </div>

            {showDropdown && (
              <div className="nav-dropdown">
                <div className="dropdown-header">Your Account</div>
                <div onClick={() => onGoToProfile('profile')} className="dropdown-item">
                  <User size={16} /> My Profile
                </div>
                <div onClick={() => onGoToProfile('addresses')} className="dropdown-item">
                  <MapPin size={16} /> Your Addresses
                </div>
                <div onClick={() => setShowOrdersModal(true)} className="dropdown-item">
                  <Package size={16} /> Order History
                </div>
                <div onClick={() => onGoToProfile('wishlist')} className="dropdown-item">
                  <Heart size={16} /> Wishlist
                </div>
                <div className="dropdown-divider" />
                <div onClick={onLogout} className="dropdown-item" style={{ color: 'var(--accent-rose)' }}>
                  <LogOut size={16} /> Logout
                </div>
              </div>
            )}
          </div>

          <div onClick={() => setShowCartModal(true)} className="nav-cart-btn">
            <ShoppingCart size={18} /> Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0})
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="section-container" style={{ paddingBottom: '0', paddingTop: '24px' }}>
        <div className="filters-container">
          <div className="filter-group">
            <label>Product Category</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Budget Price (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 3000" 
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px' }}
            />
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <select 
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))}
              className="form-select"
            >
              <option value="0">Show All Ratings</option>
              <option value="4">4.0 ★ & Above</option>
              <option value="4.5">4.5 ★ & Above</option>
              <option value="5">5.0 ★ Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="section-container" style={{ paddingTop: '20px' }}>
        <div className="section-header">
          <h3 className="section-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Catalog'}
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing {filteredProducts.length} approved products
          </span>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="cart-empty-state" style={{ gridColumn: 'span 4' }}>
            <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
            <p>No products match your active search or filters.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((prod) => {
              const isWishlisted = Array.isArray(wishlist) && wishlist.some(p => p.id === prod.id);
              const disc = Number(prod.discountPercentage) || 0;
              const finalPrice = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
              const savings = Math.max(0, Math.round((prod.price - finalPrice) * 100) / 100);

              return (
                <div key={prod.id} className="product-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* High-visibility Vibrant Discount Badge */}
                  {disc > 0 && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        left: '12px', 
                        zIndex: 15, 
                        fontWeight: '900',
                        fontSize: '11px',
                        letterSpacing: '0.6px',
                        padding: '5px 10px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#ffffff',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase',
                        lineHeight: 1
                      }}
                    >
                      {disc}% OFF
                    </div>
                  )}

                  {/* Heart button */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(prod, showFlash);
                    }} 
                    className={`product-wishlist-btn ${isWishlisted ? 'product-wishlist-active' : ''}`}
                    title="Add to Wishlist"
                  >
                    <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>

                  {/* Body click opens detail modal */}
                  <div 
                    onClick={() => handleOpenProductDetails(prod)} 
                    style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="product-image-container">
                      {prod.imageUrl && prod.imageUrl.length > 4 ? (
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <ProductIcon name={prod.name} category={prod.category} size={36} />
                      )}
                    </div>
                    <div className="product-info" style={{ flex: 1 }}>
                      <span className="product-category">{prod.category}</span>
                      <h4 className="product-title">{prod.name}</h4>
                      
                      {/* Rating display */}
                      <div className="stars-display" style={{ marginBottom: '12px', fontSize: '12px' }}>
                        <Star size={13} fill="currentColor" style={{ color: '#fbbf24' }} />
                        <strong>
                          {prod.averageRating !== null && prod.averageRating !== undefined && prod.averageRating > 0 
                            ? prod.averageRating.toFixed(1) 
                            : '0.0'}
                        </strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ({prod.reviewCount !== null && prod.reviewCount !== undefined ? prod.reviewCount : 0} reviews)
                        </span>
                      </div>

                      <div className="flex-between" style={{ marginTop: 'auto', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ margin: '0', fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                              ₹{Number(finalPrice).toLocaleString('en-IN')}
                            </span>
                            {disc > 0 && (
                              <span style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {disc > 0 && (
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              background: 'rgba(16, 185, 129, 0.16)', 
                              border: '1px solid rgba(16, 185, 129, 0.45)', 
                              color: '#10b981', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              padding: '2px 7px', 
                              borderRadius: '4px',
                              width: 'fit-content'
                            }}>
                              <span>✓</span> Save ₹{Number(savings).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        {prod.stock <= 0 ? (
                          <span className="badge badge-rejected" style={{ fontWeight: '700' }}>Out of Stock</span>
                        ) : prod.stock < 5 ? (
                          <span className="badge badge-pending" style={{ fontWeight: '700' }}>Only {prod.stock} left!</span>
                        ) : (
                          <span className="badge badge-approved" style={{ fontWeight: '700' }}>In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(prod, showFlash);
                    }} 
                    className="btn btn-primary btn-block" 
                    style={{ marginTop: '16px' }}
                    disabled={prod.stock <= 0}
                  >
                    {prod.stock <= 0 ? "Out of Stock" : <><Plus size={16} /> Add to Cart</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCartModal && (
        <div className="modal-overlay modal-overlay-drawer" onClick={() => setShowCartModal(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={22} style={{ color: 'var(--accent-blue)' }} />
                Shopping Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0})
              </h2>
              <button onClick={() => setShowCartModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {!Array.isArray(cart) || cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingCart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <>
                  {/* Select All Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px', userSelect: 'none', opacity: inStockCartItems.length > 0 ? 1 : 0.6 }}>
                      <input 
                        type="checkbox" 
                        checked={isAllSelected} 
                        disabled={inStockCartItems.length === 0}
                        onChange={toggleSelectAll} 
                        style={{ width: '17px', height: '17px', accentColor: 'var(--accent-teal)', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed' }}
                      />
                      <span>Select All In-Stock ({inStockCartItems.length}/{cart.length})</span>
                    </label>
                    <span style={{ fontSize: '12px', color: selectedCartItems.length > 0 ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: '700' }}>
                      {selectedCartItems.length} selected
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
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          opacity: isOutOfStock ? 0.65 : (isItemSelected ? 1 : 0.65), 
                          background: isOutOfStock ? 'rgba(239, 68, 68, 0.04)' : undefined,
                          border: isOutOfStock ? '1px dashed rgba(239, 68, 68, 0.35)' : (isItemSelected ? '1px solid var(--border-light)' : '1px solid transparent'),
                          borderRadius: '8px',
                          padding: '12px 10px',
                          marginBottom: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Item Selection Box */}
                        <div style={{ paddingTop: '10px' }}>
                          <input 
                            type="checkbox" 
                            checked={isItemSelected} 
                            disabled={isOutOfStock}
                            onChange={() => toggleSelectItem(item.id)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                            title={isOutOfStock ? "Out of Stock - Cannot be selected" : (isItemSelected ? "Deselect item" : "Select item for purchase")}
                          />
                        </div>

                        <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', position: 'relative' }}>
                          {item.imageUrl && item.imageUrl.length > 4 ? (
                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOutOfStock ? 'grayscale(0.7)' : 'none' }} />
                          ) : (
                            <ProductIcon name={item.name} category={item.category} size={20} />
                          )}
                        </div>
                        <div className="cart-item-info" style={{ flex: 1 }}>
                          <div className="cart-item-name" style={{ fontWeight: '700', fontSize: '14px', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {item.name}
                          </div>

                          {/* Out of Stock & Inventory Warnings */}
                          {isOutOfStock ? (
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))',
                              color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              fontSize: '11px', 
                              fontWeight: '800', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              marginTop: '4px',
                              letterSpacing: '0.3px'
                            }}>
                              <span>🚫</span> OUT OF STOCK
                            </div>
                          ) : isExceedingStock ? (
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              background: 'rgba(245, 158, 11, 0.15)', 
                              color: '#f59e0b', 
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              fontSize: '11px', 
                              fontWeight: '700', 
                              padding: '2px 7px', 
                              borderRadius: '4px',
                              marginTop: '4px'
                            }}>
                              ⚠️ Only {currentStock} in stock (in cart: {item.quantity})
                            </div>
                          ) : null}

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                            <span className="cart-item-price" style={{ fontWeight: '800', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                              <>
                                <span style={{ fontSize: '11px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444' }}>
                                  ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                                </span>
                                <span style={{ 
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                  color: '#ffffff', 
                                  fontWeight: '800', 
                                  fontSize: '9px', 
                                  padding: '1px 5px', 
                                  borderRadius: '3px' 
                                }}>
                                  {item.discountPercentage}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          
                          {/* Quantity Toggles */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <button 
                              onClick={() => updateCartQuantity(item.id, -1, currentStock)} 
                              className="btn-icon-only"
                              style={{ padding: '3px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <strong style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center', color: isOutOfStock ? 'var(--accent-rose)' : 'inherit' }}>
                              {item.quantity}
                            </strong>
                            <button 
                              onClick={() => updateCartQuantity(item.id, 1, currentStock)} 
                              disabled={isOutOfStock || item.quantity >= currentStock}
                              className="btn-icon-only"
                              style={{ 
                                padding: '3px', 
                                width: '24px', 
                                height: '24px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                opacity: (isOutOfStock || item.quantity >= currentStock) ? 0.35 : 1,
                                cursor: (isOutOfStock || item.quantity >= currentStock) ? 'not-allowed' : 'pointer'
                              }}
                              title={isOutOfStock ? "Product is out of stock" : (item.quantity >= currentStock ? "Reached maximum available stock" : "Increase quantity")}
                            >
                              <Plus size={12} />
                            </button>
                            <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: '700', color: isOutOfStock ? 'var(--text-muted)' : 'var(--accent-teal)' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="btn-icon-only" 
                          style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)', marginLeft: '4px' }}
                          title="Remove item from cart"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {cart.length > 0 && (() => {
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
                <div className="modal-footer" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch', background: 'var(--bg-input)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div className="flex-between">
                      <span>Total MRP ({selectedCartItems.length} selected)</span>
                      <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    {calculateDiscountSavings() > 0 && (
                      <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                        <span style={{ fontWeight: '600' }}>Applied Discount Savings</span>
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
                      <span style={{ fontWeight: '700' }}>Final Amount</span>
                      <strong style={{ color: 'var(--accent-teal)', fontWeight: '800' }}>₹{calculateTotal().toLocaleString('en-IN')}</strong>
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
                    onClick={handleStartCheckout} 
                    disabled={!canProceed}
                    className="btn btn-success btn-block" 
                    style={{ 
                      marginTop: '4px', 
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
        </div>
      )}

      {/* Order History Modal */}
      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} style={{ color: 'var(--accent-blue)' }} />
                Your Purchases ({orders.length})
              </h2>
              <button onClick={() => setShowOrdersModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {orders.length === 0 ? (
                <div className="cart-empty-state">
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">{order.orderId}</span>
                      <span className={`badge ${
                        order.status === 'DELIVERED' ? 'badge-approved' : 
                        order.status === 'SHIPPED' ? 'badge-pending' : 'badge-customer'
                      }`}>{order.status}</span>
                    </div>
                    <div className="order-date">Placed on: {order.date}</div>
                    
                    <div className="order-items-list">
                      {order.items && order.items.map((it, i) => (
                        <div key={i} className="order-item-row">
                          <span>{it.productName} (x{it.quantity})</span>
                          <strong>₹{it.price * it.quantity}</strong>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-total-row">
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Invoice Amount</span>
                      <strong style={{ fontSize: '16px', color: 'var(--accent-blue)' }}>₹{order.totalAmount}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Details & Reviews Modal */}
      {selectedProduct && (() => {
        const allImages = [];
        if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
          allImages.push(selectedProduct.imageUrl);
        }
        if (selectedProduct.images && selectedProduct.images.length > 0) {
          selectedProduct.images.forEach(img => {
            if (!allImages.includes(img)) {
              allImages.push(img);
            }
          });
        }
        if (allImages.length === 0) {
          allImages.push(selectedProduct.imageUrl || '📦');
        }
        const activeImg = allImages[activeImageIndex] || allImages[0] || '📦';

        return (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={20} />
                  Product Details
                </h2>
                <button onClick={() => setSelectedProduct(null)} className="btn-icon-only">
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {/* Product Gallery & Info Header Split */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap', width: '100%', minWidth: 0 }}>
                  {/* Left Column: Image Gallery */}
                  <div style={{ flex: '1 1 240px', minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Main Preview Box */}
                    <div 
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '220px', 
                        borderRadius: '12px', 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border-light)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowLightbox(true)}
                      title="Click to open in-app image viewer slideshow"
                    >
                      {activeImg.length <= 4 ? (
                        <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>{activeImg}</span>
                      ) : (
                        <img 
                          src={activeImg} 
                          alt={selectedProduct.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      )}

                      {/* Open In-App Gallery Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLightbox(true);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(15, 23, 42, 0.78)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          zIndex: 3
                        }}
                        title="Open interactive slideshow gallery"
                      >
                        <Maximize2 size={12} /> View Gallery ({allImages.length})
                      </button>

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                            }}
                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold', zIndex: 2 }}
                            title="Previous Image"
                          >
                            ‹
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                            }}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold', zIndex: 2 }}
                            title="Next Image"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Carousel Slider (Moves images only, no modal scrollbar) */}
                    {allImages.length > 1 && (
                      <div className="thumbnail-slider-container">
                        {allImages.length > 4 && (
                          <button 
                            type="button"
                            className="thumbnail-slider-btn"
                            title="Scroll left"
                            onClick={() => {
                              const track = document.getElementById('product-thumb-track');
                              if (track) track.scrollBy({ left: -100, behavior: 'smooth' });
                            }}
                          >
                            ‹
                          </button>
                        )}
                        <div 
                          id="product-thumb-track"
                          className="thumbnail-slider-track"
                        >
                          {allImages.map((img, idx) => {
                            const isActive = idx === activeImageIndex;
                            const isEmoji = img.length <= 4;
                            return (
                              <div 
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                onDoubleClick={() => {
                                  if (!isEmoji) window.open(img, '_blank');
                                }}
                                style={{ 
                                  width: '46px', 
                                  height: '46px', 
                                  flexShrink: 0, 
                                  borderRadius: '6px', 
                                  overflow: 'hidden', 
                                  border: isActive ? '2px solid var(--accent-indigo)' : '1px solid var(--border-light)', 
                                  cursor: 'pointer', 
                                  background: 'var(--bg-card)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                                }}
                                title={isEmoji ? img : "Click to preview (Double-click to open in new tab)"}
                              >
                                {isEmoji ? (
                                  <span style={{ fontSize: '20px' }}>{img}</span>
                                ) : (
                                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {allImages.length > 4 && (
                          <button 
                            type="button"
                            className="thumbnail-slider-btn"
                            title="Scroll right"
                            onClick={() => {
                              const track = document.getElementById('product-thumb-track');
                              if (track) track.scrollBy({ left: 100, behavior: 'smooth' });
                            }}
                          >
                            ›
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Main Info Block */}
                  <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    <span className="product-category" style={{ margin: '0', width: 'fit-content' }}>{selectedProduct.category}</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
                    
                    <div className="stars-display" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} fill="currentColor" style={{ color: '#fbbf24' }} />
                      <strong style={{ fontSize: '14px' }}>{getAverageRating(productReviews)} / 5.0</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({productReviews.length} reviews)</span>
                    </div>

                    {(() => {
                      const disc = Number(selectedProduct.discountPercentage) || 0;
                      const finalP = selectedProduct.finalPrice != null ? selectedProduct.finalPrice : (disc > 0 ? Math.round(selectedProduct.price * (1 - disc / 100) * 100) / 100 : selectedProduct.price);
                      const savings = Math.max(0, Math.round((selectedProduct.price - finalP) * 100) / 100);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '30px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                              ₹{Number(finalP).toLocaleString('en-IN')}
                            </span>
                            {disc > 0 && (
                              <>
                                <span style={{ fontSize: '18px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '2px' }}>
                                  ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                                </span>
                                <span style={{ 
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                  color: '#ffffff', 
                                  fontWeight: '800', 
                                  fontSize: '12px', 
                                  padding: '4px 10px', 
                                  borderRadius: '6px',
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                }}>
                                  {disc}% OFF
                                </span>
                              </>
                            )}
                            <span className={`badge ${selectedProduct.stock > 0 ? 'badge-approved' : 'badge-rejected'}`} style={{ marginLeft: 'auto', fontWeight: '700', fontSize: '12px', padding: '6px 12px' }}>
                              {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} units)` : 'Out of Stock'}
                            </span>
                          </div>
                          {disc > 0 && (
                            <div style={{ 
                              background: 'rgba(16, 185, 129, 0.14)', 
                              border: '1px solid rgba(16, 185, 129, 0.4)', 
                              borderRadius: '8px', 
                              padding: '10px 14px', 
                              color: '#10b981', 
                              fontSize: '13px', 
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span>🎉</span>
                              <span>Special Discount Applied! You save ₹{Number(savings).toLocaleString('en-IN')} ({disc}% discount) on this product!</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Product Info Section (Brand & Description) */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedProduct.brand && (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>Brand</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedProduct.brand}</span>
                    </div>
                  )}
                  {selectedProduct.description && (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>Description</span>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{selectedProduct.description}</p>
                    </div>
                  )}
                </div>

                {/* Vendor Details Section */}
                {vendorDetails ? (
                  <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-indigo)', marginBottom: '10px', letterSpacing: '0.05em' }}>Merchant / Vendor Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Store Name</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails.fullName}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Contact Email</span>
                        <a href={`mailto:${vendorDetails.email}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>{vendorDetails.email}</a>
                      </div>
                      {vendorDetails.phone && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Phone</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vendorDetails.phone}</span>
                        </div>
                      )}
                      {vendorDetails.address && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Location</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vendorDetails.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedProduct.vendorId ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
                    Loading merchant information...
                  </div>
                ) : null}

                {/* Write Review Form */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Write a Customer Review</h4>
                  <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your Rating:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={18} 
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            fill={star <= reviewForm.rating ? '#fbbf24' : 'none'}
                            style={{ color: '#fbbf24', cursor: 'pointer' }}
                            className="star-interactive"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="input-icon-wrapper">
                      <input 
                        type="text" 
                        placeholder="Share your thoughts about this product..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="form-input"
                        required
                      />
                      <button type="submit" className="input-action-btn" style={{ right: '12px' }}>
                        <Send size={16} style={{ color: 'var(--accent-blue)' }} />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reviews List */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Customer Reviews</h4>
                  {productReviews.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <MessageSquare size={16} />
                      <span>No reviews yet. Be the first to review this product!</span>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {productReviews.map((rev) => {
                        const isEditing = editingReviewId === rev.id;
                        const isOwner = user && rev.userId === user.id;

                        if (isEditing) {
                          return (
                            <div key={rev.id} className="review-item" style={{ background: 'var(--bg-card)', border: '1px dashed var(--accent-indigo)', padding: '16px' }}>
                              <form onSubmit={(e) => handleUpdateReview(e, rev.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className="review-author" style={{ fontWeight: 'bold' }}>Editing Your Review</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        size={16} 
                                        onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                                        fill={star <= editReviewForm.rating ? '#fbbf24' : 'none'}
                                        style={{ color: '#fbbf24', cursor: 'pointer' }}
                                        className="star-interactive"
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="input-icon-wrapper">
                                  <input 
                                    type="text"
                                    value={editReviewForm.comment}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                                    className="form-input"
                                    required
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button type="button" onClick={handleCancelEditReview} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                                    Cancel
                                  </button>
                                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                                    Save Changes
                                  </button>
                                </div>
                              </form>
                            </div>
                          );
                        }

                        return (
                          <div key={rev.id} className="review-item" style={{ padding: '16px' }}>
                            <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span className="review-author">{rev.reviewerName}</span>
                                <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginTop: '4px' }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={12} 
                                      fill={star <= rev.rating ? '#fbbf24' : 'none'}
                                      style={{ color: '#fbbf24' }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <span className="review-date">{rev.date}</span>
                                {isOwner && (
                                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleStartEditReview(rev)} 
                                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                                    >
                                      Edit
                                    </button>
                                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteReview(rev.id)} 
                                      style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="review-comment" style={{ marginTop: '8px' }}>{rev.comment}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* In-App Fullscreen Image Gallery Lightbox (Slides images one by one with arrows/touch) */}
      {showLightbox && selectedProduct && (() => {
        const allImages = [];
        if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
          allImages.push(selectedProduct.imageUrl);
        }
        if (selectedProduct.images && selectedProduct.images.length > 0) {
          selectedProduct.images.forEach(img => {
            if (!allImages.includes(img)) allImages.push(img);
          });
        }
        if (allImages.length === 0) {
          allImages.push(selectedProduct.imageUrl || '📦');
        }
        const currentImg = allImages[activeImageIndex] || allImages[0] || '📦';
        const isEmoji = currentImg.length <= 4;

        return (
          <div className="image-lightbox-overlay" onClick={() => setShowLightbox(false)}>
            {/* Top Bar */}
            <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-title">
                <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={22} />
                <span>{selectedProduct.name}</span>
                <span className="badge badge-customer" style={{ marginLeft: '6px', fontSize: '11px' }}>{selectedProduct.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="lightbox-counter">
                  Image {activeImageIndex + 1} of {allImages.length}
                </span>
                <button 
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setShowLightbox(false)}
                  title="Close Gallery (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Stage with Big Image and Nav Buttons */}
            <div className="lightbox-main-stage" onClick={(e) => e.stopPropagation()}>
              {allImages.length > 1 && (
                <button 
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={() => setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                  title="Previous Image (Left Arrow)"
                >
                  ‹
                </button>
              )}

              <div className="lightbox-img-wrapper">
                {isEmoji ? (
                  <span style={{ fontSize: '140px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                    {currentImg}
                  </span>
                ) : (
                  <img 
                    key={activeImageIndex}
                    src={currentImg} 
                    alt={`${selectedProduct.name} - slide ${activeImageIndex + 1}`} 
                  />
                )}
              </div>

              {allImages.length > 1 && (
                <button 
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={() => setActiveImageIndex(prev => (prev + 1) % allImages.length)}
                  title="Next Image (Right Arrow)"
                >
                  ›
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                const thumbIsEmoji = img.length <= 4;
                return (
                  <div 
                    key={idx}
                    className={`lightbox-thumb-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    title={`Slide to Image ${idx + 1}`}
                  >
                    {thumbIsEmoji ? (
                      <span style={{ fontSize: '24px' }}>{img}</span>
                    ) : (
                      <img src={img} alt={`thumb ${idx + 1}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: savedAddresses.length > 0 ? '10px' : '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} style={{ color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Delivery Address
                        </span>
                      </div>
                      {savedAddresses.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowPaymentModal(false);
                            onGoToProfile('addresses');
                          }} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          + Manage Addresses
                        </button>
                      )}
                    </div>

                    {savedAddresses.length > 0 ? (
                      <div>
                        {/* Horizontal Compact Address Selection Chips */}
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                          {savedAddresses.map((addr) => {
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
                        showFlash('error', 'Please fill in your recipient name and delivery address.');
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
                        setShowOrdersModal(true);
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
    </div>
  );
}