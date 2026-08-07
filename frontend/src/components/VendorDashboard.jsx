import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, AlertTriangle, IndianRupee, Plus, Edit2, 
  Trash2, X, Check, Save, Truck, Calendar, ShoppingBag, Eye 
} from 'lucide-react';
import ProductIcon from './ProductIcon';

const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function VendorDashboard({ user, onGoToHome, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
    topSellingProducts: [],
    productsCount: 0
  });

  const [products, setProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: 'Electronics',
    brand: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '📦',
    images: [],
    vendorId: user.id,
    status: 'PENDING',
    rejectionReason: null
  });

  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchVendorOrders();
  }, []);

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3000);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vendor/${user.id}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/products/vendor/${user.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load vendor products", err);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vendor/${user.id}/orders`);
      setVendorOrders(res.data);
    } catch (err) {
      console.error("Failed to load vendor orders", err);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setProductForm({
      id: null,
      name: '',
      category: 'Electronics',
      brand: '',
      description: '',
      price: '',
      stock: '10',
      imageUrl: '📦',
      images: [],
      vendorId: user.id,
      status: 'PENDING',
      rejectionReason: null
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setModalMode('edit');
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand || '',
      description: prod.description || '',
      price: prod.price,
      stock: prod.stock,
      imageUrl: prod.imageUrl || '📦',
      images: prod.images || [],
      vendorId: user.id,
      status: prod.status,
      rejectionReason: prod.rejectionReason || null
    });
    setShowProductModal(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => {
          const newImages = [...prev.images, reader.result];
          return {
            ...prev,
            images: newImages,
            // If imageUrl is default, set this as primary cover
            imageUrl: prev.imageUrl === '📦' ? reader.result : prev.imageUrl
          };
        });
      };
      reader.readAsDataURL(file);
    });
    // Clear input
    e.target.value = null;
  };

  const handleAddImageUrl = (url) => {
    if (!url.trim()) return;
    setProductForm(prev => {
      const newImages = [...prev.images, url.trim()];
      return {
        ...prev,
        images: newImages,
        imageUrl: prev.imageUrl === '📦' ? url.trim() : prev.imageUrl
      };
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newImageUrl = prev.imageUrl;
      // If we removed the primary image, set primary to the first available image, or fallback to '📦'
      if (prev.imageUrl === prev.images[indexToRemove]) {
        newImageUrl = newImages.length > 0 ? newImages[0] : '📦';
      }
      return {
        ...prev,
        images: newImages,
        imageUrl: newImageUrl
      };
    });
  };

  const handleSetPrimaryImage = (img) => {
    setProductForm(prev => ({
      ...prev,
      imageUrl: img
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || !productForm.stock) {
      showFlash('error', 'Please fill in all required fields.');
      return;
    }

    if (getWordCount(productForm.name) > 50) {
      showFlash('error', 'Product name cannot exceed 50 words.');
      return;
    }

    if (getWordCount(productForm.description) > 500) {
      showFlash('error', 'Product description cannot exceed 500 words.');
      return;
    }

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      // Automatically pend approval for edits or new entries to make workflow functional
      status: 'PENDING' 
    };

    try {
      if (modalMode === 'add') {
        await axios.post('http://localhost:8080/api/products', payload);
        showFlash('success', 'Product listed successfully! Awaiting Admin Approval.');
      } else {
        await axios.put(`http://localhost:8080/api/products/${productForm.id}`, payload);
        showFlash('success', 'Product details updated! Resubmitted for Admin Approval.');
      }
      setShowProductModal(false);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to save product details.');
    }
  };

  const handleUpdateProductStock = async (productId, newStock) => {
    if (newStock < 0) return;
    try {
      await axios.put(`http://localhost:8080/api/products/${productId}/stock`, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      fetchAnalytics();
      showFlash('success', 'Stock updated successfully.');
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update stock.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`);
      showFlash('success', 'Product deleted successfully.');
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', 'Failed to delete product.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/vendor/orders/${orderId}/status`, { status: newStatus });
      showFlash('success', `Order ${orderId} updated to ${newStatus}`);
      fetchVendorOrders();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', 'Failed to update order status');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Toast Flash Alert */}
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.type === 'success' ? 'Success' : 'Error'}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 className="nav-logo" onClick={onGoToHome} style={{ cursor: 'pointer' }}>ShopStack</h1>
          <button onClick={onGoToHome} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>
            Browse Store
          </button>
        </div>

        <div className="nav-right">
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Merchant Seller: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong>
            <span className="badge badge-vendor" style={{ marginLeft: '10px' }}>VENDOR MODE</span>
          </span>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <div 
            onClick={() => setActiveTab('analytics')} 
            className={`sidebar-item ${activeTab === 'analytics' ? 'sidebar-item-active' : ''}`}
          >
            <TrendingUp size={18} /> Sales & Analytics
          </div>
          <div 
            onClick={() => setActiveTab('inventory')} 
            className={`sidebar-item ${activeTab === 'inventory' ? 'sidebar-item-active' : ''}`}
          >
            <Package size={18} /> Inventory Stock ({products.length})
          </div>
          <div 
            onClick={() => setActiveTab('orders')} 
            className={`sidebar-item ${activeTab === 'orders' ? 'sidebar-item-active' : ''}`}
          >
            <ShoppingBag size={18} /> Customer Orders ({vendorOrders.length})
          </div>
        </div>

        {/* Content Area */}
        <div className="main-content">
          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Dashboard Overview</h2>
              
              {/* Analytics Metric Cards */}
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Sales Revenue</span>
                    <IndianRupee size={18} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value">₹{analytics.totalRevenue}</div>
                  <div className="analytics-card-desc">All-time customer sales</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders</span>
                    <ShoppingBag size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value">{analytics.totalOrders}</div>
                  <div className="analytics-card-desc">Distinct order checkouts</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Average Order Value</span>
                    <TrendingUp size={18} style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <div className="analytics-card-value">₹{analytics.averageOrderValue}</div>
                  <div className="analytics-card-desc">Average billing amount</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Low Stock Items</span>
                    <AlertTriangle size={18} style={{ color: analytics.lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: analytics.lowStockCount > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                    {analytics.lowStockCount}
                  </div>
                  <div className="analytics-card-desc">Products with Stock &lt; 5</div>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Top Selling Products</h3>
                {analytics.topSellingProducts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sales data available yet.</p>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th style={{ textAlign: 'right' }}>Total Units Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topSellingProducts.map((p, idx) => (
                          <tr key={idx}>
                            <td>{p.name}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{p.salesCount} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Product Inventory</h2>
                <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={16} /> List New Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="cart-empty-state">
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't listed any products yet. Click the button above to list one!</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px' }}>Icon</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Approval Status</th>
                        <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td style={{ fontSize: '20px' }}>
                            <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden' }}>
                              {prod.imageUrl && prod.imageUrl.length > 4 ? (
                                <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <ProductIcon name={prod.name} category={prod.category} size={16} />
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: '600' }}>{prod.name}</td>
                          <td>
                            <span className="badge badge-customer">{prod.category}</span>
                          </td>
                          <td style={{ fontWeight: '700' }}>₹{prod.price}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                type="button"
                                onClick={() => handleUpdateProductStock(prod.id, prod.stock - 1)}
                                className="btn-icon-only"
                                style={{ padding: '2px', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                disabled={prod.stock <= 0}
                                title="Decrease Stock"
                              >
                                -
                              </button>
                              <span style={{ 
                                minWidth: '40px',
                                textAlign: 'center',
                                fontWeight: prod.stock < 5 ? 'bold' : '600',
                                color: prod.stock < 5 ? 'var(--accent-rose)' : 'inherit'
                              }}>
                                {prod.stock}
                              </span>
                              <button 
                                type="button"
                                onClick={() => handleUpdateProductStock(prod.id, prod.stock + 1)}
                                className="btn-icon-only"
                                style={{ padding: '2px', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Increase Stock"
                              >
                                +
                              </button>
                            </div>
                            {prod.stock < 5 && (
                              <span style={{ fontSize: '10px', display: 'block', color: 'var(--accent-rose)', marginTop: '4px', fontWeight: 'bold' }}>
                                {prod.stock <= 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            )}
                          </td>
                           <td>
                             <span className={`badge ${
                               prod.status === 'APPROVED' ? 'badge-approved' : 
                               prod.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                             }`}>
                               {prod.status}
                             </span>
                             {prod.status === 'REJECTED' && prod.rejectionReason && (
                               <div style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', maxWidth: '180px', lineBreak: 'anywhere' }}>
                                 <strong>Reason:</strong> {prod.rejectionReason}
                                </div>
                             )}
                           </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleOpenEditModal(prod)} 
                                className="btn-icon-only" 
                                title="Edit Product"
                                style={{ padding: '6px' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(prod.id)} 
                                className="btn-icon-only" 
                                title="Delete Product"
                                style={{ padding: '6px', color: 'var(--accent-rose)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Merchant Customer Orders</h2>
              
              {vendorOrders.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No orders received for your items yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total Paid</th>
                        <th>Status</th>
                        <th style={{ width: '160px' }}>Shipping Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorOrders.map((ord) => (
                        <tr key={ord.orderItemId}>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} />
                              {ord.date}
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{ord.orderId}</td>
                          <td style={{ fontWeight: '600' }}>{ord.productName}</td>
                          <td>{ord.quantity}x</td>
                          <td style={{ fontWeight: '700' }}>₹{ord.totalAmount}</td>
                          <td>
                            <span className={`badge ${
                              ord.status === 'DELIVERED' ? 'badge-approved' : 
                              ord.status === 'SHIPPED' ? 'badge-pending' : 'badge-customer'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={ord.status} 
                              onChange={(e) => handleUpdateOrderStatus(ord.orderId, e.target.value)}
                              className="form-select"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'add' ? 'List New Product' : 'Edit Product Details'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '6px' }}>
              {modalMode === 'edit' && productForm.status === 'REJECTED' && (
                <div className="rejection-warning-banner">
                  <div className="rejection-warning-title">
                    <AlertTriangle size={16} /> Listing Rejected
                  </div>
                  <div className="rejection-warning-desc">
                    This product submission was rejected. Reason: <strong>{productForm.rejectionReason || 'No reason provided.'}</strong>.
                    Please make the necessary adjustments and submit changes to resubmit for review.
                  </div>
                </div>
              )}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Product Name</label>
                  <span style={{ fontSize: '12px', color: getWordCount(productForm.name) > 50 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {getWordCount(productForm.name)} / 50 words
                  </span>
                </div>
                <input 
                  type="text" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                  placeholder="e.g. Wireless Sports Earbuds"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input 
                  type="text" 
                  value={productForm.brand} 
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})} 
                  placeholder="e.g. Sony, Nike, L'Oreal"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="form-select"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Decor</option>
                  <option value="Sports">Sports & Outdoors</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Description</label>
                  <span style={{ fontSize: '12px', color: getWordCount(productForm.description) > 500 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {getWordCount(productForm.description)} / 500 words
                  </span>
                </div>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  placeholder="Enter a detailed description of the product..."
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (₹)</label>
                  <input 
                    type="number" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                    placeholder="999"
                    className="form-input" 
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Initial Stock</label>
                  <input 
                    type="number" 
                    value={productForm.stock} 
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})} 
                    placeholder="10"
                    className="form-input" 
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Product Images & Gallery</label>
                
                {/* Image Upload / Input controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {/* File Upload Row */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '13px' }}>
                      <Plus size={16} /> Upload Image File
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    
                    {/* Emoji Select option to quickly add visual icons */}
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddImageUrl(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="form-select"
                      style={{ width: '130px', fontSize: '13px', padding: '7px 10px' }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add Emoji</option>
                      <option value="📦">📦 Box</option>
                      <option value="🎧">🎧 Headphones</option>
                      <option value="⌚">⌚ Smart Watch</option>
                      <option value="💄">💄 Lipstick / Beauty</option>
                      <option value="👗">👗 Dress</option>
                      <option value="👟">👟 Shoes</option>
                      <option value="🕶️">🕶️ Sunglasses</option>
                      <option value="📚">📚 Book</option>
                      <option value="☕">☕ Mug</option>
                      <option value="🧴">🧴 Lotion</option>
                      <option value="🎁">🎁 Gift Box</option>
                      <option value="✨">✨ Sparkles</option>
                    </select>
                  </div>

                  {/* Manual URL Row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      id="manual-image-url"
                      placeholder="Paste Image URL here..." 
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const input = document.getElementById('manual-image-url');
                        if (input && input.value) {
                          handleAddImageUrl(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {productForm.images && productForm.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                    {productForm.images.map((img, idx) => {
                      const isPrimary = productForm.imageUrl === img;
                      const isEmoji = img.length <= 4; // Emojis are short strings
                      return (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', border: isPrimary ? '2px solid var(--accent-indigo)' : '1px solid var(--border-light)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title={isPrimary ? "Primary Cover Image" : "Click to set as primary"}
                          onClick={() => handleSetPrimaryImage(img)}
                        >
                          {/* Image rendering */}
                          {isEmoji ? (
                            <span style={{ fontSize: '24px' }}>{img}</span>
                          ) : (
                            <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}

                          {/* Hover action banner */}
                          {isPrimary && (
                            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--accent-indigo)', color: '#fff', fontSize: '8px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>
                              COVER
                            </div>
                          )}

                          {/* Delete X Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0', fontSize: '9px', fontWeight: 'bold' }}
                            title="Remove Image"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', border: '1px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                    <span>No additional images uploaded. Upload files or paste URLs above.</span>
                    <span style={{ fontSize: '11px' }}>Current Cover Icon/Emoji: <strong>{productForm.imageUrl}</strong></span>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', marginTop: '0', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {modalMode === 'add' ? 'Submit Listing' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
