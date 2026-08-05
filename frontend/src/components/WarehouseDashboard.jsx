import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Calendar, ShoppingBag, Check, X, ShieldAlert, Package, CheckCircle2 } from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function WarehouseDashboard({ user, onGoToHome }) {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3000);
  };

  const fetchOrdersAndProducts = async () => {
    try {
      // Fetch all customer orders
      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      setAllOrders(ordersRes.data);

      const productsRes = await axios.get('http://localhost:8080/api/products');
      setAllProducts(productsRes.data);
    } catch (err) {
      console.error("Failed to load warehouse data", err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/vendor/orders/${orderId}/status`, { status: newStatus });
      showFlash('success', `Order ${orderId} dispatch status updated to ${newStatus}.`);
      fetchOrdersAndProducts();
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
            <span className="badge badge-pending" style={{ marginLeft: '10px' }}>WAREHOUSE STAFF</span>
          </span>
        </div>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column' }}>
        {/* Main section */}
        <div className="main-content" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Truck size={24} style={{ color: 'var(--accent-indigo)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Warehouse Fulfillment & Shipping Control</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Manage product logistics, dispatch confirmed shipments, and monitor total inventory stock status across the platform.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Orders Requiring Dispatch</h3>
          {allOrders.length === 0 ? (
            <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px', marginBottom: '32px' }}>
              <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
              <p>All packaging queues are clear. No pending dispatches!</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginBottom: '32px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Subtotal Value</th>
                    <th>Fulfillment Status</th>
                    <th style={{ textAlign: 'center', width: '280px' }}>Dispatch Action</th>
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
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleUpdateStatus(ord.orderId, 'SHIPPED')} 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            disabled={ord.status === 'SHIPPED' || ord.status === 'DELIVERED'}
                          >
                            Mark Shipped
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(ord.orderId, 'DELIVERED')} 
                            className="btn btn-success" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
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

          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Current Catalog Stock Inventory</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>Icon</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Retail Price</th>
                  <th>Warehouse Stock</th>
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
      </div>
    </div>
  );
}
