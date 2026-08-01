import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, ShieldAlert, AlertCircle } from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function AdminDashboard({ user, onGoToHome }) {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingProducts();
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

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/products/${id}/approve`);
      showFlash('success', 'Product listing has been APPROVED and is now active.');
      fetchPendingProducts();
    } catch (err) {
      showFlash('error', 'Failed to approve product.');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/products/${id}/reject`);
      showFlash('success', 'Product listing has been REJECTED.');
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
        </div>

        <div className="nav-right">
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Admin Security: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong>
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
            The following product listings have been submitted by merchants and require administrative approval before they go live on the ShopStack Marketplace catalog.
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
                      <td style={{ fontWeight: '600' }}>{prod.name}</td>
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
                            onClick={() => handleApprove(prod.id)} 
                            className="btn btn-success" 
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(prod.id)} 
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
    </div>
  );
}
