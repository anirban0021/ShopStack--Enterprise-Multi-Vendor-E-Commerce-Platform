import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Check, X, ShieldAlert, AlertCircle, Bell } from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function AdminDashboard({ user, onGoToHome }) {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3000);
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products/pending');
      setPendingProducts(res.data);
    } catch (err) {
      console.error("Failed to load pending products", err);
    }
  };

  const handleApprove = async (id, name = 'Product') => {
    try {
      await axios.put(`http://localhost:8080/api/products/${id}/approve`);
      showFlash('success', `Product "${name}" has been APPROVED and is now active.`);
      fetchPendingProducts();
    } catch (err) {
      showFlash('error', 'Failed to approve product.');
    }
  };

  const approveSelectedProduct = async () => {
    if (!selectedProduct) return;
    await handleApprove(selectedProduct.id, selectedProduct.name);
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const submitRejection = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      showFlash('error', 'Rejection reason is required.');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/products/${selectedProduct.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      showFlash('success', `Product "${selectedProduct.name}" has been REJECTED.`);
      setShowReviewModal(false);
      setSelectedProduct(null);
      setShowRejectionInput(false);
      setRejectionReason('');
      fetchPendingProducts();
    } catch (err) {
      showFlash('error', 'Failed to reject product.');
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

          {/* Notification Bell with Dropdown (left aligned) */}
          <div className="notification-bell-container" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="btn-icon-only" 
              style={{ position: 'relative', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Notifications"
            >
              <Bell size={18} />
              {pendingProducts.length > 0 && (
                <span className="notification-badge">
                  {pendingProducts.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown" style={{ left: 0, right: 'auto' }}>
                <div style={{ padding: '8px 16px 10px 16px', borderBottom: '1px solid var(--border-light)', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Product Submissions ({pendingProducts.length})
                </div>
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px' }}>
                  {pendingProducts.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                      No new product submissions to review
                    </div>
                  ) : (
                    pendingProducts.map(prod => (
                      <div 
                        key={prod.id} 
                        onClick={() => {
                          setSelectedProduct(prod);
                          setShowNotifications(false);
                          setShowRejectionInput(false);
                          setRejectionReason('');
                          setShowReviewModal(true);
                        }}
                        className="dropdown-item-notification"
                      >
                        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-input)', flexShrink: 0 }}>
                          {prod.imageUrl && prod.imageUrl.length > 4 ? (
                            <img src={prod.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ProductIcon name={prod.name} category={prod.category} size={16} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            by Merchant (Vendor #{prod.vendorId || 'SYSTEM'})
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            Admin Security: <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{user.fullName}</strong>
            <span className="badge badge-rejected" style={{ marginLeft: '10px' }}>ADMIN MODE</span>
          </span>
        </div>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column' }}>
        <div className="main-content" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <ShieldAlert size={24} style={{ color: 'var(--accent-rose)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Product Approval Workflow Console</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            The following product listings have been submitted by merchants and require administrative approval before they go live on the ShopStack Marketplace catalog. Click a product name to review detailed specifications.
          </p>

          {pendingProducts.length === 0 ? (
            <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
              <ShieldAlert className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
              <p>Great job! There are no pending product listings awaiting approval.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px' }}>Icon</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Requested Stock</th>
                    <th>Merchant (Vendor ID)</th>
                    <th style={{ textAlign: 'center', width: '220px' }}>Approval Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProducts.map((prod) => (
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
                      <td 
                        className="clickable-product-name"
                        style={{ fontWeight: '600' }}
                        onClick={() => {
                          setSelectedProduct(prod);
                          setShowRejectionInput(false);
                          setRejectionReason('');
                          setShowReviewModal(true);
                        }}
                      >
                        {prod.name}
                      </td>
                      <td>
                        <span className="badge badge-customer">{prod.category}</span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-blue)' }}>₹{prod.price}</td>
                      <td>{prod.stock} units</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          Vendor #{prod.vendorId || 'SYSTEM'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleApprove(prod.id, prod.name)} 
                            className="btn btn-success" 
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(prod);
                              setRejectionReason('');
                              setShowRejectionInput(true);
                              setShowReviewModal(true);
                            }} 
                            className="btn btn-danger" 
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            <X size={14} /> Reject
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
      </div>

      {/* Review Product Details Modal */}
      {showReviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">Review Product Submission</h2>
              <button onClick={() => setShowReviewModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '6px' }}>
              {/* Product Info Section */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', flexShrink: 0 }}>
                  {selectedProduct.imageUrl && selectedProduct.imageUrl.length > 4 ? (
                    <img src={selectedProduct.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={48} />
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProduct.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Brand: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.brand || 'N/A'}</strong></p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-customer">{selectedProduct.category}</span>
                    <span className="badge badge-vendor" style={{ textTransform: 'none' }}>Vendor #{selectedProduct.vendorId || 'SYSTEM'}</span>
                  </div>
                </div>
              </div>

              {/* Price and Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Proposed Price</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-blue)' }}>₹{selectedProduct.price}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Initial Stock</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedProduct.stock} units</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Product Description</h4>
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedProduct.description || 'No description provided.'}
                </div>
              </div>

              {/* Product Gallery Images (if any) */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Image Gallery ({selectedProduct.images.length})</h4>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {selectedProduct.images.map((img, idx) => {
                      const isEmoji = img.length <= 4;
                      return (
                        <div key={idx} style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', flexShrink: 0 }}>
                          {isEmoji ? (
                            <span style={{ fontSize: '24px' }}>{img}</span>
                          ) : (
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reject Action Reason Input Section */}
              {showRejectionInput && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-rose)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejection Reason (Required)</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for the vendor to correct..."
                    className="form-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowRejectionInput(false)} 
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={submitRejection} 
                      className="btn btn-danger"
                      style={{ padding: '6px 16px', fontSize: '12px' }}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!showRejectionInput && (
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                  Close
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowRejectionInput(true);
                    }} 
                    className="btn btn-danger"
                  >
                    <X size={16} /> Reject Listing
                  </button>
                  <button 
                    type="button" 
                    onClick={approveSelectedProduct} 
                    className="btn btn-success"
                  >
                    <Check size={16} /> Approve Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
