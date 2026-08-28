import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, Calendar, ShoppingBag, Check, X, ShieldAlert, Package, CheckCircle2, 
  RotateCcw, Clock, RefreshCw, Eye, Plus, Edit, PlusCircle, Trash, Box, 
  MapPin, CheckCircle, BarChart3, AlertCircle, PlayCircle, Loader2
} from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function WarehouseDashboard({ user, onGoToHome }) {
  const [warehouses, setWarehouses] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Tabs: 'analytics' | 'fulfillment' | 'warehouses' | 'inventory' | 'returns'
  const [activeTab, setActiveTab] = useState('analytics');
  // Fulfillment Pipeline Sub-tabs: 'allocate' | 'pick' | 'pack' | 'ship'
  const [fulfillmentSubTab, setFulfillmentSubTab] = useState('allocate');
  
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);

  // Modals / Form States
  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [showEditWhModal, setShowEditWhModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showManualAllocModal, setShowManualAllocModal] = useState(false);
  const [showQcModal, setShowQcModal] = useState(false);

  const [whForm, setWhForm] = useState({ name: '', code: '', address: '', city: '', active: true });
  const [editingWhId, setEditingWhId] = useState(null);
  const [restockForm, setRestockForm] = useState({ warehouseId: '', productId: '', quantity: 10 });
  const [manualAllocForm, setManualAllocForm] = useState({ orderId: '', orderItemId: '', warehouseId: '', quantity: 1, maxQty: 1 });
  const [selectedProductForAlloc, setSelectedProductForAlloc] = useState(null);
  const [qcForm, setQcForm] = useState({ refundId: null, passed: true, restockOption: 'RESELLABLE', warehouseId: '', notes: '', warehouseInspectionImage: '' });

  // Temporary local states for packing & dispatch
  const [packagingSelections, setPackagingSelections] = useState({});
  const [courierSelections, setCourierSelections] = useState({});
  const [trackingNumbers, setTrackingNumbers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const showFlash = (type, text) => {
    setFlashMessage({ type, text });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const whRes = await axios.get('http://localhost:8080/api/warehouses');
      setWarehouses(whRes.data || []);

      const invRes = await axios.get('http://localhost:8080/api/warehouses/inventory/all');
      setInventories(invRes.data || []);

      const allocRes = await axios.get('http://localhost:8080/api/warehouses/allocations');
      setAllocations(allocRes.data || []);

      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      setAllOrders(ordersRes.data || []);

      const productsRes = await axios.get('http://localhost:8080/api/products');
      setProducts(productsRes.data || []);

      const returnsRes = await axios.get('http://localhost:8080/api/admin/refunds');
      setReturnsList(returnsRes.data || []);

      const analyticsRes = await axios.get('http://localhost:8080/api/warehouses/analytics');
      setAnalytics(analyticsRes.data || {});
    } catch (err) {
      console.error("Failed to load warehouse data", err);
      showFlash('error', 'Error loading warehouse workspace data.');
    } finally {
      setLoading(false);
    }
  };

  // --- WAREHOUSE MANAGEMENT ACTIONS ---
  
  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/warehouses', whForm);
      showFlash('success', `Warehouse ${whForm.name} created successfully.`);
      setShowAddWhModal(false);
      setWhForm({ name: '', code: '', address: '', city: '', active: true });
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to create warehouse.');
    }
  };

  const handleEditWarehouse = (wh) => {
    setEditingWhId(wh.id);
    setWhForm({ name: wh.name, code: wh.code, address: wh.address, city: wh.city, active: wh.active });
    setShowEditWhModal(true);
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/warehouses/${editingWhId}`, whForm);
      showFlash('success', 'Warehouse details updated successfully.');
      setShowEditWhModal(false);
      setEditingWhId(null);
      setWhForm({ name: '', code: '', address: '', city: '', active: true });
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to update warehouse.');
    }
  };

  const handleToggleWarehouseStatus = async (wh) => {
    try {
      await axios.put(`http://localhost:8080/api/warehouses/${wh.id}`, {
        ...wh,
        active: !wh.active
      });
      showFlash('success', `Warehouse ${wh.name} is now ${!wh.active ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to change warehouse status.');
    }
  };

  // --- INVENTORY RESTOCK ACTIONS ---

  const handleRestockStock = async (e) => {
    e.preventDefault();
    if (!restockForm.warehouseId || !restockForm.productId || restockForm.quantity <= 0) {
      showFlash('error', 'Please fill in all restocking details.');
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/warehouses/${restockForm.warehouseId}/inventory`, {
        productId: restockForm.productId,
        quantity: restockForm.quantity
      });
      showFlash('success', 'Stock replenished successfully.');
      setShowRestockModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to restock inventory.');
    }
  };

  const handleUpdateInventoryDirect = async (invId, newQty) => {
    if (newQty < 0) return;
    try {
      await axios.put(`http://localhost:8080/api/warehouses/inventory/${invId}`, {
        quantity: newQty
      });
      showFlash('success', 'Inventory level adjusted.');
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to adjust stock level.');
    }
  };

  // --- ALLOCATION WORKFLOW ACTIONS ---

  const handleAutoAllocate = async (orderId) => {
    try {
      await axios.post(`http://localhost:8080/api/warehouses/allocations/allocate/${orderId}`);
      showFlash('success', `Order ${orderId} automatically allocated to warehouses based on stock.`);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data?.message || 'Automatic stock allocation failed.');
    }
  };

  const openManualAllocation = (ordId, item) => {
    // Find product information
    const prod = products.find(p => p.id === item.productId);
    setSelectedProductForAlloc(prod);

    setManualAllocForm({
      orderId: ordId,
      orderItemId: item.id,
      warehouseId: warehouses.length > 0 ? warehouses[0].id.toString() : '',
      quantity: item.quantity,
      maxQty: item.quantity
    });
    setShowManualAllocModal(true);
  };

  const handleManualAllocate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/warehouses/allocations/manual', {
        orderId: manualAllocForm.orderId,
        orderItemId: manualAllocForm.orderItemId,
        warehouseId: manualAllocForm.warehouseId,
        quantity: manualAllocForm.quantity
      });
      showFlash('success', 'Stock manual allocation recorded.');
      setShowManualAllocModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Manual stock allocation failed.');
    }
  };

  // --- WORKFLOW WORKFLOW LIFECYCLE (PICK, PACK, SHIP) ---

  const handleAdvanceStatus = async (allocId, nextStatus, payloadDetails = {}) => {
    try {
      await axios.put(`http://localhost:8080/api/warehouses/allocations/${allocId}/status`, {
        status: nextStatus,
        ...payloadDetails
      });
      showFlash('success', `Allocation status updated to ${nextStatus}.`);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update workflow step.');
    }
  };

  const handlePickAllocation = (allocId) => {
    handleAdvanceStatus(allocId, 'PICKED');
  };

  const handlePackAllocation = (allocId) => {
    const pkg = packagingSelections[allocId] || 'Standard Box';
    handleAdvanceStatus(allocId, 'PACKED', { packagingType: pkg });
  };

  const handleShipAllocation = (allocId) => {
    const courier = courierSelections[allocId] || 'ShopStack Express';
    const tracking = trackingMap(allocId) || 'SS-' + Math.floor(100000 + Math.random() * 900000);
    handleAdvanceStatus(allocId, 'READY_FOR_SHIPMENT', {
      courierPartner: courier,
      trackingNumber: tracking
    });
  };

  const trackingMap = (allocId) => {
    return trackingNumbers[allocId] || '';
  };

  const handleQcSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/payment/refunds/${qcForm.refundId}/qc-inspection`, {
        passed: qcForm.passed,
        restockOption: qcForm.restockOption,
        warehouseId: qcForm.passed && qcForm.restockOption === 'RESELLABLE' ? qcForm.warehouseId : null,
        notes: qcForm.notes,
        warehouseInspectionImage: qcForm.warehouseInspectionImage
      });
      showFlash('success', 'QC verification log saved successfully.');
      setShowQcModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to submit QC details.');
    }
  };

  const handleReceivePackage = async (refundId) => {
    try {
      await axios.put(`http://localhost:8080/api/payment/refunds/${refundId}/receive`);
      showFlash('success', 'Return package marked as received.');
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to mark package as received.');
    }
  };

  const pendingReturns = returnsList.filter(r => r.status === 'PENDING');

  // Compute pending allocations or partially allocated items
  const getAllocationStatus = (orderId, orderItems) => {
    const orderAllocs = allocations.filter(a => a.orderId === orderId);
    if (orderAllocs.length === 0) return { label: 'Unallocated', class: 'badge-rejected', code: 0 };
    
    // Check total quantities
    const totalAllocatedQty = orderAllocs.stream ? 0 : orderAllocs.reduce((sum, a) => sum + a.quantity, 0);
    const totalRequiredQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const hasUnallocated = orderAllocs.some(a => a.status === 'UNALLOCATED');
    
    if (hasUnallocated) {
      return { label: 'Stock Pending / Unallocated', class: 'badge-pending', code: 1 };
    }
    if (totalAllocatedQty < totalRequiredQty) {
      return { label: 'Partially Allocated', class: 'badge-pending', code: 1 };
    }
    return { label: 'Fully Allocated', class: 'badge-approved', code: 2 };
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
            Warehouse Supervisor: <strong style={{ color: 'var(--text-primary)' }}>{user.fullName}</strong>
            <span className="badge badge-pending" style={{ marginLeft: '10px' }}>LOGISTICS HUB</span>
          </span>
          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Reload
          </button>
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
          onClick={() => setActiveTab('analytics')}
          className={`sidebar-item ${activeTab === 'analytics' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <BarChart3 size={17} style={{ color: activeTab === 'analytics' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Dashboard Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fulfillment')}
          className={`sidebar-item ${activeTab === 'fulfillment' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'fulfillment' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <Truck size={17} style={{ color: activeTab === 'fulfillment' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Fulfillment Workflow Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`sidebar-item ${activeTab === 'warehouses' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'warehouses' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <MapPin size={17} style={{ color: activeTab === 'warehouses' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Warehouse Bins ({warehouses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`sidebar-item ${activeTab === 'inventory' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'inventory' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <Package size={17} style={{ color: activeTab === 'inventory' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Inventory Audit ({inventories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`sidebar-item ${activeTab === 'returns' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'returns' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <RotateCcw size={17} style={{ color: activeTab === 'returns' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Inward Returns QC ({pendingReturns.length})</span>
        </button>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column', padding: '24px' }}>
        <div className="main-content" style={{ width: '100%' }}>

          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>Fulfillment Logistics Center</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                Operational dashboard and key efficiency metrics for physical warehouse capacities and order queues.
              </p>

              {/* Analytics Cards Grid */}
              <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="metric-card">
                  <div className="flex-between">
                    <span className="metric-label">Operational Warehouses</span>
                    <MapPin size={18} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="metric-value">{analytics.totalWarehouses || 0}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {analytics.activeWarehouses || 0} active, { (analytics.totalWarehouses || 0) - (analytics.activeWarehouses || 0) } inactive
                  </span>
                </div>

                <div className="metric-card">
                  <div className="flex-between">
                    <span className="metric-label">Physical Stock Stored</span>
                    <Package size={18} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="metric-value">{analytics.totalPhysicalStock || 0} units</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total items residing physically inside warehouse bins.
                  </span>
                </div>

                <div className="metric-card">
                  <div className="flex-between">
                    <span className="metric-label">Allocated/Reserved Stock</span>
                    <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
                  </div>
                  <div className="metric-value">{analytics.totalAllocatedStock || 0} units</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Items reserved for confirmed orders being packaged.
                  </span>
                </div>

                <div className="metric-card">
                  <div className="flex-between">
                    <span className="metric-label">Available for Sale</span>
                    <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>{analytics.totalAvailableStock || 0} units</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Unreserved warehouse stock ready for retail order matching.
                  </span>
                </div>
              </div>

              {/* Status Breakdown Tracker */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Pipeline Distribution Tracker</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1. STOCK ALLOCATED</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0', color: 'var(--accent-blue)' }}>
                      {analytics.statusBreakdown?.ALLOCATED || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Awaiting Pick list check</div>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2. PRODUCT PICKED</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0', color: 'var(--accent-teal)' }}>
                      {analytics.statusBreakdown?.PICKED || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending carton packing</div>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>3. ORDER PACKED</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0', color: 'var(--accent-indigo)' }}>
                      {analytics.statusBreakdown?.PACKED || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending courier shipment</div>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>4. READY FOR SHIPMENT</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0', color: 'var(--accent-emerald)' }}>
                      {analytics.statusBreakdown?.READY_FOR_SHIPMENT || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deducted from physically stored</div>
                  </div>
                </div>
              </div>

              {/* Warehouse Occupancy Capacities */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Operational Warehouse Capacities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analytics.warehouseDetails && analytics.warehouseDetails.map((wh) => {
                    const totalWhStock = wh.physicalStock || 0;
                    const limit = 500; // Simulated capacity threshold
                    const pct = Math.min(100, Math.round((totalWhStock / limit) * 100));
                    return (
                      <div key={wh.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                        <div className="flex-between" style={{ marginBottom: '6px' }}>
                          <div>
                            <strong style={{ fontSize: '14px' }}>{wh.name} ({wh.code})</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                              Available Stock: <strong style={{ color: 'var(--accent-emerald)' }}>{wh.availableStock}</strong> | Reserved: <strong>{wh.allocatedStock}</strong>
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{totalWhStock} / {limit} Units ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${pct}%`, 
                            height: '100%', 
                            background: pct > 85 ? 'var(--accent-rose)' : pct > 60 ? 'var(--accent-amber)' : 'var(--accent-indigo)', 
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULFILLMENT WORKFLOW PIPELINE */}
          {activeTab === 'fulfillment' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Logistics Fulfillment Pipeline</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Track, allocate, pack and ship incoming customer orders through physical fulfillment phases.
                  </p>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '20px', gap: '4px' }}>
                <button 
                  onClick={() => setFulfillmentSubTab('allocate')}
                  className={`btn ${fulfillmentSubTab === 'allocate' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  1. Warehouse Allocation ({allOrders.filter(o => o.status === 'CONFIRMED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('pick')}
                  className={`btn ${fulfillmentSubTab === 'pick' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  2. Picking Queue ({allocations.filter(a => a.status === 'ALLOCATED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('pack')}
                  className={`btn ${fulfillmentSubTab === 'pack' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  3. Packing Queue ({allocations.filter(a => a.status === 'PICKED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('ship')}
                  className={`btn ${fulfillmentSubTab === 'ship' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  4. Carrier Dispatch ({allocations.filter(a => a.status === 'PACKED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('transit')}
                  className={`btn ${fulfillmentSubTab === 'transit' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  5. In Transit ({allocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').length})
                </button>
              </div>

              {/* SUBTAB 1: WAREHOUSE ALLOCATION */}
              {fulfillmentSubTab === 'allocate' && (
                <div>
                  {allOrders.filter(o => o.status === 'CONFIRMED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>All active order items have been allocated! No pending orders in queue.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order Details</th>
                            <th>Recipients</th>
                            <th>Items Placed</th>
                            <th>Allocation Status</th>
                            <th style={{ textAlign: 'center', width: '280px' }}>Allocation Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allOrders.filter(o => o.status === 'CONFIRMED').map((ord) => {
                            const allocState = getAllocationStatus(ord.orderId, ord.items || []);
                            return (
                              <tr key={ord.id}>
                                <td>
                                  <div style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{ord.orderId}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.date}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{ord.recipientName}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{ord.deliveryAddress}</div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {ord.items && ord.items.map((item) => (
                                      <div key={item.id} style={{ fontSize: '12px' }}>
                                        {item.productName} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${allocState.class}`}>{allocState.label}</span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                      onClick={() => handleAutoAllocate(ord.orderId)} 
                                      className="btn btn-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}
                                    >
                                      <PlayCircle size={13} /> Auto
                                    </button>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {ord.items && ord.items.map((item) => (
                                        <button
                                          key={item.id}
                                          onClick={() => openManualAllocation(ord.orderId, item)}
                                          className="btn btn-primary"
                                          style={{ padding: '4px 8px', fontSize: '10px' }}
                                        >
                                          Manual: {item.productName.substring(0, 12)}...
                                        </button>
                                      ))}
                                    </div>
                                  </div>
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

              {/* SUBTAB 2: PICKING QUEUE */}
              {fulfillmentSubTab === 'pick' && (
                <div>
                  {allocations.filter(a => a.status === 'ALLOCATED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>Picking queues are clear. No pending items to pull from bins.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product to Pick</th>
                            <th>Target Warehouse</th>
                            <th>Quantity</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.filter(a => a.status === 'ALLOCATED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td style={{ fontWeight: '600' }}>{alloc.productName}</td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)' }}>{alloc.warehouseName}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code: {alloc.warehouseCode}</div>
                              </td>
                              <td style={{ fontSize: '14px', fontWeight: 'bold' }}>{alloc.quantity} units</td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handlePickAllocation(alloc.id)} 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <CheckCircle size={14} /> Confirm Pick
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

              {/* SUBTAB 3: PACKING QUEUE */}
              {fulfillmentSubTab === 'pack' && (
                <div>
                  {allocations.filter(a => a.status === 'PICKED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>Packaging tables are clear. No picked items require boxing.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product Name</th>
                            <th>Warehouse Source</th>
                            <th>Quantity</th>
                            <th>Carton Style Selection</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.filter(a => a.status === 'PICKED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td style={{ fontWeight: '600' }}>{alloc.productName}</td>
                              <td>{alloc.warehouseName}</td>
                              <td style={{ fontWeight: 'bold' }}>{alloc.quantity}</td>
                              <td>
                                <select 
                                  value={packagingSelections[alloc.id] || 'Standard Box'}
                                  onChange={(e) => setPackagingSelections({
                                    ...packagingSelections,
                                    [alloc.id]: e.target.value
                                  })}
                                  className="form-select"
                                  style={{ padding: '6px', fontSize: '12px', width: '160px' }}
                                >
                                  <option value="Standard Box">📦 Standard Box</option>
                                  <option value="Bubble Wrap Envelope">✉️ Bubble Wrap Envelope</option>
                                  <option value="Eco-friendly Cardboard">🌱 Eco-friendly Cardboard</option>
                                  <option value="Fragile Wood Crate">🪵 Fragile Wood Crate</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handlePackAllocation(alloc.id)} 
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <Box size={14} /> Pack & Containerize
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

              {/* SUBTAB 4: CARRIER DISPATCH */}
              {fulfillmentSubTab === 'ship' && (
                <div>
                  {allocations.filter(a => a.status === 'PACKED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>All packed items have been dispatched to shipping carriers.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product & Quantity</th>
                            <th>Packaging</th>
                            <th>Carrier Partner</th>
                            <th>Awb/Tracking Reference</th>
                            <th style={{ textAlign: 'center' }}>Dispatch Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.filter(a => a.status === 'PACKED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td>{alloc.productName} <span style={{ color: 'var(--text-secondary)' }}>x{alloc.quantity}</span></td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{alloc.packagingType || 'Standard Box'}</span>
                              </td>
                              <td>
                                <select
                                  value={courierSelections[alloc.id] || 'ShopStack Express'}
                                  onChange={(e) => setCourierSelections({
                                    ...courierSelections,
                                    [alloc.id]: e.target.value
                                  })}
                                  className="form-select"
                                  style={{ padding: '6px', fontSize: '12px', width: '150px' }}
                                >
                                  <option value="ShopStack Express">ShopStack Express</option>
                                  <option value="BlueDart Logistics">BlueDart Logistics</option>
                                  <option value="Delhivery Courier">Delhivery Courier</option>
                                  <option value="DHL Express International">DHL Express</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <input 
                                    type="text"
                                    placeholder="Enter Tracking AWB"
                                    value={trackingNumbers[alloc.id] || ''}
                                    onChange={(e) => setTrackingNumbers({
                                      ...trackingNumbers,
                                      [alloc.id]: e.target.value
                                    })}
                                    className="form-input"
                                    style={{ padding: '6px', fontSize: '12px', width: '150px' }}
                                  />
                                  <button
                                    onClick={() => {
                                      const genTracking = 'AWB-' + Math.floor(10000000 + Math.random() * 90000000);
                                      setTrackingNumbers({ ...trackingNumbers, [alloc.id]: genTracking });
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                  >
                                    Gen
                                  </button>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleShipAllocation(alloc.id)} 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <Truck size={14} /> Ready for Shipment
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

              {/* SUBTAB 5: IN TRANSIT QUEUE */}
              {fulfillmentSubTab === 'transit' && (
                <div>
                  {allocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>No packages currently in transit.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product & Quantity</th>
                            <th>Packaging</th>
                            <th>Carrier & AWB</th>
                            <th style={{ textAlign: 'center' }}>Delivery Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td>{alloc.productName} <span style={{ color: 'var(--text-secondary)' }}>x{alloc.quantity}</span></td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{alloc.packagingType || 'Standard Box'}</span>
                              </td>
                              <td>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{alloc.courierPartner}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AWB: <code style={{ color: 'var(--accent-teal)' }}>{alloc.trackingNumber}</code></div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleAdvanceStatus(alloc.id, 'DELIVERED')} 
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto', background: 'var(--accent-teal)', border: 'none', color: '#fff' }}
                                >
                                  <CheckCircle size={14} /> Mark Delivered
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

            </div>
          )}

          {/* TAB 3: WAREHOUSE BINS CRUD */}
          {activeTab === 'warehouses' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Warehouse Storage Locations</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Configure physical structures and toggle status mappings of logistically operational warehouses.
                  </p>
                </div>
                <button onClick={() => setShowAddWhModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Register New Bin
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Warehouse Name</th>
                      <th>Location City</th>
                      <th>Street Address</th>
                      <th>Logistics Status</th>
                      <th style={{ textAlign: 'center', width: '180px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((wh) => (
                      <tr key={wh.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{wh.code}</td>
                        <td style={{ fontWeight: '600' }}>{wh.name}</td>
                        <td>{wh.city}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{wh.address}</td>
                        <td>
                          <span className={`badge ${wh.active ? 'badge-approved' : 'badge-rejected'}`}>
                            {wh.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditWarehouse(wh)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Edit size={12} /> Edit
                            </button>
                            <button 
                              onClick={() => handleToggleWarehouseStatus(wh)} 
                              className={`btn ${wh.active ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              {wh.active ? 'Disable' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY AUDIT & replenishment */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Warehouse Inventory Audit Ledger</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Track exact unit bins, view reservations, and manually replenish catalog stocks directly.
                  </p>
                </div>
                <button onClick={() => setShowRestockModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={16} /> Replenish Stock
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Warehouse</th>
                      <th>Product Stored</th>
                      <th>Category</th>
                      <th>Physical Stock</th>
                      <th>Allocated / Reserved</th>
                      <th>Available stock</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Direct Adjust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventories.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.warehouseName}</strong>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Code: {inv.warehouseCode}</div>
                        </td>
                        <td style={{ fontWeight: '600' }}>{inv.productName}</td>
                        <td>
                          <span className="badge badge-customer">{inv.productCategory}</span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{inv.quantity}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{inv.allocated}</td>
                        <td style={{ color: inv.available < 5 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 'bold' }}>
                          {inv.available}
                          {inv.available < 5 && (
                            <span style={{ fontSize: '9px', display: 'block', color: 'var(--accent-rose)' }}>
                              Low Units Alert
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleUpdateInventoryDirect(inv.id, inv.quantity - 1)}
                              className="btn btn-secondary" 
                              style={{ padding: '2px 8px', fontSize: '12px' }}
                              disabled={inv.quantity <= inv.allocated}
                              title="Decrease physical stock (limited by allocation)"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleUpdateInventoryDirect(inv.id, inv.quantity + 1)}
                              className="btn btn-secondary" 
                              style={{ padding: '2px 8px', fontSize: '12px' }}
                              title="Increase physical stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INWARD RETURNS & QC */}
          {activeTab === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={22} style={{ color: 'var(--accent-indigo)' }} /> Inward Returns & Quality Check (QC) Intake
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Inspect returned products against customer reasons and flag verification status for administrative refund clearance.
                  </p>
                </div>
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
                              r.returnStage === 'QC_PASSED' ? (
                                <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={11} /> QC Passed
                                </span>
                              ) : r.returnStage === 'QC_FAILED' ? (
                                <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <X size={11} /> QC Failed
                                </span>
                              ) : r.returnStage === 'ITEM_RETURNED' ? (
                                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} /> QC Inspection Pending
                                </span>
                              ) : (
                                <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                  <Clock size={11} /> Awaiting Package Pickup
                                </span>
                              )
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
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedReturnDetails(r)}
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                <Eye size={12} /> Details
                              </button>
                              {r.status === 'PENDING' && (r.returnStage === 'REQUESTED' || r.returnStage === 'VENDOR_APPROVED' || r.returnStage === 'VENDOR_DISPUTED') && (
                                <button
                                  type="button"
                                  onClick={() => handleReceivePackage(r.id)}
                                  className="btn btn-success"
                                  style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center' }}
                                >
                                  Receive Package
                                </button>
                              )}
                              {r.status === 'PENDING' && r.returnStage === 'ITEM_RETURNED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQcForm({
                                      refundId: r.id,
                                      passed: true,
                                      restockOption: 'RESELLABLE',
                                      warehouseId: warehouses.length > 0 ? warehouses[0].id.toString() : '',
                                      notes: '',
                                      warehouseInspectionImage: ''
                                    });
                                    setShowQcModal(true);
                                  }}
                                  className="btn btn-primary"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Inspect QC
                                </button>
                              )}
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

        </div>
      </div>

      {/* MODAL 1: REGISTER WAREHOUSE */}
      {showAddWhModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Register Warehouse Storage Bin</h2>
              <button onClick={() => setShowAddWhModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateWarehouse}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label">Warehouse Name</label>
                  <input 
                    type="text" 
                    required 
                    value={whForm.name}
                    onChange={(e) => setWhForm({...whForm, name: e.target.value})}
                    placeholder="e.g. Mumbai Main Hub" 
                    className="form-input" 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Location Code</label>
                    <input 
                      type="text" 
                      required 
                      value={whForm.code}
                      onChange={(e) => setWhForm({...whForm, code: e.target.value})}
                      placeholder="e.g. WH-MUM-01" 
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      required 
                      value={whForm.city}
                      onChange={(e) => setWhForm({...whForm, city: e.target.value})}
                      placeholder="e.g. Mumbai" 
                      className="form-input" 
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Full Street Address</label>
                  <input 
                    type="text" 
                    required 
                    value={whForm.address}
                    onChange={(e) => setWhForm({...whForm, address: e.target.value})}
                    placeholder="e.g. Sector-7 Industrial Lane" 
                    className="form-input" 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddWhModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Bin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT WAREHOUSE */}
      {showEditWhModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Warehouse Bin Details</h2>
              <button onClick={() => setShowEditWhModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateWarehouse}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label">Warehouse Name</label>
                  <input 
                    type="text" 
                    required 
                    value={whForm.name}
                    onChange={(e) => setWhForm({...whForm, name: e.target.value})}
                    className="form-input" 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label">Location Code</label>
                    <input 
                      type="text" 
                      required 
                      value={whForm.code}
                      onChange={(e) => setWhForm({...whForm, code: e.target.value})}
                      className="form-input" 
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      required 
                      value={whForm.city}
                      onChange={(e) => setWhForm({...whForm, city: e.target.value})}
                      className="form-input" 
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Full Street Address</label>
                  <input 
                    type="text" 
                    required 
                    value={whForm.address}
                    onChange={(e) => setWhForm({...whForm, address: e.target.value})}
                    className="form-input" 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input 
                    type="checkbox" 
                    id="editWhActive" 
                    checked={whForm.active}
                    onChange={(e) => setWhForm({...whForm, active: e.target.checked})}
                  />
                  <label htmlFor="editWhActive" style={{ fontSize: '13px', fontWeight: '500' }}>Operational Active Status</label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowEditWhModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVENTORY REPLENISHMENT */}
      {showRestockModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Replenish Product Warehouse Inventory</h2>
              <button onClick={() => setShowRestockModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleRestockStock}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label">Select Storage Destination</label>
                  <select 
                    required
                    value={restockForm.warehouseId}
                    onChange={(e) => setRestockForm({...restockForm, warehouseId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Choose Warehouse --</option>
                    {warehouses.filter(w => w.active).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Select Catalog Product</label>
                  <select 
                    required
                    value={restockForm.productId}
                    onChange={(e) => setRestockForm({...restockForm, productId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Replenishment Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={restockForm.quantity}
                    onChange={(e) => setRestockForm({...restockForm, quantity: parseInt(e.target.value) || 0})}
                    className="form-input" 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowRestockModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Replenish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANUAL ALLOCATION FOR AN ORDER ITEM */}
      {showManualAllocModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Manual Warehouse Stock Allocation</h2>
              <button onClick={() => setShowManualAllocModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleManualAllocate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                  <div><strong>Order:</strong> {manualAllocForm.orderId}</div>
                  <div style={{ marginTop: '4px' }}>
                    <strong>Product:</strong> {selectedProductForAlloc?.name} (ID: {selectedProductForAlloc?.id})
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <strong>Requested Quantity:</strong> <strong style={{ color: 'var(--accent-indigo)' }}>{manualAllocForm.maxQty} units</strong>
                  </div>
                </div>

                <div>
                  <label className="form-label">Choose Warehouse Bin with Stock</label>
                  <select 
                    required
                    value={manualAllocForm.warehouseId}
                    onChange={(e) => setManualAllocForm({...manualAllocForm, warehouseId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Choose Warehouse --</option>
                    {warehouses.filter(w => w.active).map(w => {
                      const warehouseStock = inventories.find(i => i.warehouseId === w.id && i.productId === selectedProductForAlloc?.id);
                      const available = warehouseStock ? warehouseStock.available : 0;
                      return (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code}) -- Stock Available: {available} units
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="form-label">Quantity to Allocate</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    max={manualAllocForm.maxQty}
                    value={manualAllocForm.quantity}
                    onChange={(e) => setManualAllocForm({...manualAllocForm, quantity: Math.min(manualAllocForm.maxQty, parseInt(e.target.value) || 0)})}
                    className="form-input" 
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Cannot exceed requested amount of {manualAllocForm.maxQty}.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowManualAllocModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* MODAL 5: WAREHOUSE QC & RESTOCK */}
      {showQcModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Warehouse Return QC & Inventory Restock</h2>
              <button onClick={() => setShowQcModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleQcSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>QC Inspection Outcome</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="qcPassed" 
                        checked={qcForm.passed === true}
                        onChange={() => setQcForm({...qcForm, passed: true})}
                      />
                      Passed QC Verification
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="qcPassed" 
                        checked={qcForm.passed === false}
                        onChange={() => setQcForm({...qcForm, passed: false})}
                      />
                      Failed QC / Rejected
                    </label>
                  </div>
                </div>

                {qcForm.passed && (
                  <>
                    <div>
                      <label className="form-label">Restocking Category Choice</label>
                      <select 
                        required
                        value={qcForm.restockOption}
                        onChange={(e) => setQcForm({...qcForm, restockOption: e.target.value})}
                        className="form-select"
                      >
                        <option value="RESELLABLE">Resellable Item (Restock to Bin)</option>
                        <option value="DAMAGED">Damaged / Write-off (Do Not Restock)</option>
                      </select>
                    </div>

                    {qcForm.restockOption === 'RESELLABLE' && (
                      <div>
                        <label className="form-label">Restock Destination Warehouse Bin</label>
                        <select 
                          required
                          value={qcForm.warehouseId}
                          onChange={(e) => setQcForm({...qcForm, warehouseId: e.target.value})}
                          className="form-select"
                        >
                          <option value="">-- Choose Warehouse --</option>
                          {warehouses.filter(w => w.active).map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="form-label">QC Observations / Notes</label>
                  <textarea 
                    required 
                    placeholder="e.g. Item package unopened, original tags attached." 
                    value={qcForm.notes}
                    onChange={(e) => setQcForm({...qcForm, notes: e.target.value})}
                    className="form-input"
                    style={{ minHeight: '60px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label className="form-label">QC Verification Photo URL (Optional)</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/inspected-item.jpg"
                    value={qcForm.warehouseInspectionImage}
                    onChange={(e) => setQcForm({...qcForm, warehouseInspectionImage: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowQcModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit QC Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
