import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Calendar, ShoppingBag, Check, X, ShieldAlert, Package, CheckCircle2, RotateCcw, Clock, RefreshCw, Eye } from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function WarehouseDashboard({ user, onGoToHome }) {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [activeView, setActiveView] = useState('dispatch'); // 'dispatch' | 'returns' | 'inventory'
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3000);
  };

  const fetchWarehouseData = async () => {
    try {
      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      setAllOrders(ordersRes.data || []);

      const productsRes = await axios.get('http://localhost:8080/api/products');
      setAllProducts(productsRes.data || []);

      const returnsRes = await axios.get('http://localhost:8080/api/admin/refunds');
      setReturnsList(returnsRes.data || []);
    } catch (err) {
      console.error("Failed to load warehouse data", err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/vendor/orders/${orderId}/status`, { status: newStatus });
      showFlash('success', `Order ${orderId} fulfillment status updated to ${newStatus}.`);
      fetchWarehouseData();
    } catch (err) {
      showFlash('error', 'Failed to update order shipment status.');
    }
  };

  const handleUpdateProductStock = async (productId, newStock) => {
    if (newStock < 0) return;
    try {
      await axios.put(`http://localhost:8080/api/products/${productId}/stock`, { stock: newStock });
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      showFlash('success', 'Stock updated successfully.');
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update stock.');
    }
  };

  const pendingReturns = returnsList.filter(r => r.status === 'PENDING');

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
            Warehouse Staff: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong>
            <span className="badge badge-pending" style={{ marginLeft: '10px' }}>WAREHOUSE OPERATIONS</span>
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-light)', 
        padding: '0 24px', 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={() => setActiveView('dispatch')}
          className={`sidebar-item ${activeView === 'dispatch' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeView === 'dispatch' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Truck size={17} style={{ color: activeView === 'dispatch' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Outbound Dispatch ({allOrders.filter(o => o.status !== 'DELIVERED').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('returns')}
          className={`sidebar-item ${activeView === 'returns' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeView === 'returns' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <RotateCcw size={17} style={{ color: activeView === 'returns' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Inward Returns & QC ({pendingReturns.length})</span>
          {pendingReturns.length > 0 && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '10px', padding: '1px 5px' }}>
              Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveView('inventory')}
          className={`sidebar-item ${activeView === 'inventory' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeView === 'inventory' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Package size={17} style={{ color: activeView === 'inventory' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Catalog Inventory ({allProducts.length})</span>
        </button>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column' }}>
        <div className="main-content" style={{ width: '100%' }}>

          {/* VIEW 1: OUTBOUND DISPATCH */}
          {activeView === 'dispatch' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={22} style={{ color: 'var(--accent-indigo)' }} /> Outbound Packaging & Carrier Dispatch
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Pick, pack, and update shipping progress for incoming customer orders.
                  </p>
                </div>
                <button type="button" onClick={fetchWarehouseData} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {allOrders.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                  <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                  <p>All packaging queues are clear. No pending dispatches!</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Recipient & Address</th>
                        <th>Subtotal</th>
                        <th>Fulfillment Status</th>
                        <th style={{ textAlign: 'center', width: '260px' }}>Dispatch Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} />
                              {ord.date}
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{ord.orderId}</td>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{ord.recipientName || 'Customer'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ord.deliveryAddress || 'Standard Address'}
                            </div>
                          </td>
                          <td style={{ fontWeight: '700' }}>₹{ord.totalAmount}</td>
                          <td>
                            <span className={`badge ${
                              ord.status === 'DELIVERED' ? 'badge-approved' : 
                              ord.status === 'SHIPPED' ? 'badge-pending' : 'badge-customer'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleUpdateStatus(ord.orderId, 'SHIPPED')} 
                                className="btn btn-primary" 
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                disabled={ord.status === 'SHIPPED' || ord.status === 'DELIVERED'}
                              >
                                Mark Shipped
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(ord.orderId, 'DELIVERED')} 
                                className="btn btn-success" 
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                disabled={ord.status === 'DELIVERED'}
                              >
                                Mark Delivered
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

          {/* VIEW 2: INWARD RETURNS & QC */}
          {activeView === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={22} style={{ color: 'var(--accent-teal)' }} /> Inward Returns & Quality Check (QC) Intake
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Inspect returned products against customer reasons and flag verification status for administrative refund clearance.
                  </p>
                </div>
                <button type="button" onClick={fetchWarehouseData} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {returnsList.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                  <RotateCcw className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No customer return packages registered.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Requested</th>
                        <th>Order ID</th>
                        <th>Customer Reason</th>
                        <th>Resolution Choice</th>
                        <th>Refund Value</th>
                        <th>Inspection Stage</th>
                        <th style={{ textAlign: 'center' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnsList.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.requestedAt}</td>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                          <td>
                            <span className="badge badge-customer" style={{ fontSize: '10px' }}>{r.returnReasonCategory || 'DEFECTIVE'}</span>
                            <div style={{ fontSize: '12px', fontWeight: '500', marginTop: '2px' }}>{r.reason}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>{r.resolutionType || 'REFUND'}</span>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>₹{r.amount}</td>
                          <td>
                            {r.status === 'PENDING' ? (
                              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} /> QC Inspection Pending
                              </span>
                            ) : r.status === 'PROCESSED' ? (
                              <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={11} /> Passed & Refunded
                              </span>
                            ) : (
                              <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={11} /> QC Failed / Rejected
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedReturnDetails(r)}
                              className="btn btn-secondary"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: INVENTORY STOCK */}
          {activeView === 'inventory' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={22} style={{ color: 'var(--accent-teal)' }} /> Warehouse Physical Inventory & Restock
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Adjust real-time unit counts and restock resellable returned products into warehouse bins.
                  </p>
                </div>
                <button type="button" onClick={fetchWarehouseData} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '48px' }}>Icon</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Retail Price</th>
                      <th>Available Stock</th>
                      <th>Vendor ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map((prod) => (
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
                              {prod.stock <= 0 ? 'Out of Stock' : 'Low Stock Warning'}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                            {prod.vendorId ? `Merchant #${prod.vendorId}` : 'Seeded / General'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Return Inspection Modal */}
      {selectedReturnDetails && (
        <div className="modal-overlay" onClick={() => setSelectedReturnDetails(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Return Package Inspection Details</h2>
              <button onClick={() => setSelectedReturnDetails(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{selectedReturnDetails.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Return Reason:</span>
                  <strong>{selectedReturnDetails.reason}</strong>
                </div>
                {selectedReturnDetails.customerNotes && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Customer Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{selectedReturnDetails.customerNotes}</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refund Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>₹{selectedReturnDetails.amount}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedReturnDetails(null)} className="btn btn-secondary">
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
