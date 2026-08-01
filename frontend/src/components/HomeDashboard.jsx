import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, User, ChevronDown, ShoppingCart, Heart, MapPin, 
  Package, LogOut, X, Trash2, Plus, Minus, Sun, Moon, Star, 
  MessageSquare, ShieldAlert, Store, ShoppingBag, Send, Truck, Check 
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
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });
  
  // Toast notifications
  const [flash, setFlash] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

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

  // Checkout handling
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  const taxRate = 0.18; // 18% GST
  const shippingFee = 99.00;
  
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return sub === 0 ? 0 : sub + (sub * taxRate) + shippingFee;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart,
        totalAmount: calculateTotal()
      };
      await axios.post(`http://localhost:8080/api/customer/${user.id}/orders`, payload);
      setCart([]);
      setShowCartModal(false);
      showFlash('success', "Order placed successfully! Stock levels updated.");
      fetchOrders();
      fetchProducts();
    } catch (err) {
      showFlash('error', "Failed to check out order. Please check inventory stock.");
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
    const matchesPrice = !maxPriceFilter || prod.price <= parseFloat(maxPriceFilter);
    
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
            <button 
              onClick={onGoToAdmin} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)' }}
            >
              <ShieldAlert size={16} /> Admin Panel
            </button>
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
            <ShoppingCart size={18} /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
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
              return (
                <div key={prod.id} className="product-card">
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

                      <div className="flex-between" style={{ marginTop: 'auto' }}>
                        <p className="product-price" style={{ margin: '0' }}>₹{prod.price}</p>
                        {prod.stock <= 0 ? (
                          <span className="badge badge-rejected">Sold Out</span>
                        ) : prod.stock < 5 ? (
                          <span className="badge badge-pending">Only {prod.stock} left!</span>
                        ) : (
                          <span className="badge badge-approved">In Stock</span>
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
                    <Plus size={16} /> Add to Cart
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
                cart.map((item, idx) => (
                  <div key={item.id} className="cart-item" style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl && item.imageUrl.length > 4 ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ProductIcon name={item.name} category={item.category} size={18} />
                      )}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price}</div>
                      
                      {/* Quantity Toggles */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1, item.stock)} 
                          className="btn-icon-only"
                          style={{ padding: '3px' }}
                        >
                          <Minus size={12} />
                        </button>
                        <strong style={{ fontSize: '13px' }}>{item.quantity}</strong>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1, item.stock)} 
                          className="btn-icon-only"
                          style={{ padding: '3px' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="btn-icon-only" 
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="modal-footer" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div className="flex-between">
                    <span>Items Subtotal</span>
                    <strong>₹{calculateSubtotal()}</strong>
                  </div>
                  <div className="flex-between">
                    <span>GST Tax (18%)</span>
                    <span>₹{Math.round(calculateSubtotal() * taxRate * 100) / 100}</span>
                  </div>
                  <div className="flex-between">
                    <span>Standard Shipping</span>
                    <span>₹{shippingFee}</span>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px', fontSize: '16px', color: 'var(--text-primary)' }}>
                    <span>Total Amount</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>₹{Math.round(calculateTotal() * 100) / 100}</strong>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn btn-success btn-block" style={{ marginTop: '8px' }}>
                  Place Order
                </button>
              </div>
            )}
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
            <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={20} />
                  Product Details
                </h2>
                <button onClick={() => setSelectedProduct(null)} className="btn-icon-only">
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {/* Product Gallery & Info Header Split */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {/* Left Column: Image Gallery */}
                  <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Main Preview Box */}
                    <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {activeImg.length <= 4 ? (
                        <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>{activeImg}</span>
                      ) : (
                        <img src={activeImg} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      )}

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold' }}
                            title="Previous Image"
                          >
                            ‹
                          </button>
                          <button 
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev + 1) % allImages.length)}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold' }}
                            title="Next Image"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Row */}
                    {allImages.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'thin' }}>
                        {allImages.map((img, idx) => {
                          const isActive = idx === activeImageIndex;
                          const isEmoji = img.length <= 4;
                          return (
                            <div 
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: isActive ? '2px solid var(--accent-indigo)' : '1px solid var(--border-light)', cursor: 'pointer', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{selectedProduct.price}</span>
                      <span className={`badge ${selectedProduct.stock > 0 ? 'badge-approved' : 'badge-rejected'}`}>
                        {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} units)` : 'Sold Out'}
                      </span>
                    </div>
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
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '4px 0 0 0' }}>{selectedProduct.description}</p>
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
    </div>
  );
}