import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Check, X, ShieldAlert, AlertCircle, Bell, Store, Mail, Phone, MapPin, User,
  Activity, Receipt, IndianRupee, RefreshCw, Search, RotateCcw, CheckCircle, 
  Clock, AlertTriangle, Eye, DollarSign, Package, ShieldCheck, ArrowRight,
  Truck, CornerUpLeft, ThumbsUp, ThumbsDown, Users, BarChart3, Settings, 
  FileSpreadsheet, HardDrive, Database, TrendingUp
} from 'lucide-react';
import ProductIcon from './ProductIcon';

export default function AdminDashboard({ user, onGoToHome }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'vendors' | 'products' | 'returns' | 'monitoring' | 'transactions' | 'settlements' | 'system' | 'reports'
  const [pendingProducts, setPendingProducts] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Product Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Dashboard Summary / Overview States
  const [dashboardSummary, setDashboardSummary] = useState({
    totalSalesVolume: 0,
    totalCommission: 0,
    totalPayouts: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    lowStockProducts: 0,
    totalVendors: 0,
    totalCustomers: 0,
    categoryDistribution: {},
    recentOrders: []
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Vendor Management States
  const [vendorsList, setVendorsList] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // System Diagnostics States
  const [systemStatus, setSystemStatus] = useState({
    apiStatus: 'OFFLINE',
    dbStatus: 'OFFLINE',
    razorpayStatus: 'UNKNOWN',
    uptime: '00:00:00',
    processors: 0,
    jvmMaxMemory: 0,
    jvmTotalMemory: 0,
    jvmUsedMemory: 0,
    jvmFreeMemory: 0,
    dbTotalUsers: 0,
    dbTotalProducts: 0,
    dbTotalOrders: 0,
    dbTotalSettlements: 0,
    dbTotalRefunds: 0,
    storageImagesCount: 0,
    storageTotalSizeMB: 0
  });
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);

  // Reports States
  const [reportType, setReportType] = useState('SALES');
  const [reportRecords, setReportRecords] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportSearch, setReportSearch] = useState('');

  // Return & Refund Requests States
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [returnFilter, setReturnFilter] = useState('PENDING'); // 'ALL' | 'PENDING' | 'PROCESSED' | 'REJECTED'
  const [returnSearch, setReturnSearch] = useState('');
  const [selectedReturnCase, setSelectedReturnCase] = useState(null);
  const [targetRejectRefund, setTargetRejectRefund] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isProcessingReturnAction, setIsProcessingReturnAction] = useState(false);

  // Payment Monitoring States
  const [monitoringMetrics, setMonitoringMetrics] = useState({
    totalOrders: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
    totalPaidVolume: 0
  });
  const [monitoringOrders, setMonitoringOrders] = useState([]);
  const [monitoringFilter, setMonitoringFilter] = useState('ALL');
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);

  // Platform Transactions States
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [txFilter, setTxFilter] = useState('ALL');
  const [txSearch, setTxSearch] = useState('');

  // Vendor Settlements States
  const [settlements, setSettlements] = useState([]);
  const [settlementsSummary, setSettlementsSummary] = useState({
    totalGross: 0,
    totalCommission: 0,
    totalNetPayout: 0,
    pendingPayout: 0,
    settledPayout: 0,
    totalSettlementRecords: 0
  });
  const [settlementFilter, setSettlementFilter] = useState('ALL');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [isSettlingId, setIsSettlingId] = useState(null);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);

  // Direct Refund Modal States (Immediate Admin Override)
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const dropdownRef = useRef(null);

  const fetchDashboardSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/dashboard-summary');
      if (res.data) setDashboardSummary(res.data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchVendorsList = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/vendors');
      if (res.data) setVendorsList(res.data);
    } catch (err) {
      console.error("Failed to load vendors stats", err);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const fetchSystemStatus = async () => {
    setIsLoadingSystem(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/system-status');
      if (res.data) setSystemStatus(res.data);
    } catch (err) {
      console.error("Failed to load system status", err);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const fetchReportData = async (type = reportType) => {
    setIsLoadingReport(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/reports/generate?type=${type}`);
      if (res.data) setReportRecords(res.data);
    } catch (err) {
      console.error("Failed to load report data", err);
      setReportRecords([]);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleExportCSV = (type = reportType) => {
    window.open(`http://localhost:8080/api/admin/reports/export?type=${type}`);
    showFlash('success', `${type} Business Report CSV download triggered!`);
  };

  useEffect(() => {
    fetchDashboardSummary();
    fetchPendingProducts();
    fetchReturnRequests();
    fetchMonitoring();
    fetchTransactions();
    fetchSettlements();
    fetchVendorsList();
    fetchSystemStatus();
    fetchReportData(reportType);
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
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3500);
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products/pending');
      setPendingProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load pending products", err);
    }
  };

  const fetchReturnRequests = async () => {
    setIsLoadingReturns(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/refunds');
      setReturnRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load return requests", err);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const fetchMonitoring = async () => {
    setIsLoadingMonitoring(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/payment-monitoring');
      if (res.data?.metrics) {
        setMonitoringMetrics(res.data.metrics);
      }
      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      setMonitoringOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Failed to load payment monitoring overview", err);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const res = await axios.get('http://localhost:8080/api/payment/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchSettlements = async () => {
    setIsLoadingSettlements(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/settlements');
      if (res.data) {
        setSettlements(res.data.settlements || []);
        setSettlementsSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error("Failed to load settlements", err);
    } finally {
      setIsLoadingSettlements(false);
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

  // Return Lifecycle Decisions
  const handleApproveReturn = async (refundId, orderId, amount) => {
    setIsProcessingReturnAction(true);
    try {
      const res = await axios.post(`http://localhost:8080/api/admin/refunds/${refundId}/approve`, {
        adminNotes: 'Quality inspection passed. Item returned in resellable/acceptable condition.'
      });
      showFlash('success', `Return APPROVED & Refund of ₹${amount} Disbursed for Order ${orderId}! (Razorpay Refund ID: ${res.data.razorpayRefundId || res.data.id})`);
      fetchReturnRequests();
      fetchMonitoring();
      fetchTransactions();
      if (selectedReturnCase && selectedReturnCase.id === refundId) {
        setSelectedReturnCase(null);
      }
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to approve return and execute refund.');
    } finally {
      setIsProcessingReturnAction(false);
    }
  };

  const handleOpenRejectReturnModal = (ret) => {
    setTargetRejectRefund(ret);
    setRejectReasonText('Item failed quality check / Damaged by customer / Past return window');
  };

  const submitRejectReturn = async (e) => {
    if (e) e.preventDefault();
    if (!targetRejectRefund) return;
    setIsProcessingReturnAction(true);
    try {
      await axios.post(`http://localhost:8080/api/admin/refunds/${targetRejectRefund.id}/reject`, {
        rejectionReason: rejectReasonText.trim() || 'Return rejected after warehouse quality check.'
      });
      showFlash('success', `Return Request for Order ${targetRejectRefund.orderId} has been REJECTED.`);
      setTargetRejectRefund(null);
      fetchReturnRequests();
      fetchMonitoring();
      fetchTransactions();
      if (selectedReturnCase && selectedReturnCase.id === targetRejectRefund.id) {
        setSelectedReturnCase(null);
      }
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to reject return request.');
    } finally {
      setIsProcessingReturnAction(false);
    }
  };

  const handleMarkSettled = async (settlementId) => {
    setIsSettlingId(settlementId);
    try {
      await axios.put(`http://localhost:8080/api/admin/settlements/${settlementId}/mark-settled`);
      showFlash('success', `Settlement payout #${settlementId} marked as SETTLED.`);
      fetchSettlements();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to mark settlement as settled.');
    } finally {
      setIsSettlingId(null);
    }
  };

  const handleOpenRefundModal = (order) => {
    setRefundTargetOrder(order);
    const remaining = order.refundableBalance !== undefined ? order.refundableBalance : order.totalAmount;
    setRefundAmount(remaining.toString());
    setRefundReason('Direct administrative override refund');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundTargetOrder) return;
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      showFlash('error', 'Please enter a valid refund amount.');
      return;
    }
    setIsProcessingRefund(true);
    try {
      const res = await axios.post('http://localhost:8080/api/payment/refund', {
        orderId: refundTargetOrder.orderId,
        amount: amt,
        reason: refundReason.trim() || 'Admin-initiated direct refund'
      });
      showFlash('success', `Direct refund of ₹${amt} processed. (Refund ID: ${res.data.razorpayRefundId || res.data.id})`);
      setShowRefundModal(false);
      setRefundTargetOrder(null);
      fetchMonitoring();
      fetchTransactions();
      fetchReturnRequests();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to process refund.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleInspectOrderStatus = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/status/${orderId}`);
      setSelectedOrderDetails(res.data);
    } catch (err) {
      showFlash('error', 'Could not fetch status details for ' + orderId);
    }
  };

  const pendingReturnsCount = returnRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="dashboard-container">
      {/* Toast Flash Alert */}
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.type === 'success' ? 'Success' : 'Notice'}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      {/* Header Navbar */}
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 className="nav-logo" onClick={onGoToHome} style={{ cursor: 'pointer' }}>ShopStack</h1>
          <button onClick={onGoToHome} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>
            Browse Store
          </button>

          {/* Notification Bell */}
          <div className="notification-bell-container" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="btn-icon-only" 
              style={{ position: 'relative', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Notifications"
            >
              <Bell size={18} />
              {(pendingProducts.length > 0 || pendingReturnsCount > 0) && (
                <span className="notification-badge">
                  {pendingProducts.length + pendingReturnsCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown" style={{ left: 0, right: 'auto' }}>
                <div style={{ padding: '8px 16px 10px 16px', borderBottom: '1px solid var(--border-light)', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pending Reviews ({pendingProducts.length + pendingReturnsCount})
                </div>
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: '320px' }}>
                  {pendingReturnsCount > 0 && (
                    <div 
                      onClick={() => {
                        setActiveTab('returns');
                        setShowNotifications(false);
                      }}
                      className="dropdown-item-notification"
                      style={{ background: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid var(--border-light)' }}
                    >
                      <RotateCcw size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{pendingReturnsCount} Customer Return(s) Pending QC</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to review inspection & execute refunds</div>
                      </div>
                    </div>
                  )}

                  {pendingProducts.length === 0 && pendingReturnsCount === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                      No new pending tasks or reviews
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
                            by <strong>{prod.vendorName || `Vendor #${prod.vendorId || 'SYSTEM'}`}</strong>
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

      {/* Admin Module Navigation Tabs Bar */}
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
        {/* Marketplace Overview tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('overview'); fetchDashboardSummary(); }}
          className={`sidebar-item ${activeTab === 'overview' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'overview' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <BarChart3 size={17} style={{ color: activeTab === 'overview' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Marketplace Analytics</span>
        </button>

        {/* Vendor Management tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('vendors'); fetchVendorsList(); }}
          className={`sidebar-item ${activeTab === 'vendors' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'vendors' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Users size={17} style={{ color: activeTab === 'vendors' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Vendor Management ({vendorsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`sidebar-item ${activeTab === 'products' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'products' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <ShieldAlert size={17} style={{ color: activeTab === 'products' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Product Approvals ({pendingProducts.length})</span>
        </button>

        {/* Dedicated Returns & Refunds Tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('returns'); fetchReturnRequests(); }}
          className={`sidebar-item ${activeTab === 'returns' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'returns' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <RotateCcw size={17} style={{ color: activeTab === 'returns' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Returns & Refunds</span>
          {pendingReturnsCount > 0 ? (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '10px', padding: '2px 6px', fontWeight: '800' }}>
              {pendingReturnsCount} Pending QC
            </span>
          ) : (
            <span className="badge badge-customer" style={{ fontSize: '10px', padding: '1px 5px' }}>
              {returnRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('monitoring'); fetchMonitoring(); }}
          className={`sidebar-item ${activeTab === 'monitoring' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'monitoring' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Activity size={17} style={{ color: activeTab === 'monitoring' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Order Monitoring</span>
          {monitoringMetrics.failedCount > 0 && (
            <span className="badge badge-rejected" style={{ fontSize: '10px', padding: '1px 5px' }}>
              {monitoringMetrics.failedCount} Failed
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('transactions'); fetchTransactions(); }}
          className={`sidebar-item ${activeTab === 'transactions' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'transactions' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Receipt size={17} style={{ color: activeTab === 'transactions' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Transactions ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('settlements'); fetchSettlements(); }}
          className={`sidebar-item ${activeTab === 'settlements' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'settlements' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <IndianRupee size={17} style={{ color: activeTab === 'settlements' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Commission Management ({settlements.length})</span>
          {settlements.filter(s => s.status === 'PENDING').length > 0 && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '10px', padding: '1px 5px' }}>
              {settlements.filter(s => s.status === 'PENDING').length} Pending
            </span>
          )}
        </button>

        {/* System Monitoring tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('system'); fetchSystemStatus(); }}
          className={`sidebar-item ${activeTab === 'system' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'system' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Settings size={17} style={{ color: activeTab === 'system' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>System Monitoring</span>
        </button>

        {/* Business Reports tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('reports'); fetchReportData(reportType); }}
          className={`sidebar-item ${activeTab === 'reports' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'reports' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <FileSpreadsheet size={17} style={{ color: activeTab === 'reports' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Business Reports</span>
        </button>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column' }}>
        <div className="main-content" style={{ width: '100%' }}>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart3 size={24} style={{ color: 'var(--accent-teal)' }} /> Marketplace Summary & Analytics
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Real-time performance ledger, revenue growth metrics, and catalog statistics.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchDashboardSummary} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
                >
                  <RefreshCw size={13} className={isLoadingSummary ? "spin-animation" : ""} /> Refresh Analytics
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="analytics-grid" style={{ marginBottom: '30px' }}>
                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-teal)', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.03), transparent)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Gross Sales Volume</span>
                    <TrendingUp size={18} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    ₹{dashboardSummary.totalSalesVolume?.toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Verified transactions volume</div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-rose)', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.03), transparent)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Platform Revenue (10%)</span>
                    <DollarSign size={18} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--accent-rose)' }}>
                    ₹{dashboardSummary.totalCommission?.toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Commission fee collected</div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Net Vendor Payouts</span>
                    <IndianRupee size={18} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    ₹{dashboardSummary.totalPayouts?.toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Disbursed & pending transfers</div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders Count</span>
                    <Package size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    {dashboardSummary.totalOrders}
                  </div>
                  <div className="analytics-card-desc">All registered checkouts</div>
                </div>
              </div>

              {/* Secondary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Active Vendors</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{dashboardSummary.totalVendors}</div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '8px', borderRadius: '6px' }}>
                    <Users size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Products</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{dashboardSummary.totalProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-teal)', padding: '8px', borderRadius: '6px' }}>
                    <Package size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: dashboardSummary.pendingProducts > 0 ? '3px solid #f59e0b' : '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Awaiting Approval</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px', color: dashboardSummary.pendingProducts > 0 ? '#f59e0b' : 'inherit' }}>{dashboardSummary.pendingProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '6px' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: dashboardSummary.lowStockProducts > 0 ? '3px solid var(--accent-rose)' : '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock Alert</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px', color: dashboardSummary.lowStockProducts > 0 ? 'var(--accent-rose)' : 'inherit' }}>{dashboardSummary.lowStockProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)', padding: '8px', borderRadius: '6px' }}>
                    <AlertCircle size={16} />
                  </div>
                </div>
              </div>

              {/* Charts & Distribution Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Product Category Share</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.keys(dashboardSummary.categoryDistribution).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No categories registered</p>
                    ) : (
                      Object.entries(dashboardSummary.categoryDistribution).map(([category, count]) => {
                        const total = Math.max(1, dashboardSummary.totalProducts);
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '600' }}>{category}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{count} items ({pct}%)</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-teal), var(--accent-blue))', borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>System Quick Actions</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Frequent administrative workflows console</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setActiveTab('products')} className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={15} /> Review Product Approvals ({pendingProducts.length})
                    </button>
                    <button onClick={() => { setActiveTab('returns'); fetchReturnRequests(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={15} /> Returns & Refund Queue ({pendingReturnsCount} pending)
                    </button>
                    <button onClick={() => { setActiveTab('vendors'); fetchVendorsList(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={15} /> View Vendors Performance
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Marketplace Activity</h3>
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Recipient</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardSummary.recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No orders registered yet</td>
                        </tr>
                      ) : (
                        dashboardSummary.recentOrders.map(ord => (
                          <tr key={ord.orderId}>
                            <td>{ord.date}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{ord.orderId}</td>
                            <td>{ord.recipientName}</td>
                            <td><span className="badge badge-customer">{ord.paymentMethod}</span></td>
                            <td><span className="order-status-badge">{ord.status}</span></td>
                            <td style={{ fontWeight: '800' }}>₹{ord.totalAmount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDOR MANAGEMENT */}
          {activeTab === 'vendors' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} style={{ color: 'var(--accent-teal)' }} /> Vendor Performance & Status Console
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Monitor merchant operations, listed items, cumulative platform sales, and commission contributions.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchVendorsList} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingVendors ? "spin-animation" : ""} /> Refresh Vendors
                </button>
              </div>

              {/* Vendor Search */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search vendors by name, email, address, or vendor code..." 
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                />
              </div>

              {vendorsList.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Users className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No vendors registered on the marketplace yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Vendor ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Vendor Code</th>
                        <th>Listed Items</th>
                        <th>Gross Sales</th>
                        <th>Commission (10%)</th>
                        <th>Net Payout</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorsList
                        .filter(v => {
                          if (!vendorSearch.trim()) return true;
                          const q = vendorSearch.toLowerCase();
                          return (v.fullName?.toLowerCase().includes(q) || 
                                  v.email?.toLowerCase().includes(q) || 
                                  v.address?.toLowerCase().includes(q) || 
                                  v.vendorCode?.toLowerCase().includes(q));
                        })
                        .map(v => (
                          <tr key={v.id}>
                            <td><strong>#{v.id}</strong></td>
                            <td style={{ fontWeight: '600' }}>{v.fullName}</td>
                            <td>{v.email}</td>
                            <td><span className="badge badge-vendor">{v.vendorCode || 'N/A'}</span></td>
                            <td>{v.totalProducts} products</td>
                            <td style={{ fontWeight: '700' }}>₹{v.grossSales?.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--accent-rose)' }}>₹{v.commissionPaid?.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>₹{v.netPayout?.toLocaleString('en-IN')}</td>
                            <td>
                              <button 
                                onClick={() => setSelectedVendorDetail(v)}
                                className="btn btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} /> Inspect Details
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SYSTEM DIAGNOSTICS */}
          {activeTab === 'system' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={22} style={{ color: 'var(--accent-indigo)' }} /> System Infrastructure & Telemetry Diagnostics
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Live tracking of API server JVM status, relational database rows, uploads storage capacity, and payment gateway ping metrics.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchSystemStatus} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingSystem ? "spin-animation" : ""} /> Refresh System Stats
                </button>
              </div>

              {/* Status Indicators Grid */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Spring Boot Server Status</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>ONLINE</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API Server Uptime</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '2px' }}>{systemStatus.uptime}</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>PostgreSQL Connection</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>UP</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Database Host</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>localhost:5432 / shopstack_db</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Razorpay Payment API</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>CONFIGURED</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API Environment Mode</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>Test Mode (rzp_test_...)</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Available Processor Cores</span>
                    <HardDrive size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available JVM CPUs</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '2px' }}>{systemStatus.processors} cores</div>
                  </div>
                </div>
              </div>

              {/* Memory Diagnostics & Storage size */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Memory allocation */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} style={{ color: 'var(--accent-indigo)' }} /> JVM Memory Allocation Diagnostics
                  </h3>
                  
                  {(() => {
                    const total = systemStatus.jvmMaxMemory || 100;
                    const used = systemStatus.jvmUsedMemory || 0;
                    const pct = Math.round((used / total) * 100);
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                          <span>JVM Memory Used</span>
                          <strong>{used} MB of {total} MB ({pct}%)</strong>
                        </div>
                        <div style={{ height: '14px', background: 'var(--bg-input)', borderRadius: '7px', overflow: 'hidden', marginBottom: '16px', display: 'flex' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? 'var(--accent-rose)' : 'linear-gradient(to right, var(--accent-indigo), var(--accent-blue))', borderRadius: '7px', transition: 'width 0.4s ease' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <div>JVM Total Allocated: <strong>{systemStatus.jvmTotalMemory} MB</strong></div>
                          <div>JVM Free Available: <strong>{systemStatus.jvmFreeMemory} MB</strong></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Local Disk Storage diagnostics */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} style={{ color: 'var(--accent-teal)' }} /> Uploads storage capacity status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Local Storage Folder:</span>
                      <strong>uploads/products/</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Saved Image Files:</span>
                      <strong>{systemStatus.storageImagesCount} files</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Space Consumed:</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '15px' }}>{systemStatus.storageTotalSizeMB} MB</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                      * Mitigation system converts Base64 inputs to binary files written directly to disk.
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Telemetry (Row Counts) */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={18} style={{ color: 'var(--accent-blue)' }} /> Database Tables Row Telemetry
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>users</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalUsers}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>products</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalProducts}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>orders</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalOrders}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>settlements</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalSettlements}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>refunds</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalRefunds}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUSINESS REPORTS */}
          {activeTab === 'reports' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={22} style={{ color: 'var(--accent-teal)' }} /> Business Intelligence Reports Console
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Select a report category, preview records on screen, and export cumulative logs as structured CSV files.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => fetchReportData(reportType)} 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    <RefreshCw size={13} className={isLoadingReport ? "spin-animation" : ""} /> Refresh Data
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleExportCSV(reportType)} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderColor: '#10b981' }}
                  >
                    <FileSpreadsheet size={13} /> Export to CSV
                  </button>
                </div>
              </div>

              {/* Selector Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '220px', marginBottom: 0 }}>
                  <label className="form-label">Select Report Category</label>
                  <select 
                    value={reportType}
                    onChange={(e) => { setReportType(e.target.value); fetchReportData(e.target.value); }}
                    className="form-input"
                  >
                    <option value="SALES">Sales & Checkouts Report</option>
                    <option value="VENDORS">Merchants Performance Report</option>
                    <option value="INVENTORY">Inventory Valuation Report</option>
                    <option value="REFUNDS">Returns & Refund QC Report</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: '2', minWidth: '300px', marginBottom: 0 }}>
                  <label className="form-label">Quick Search / Filter Results</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Filter records showing in report..." 
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Reports Preview Table */}
              {reportRecords.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <FileSpreadsheet className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No records found matching the report parameters.</p>
                </div>
              ) : (
                <div className="table-container">
                  {reportType === 'SALES' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order ID</th>
                          <th>Recipient</th>
                          <th>Method</th>
                          <th>Payment Status</th>
                          <th>Fulfillment</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.orderId?.toLowerCase().includes(q) || r.recipientName?.toLowerCase().includes(q) || r.paymentStatus?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.orderId}>
                              <td>{r.date}</td>
                              <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                              <td>{r.recipientName}</td>
                              <td>{r.paymentMethod}</td>
                              <td><span className={`badge ${r.paymentStatus === 'PAID' ? 'badge-approved' : 'badge-pending'}`}>{r.paymentStatus}</span></td>
                              <td><span className="order-status-badge">{r.status}</span></td>
                              <td style={{ fontWeight: '800' }}>₹{r.totalAmount}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'VENDORS' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Vendor ID</th>
                          <th>Merchant Name</th>
                          <th>Email Address</th>
                          <th>Vendor Code</th>
                          <th>Listed Products</th>
                          <th>Cumulative Gross</th>
                          <th>Commission Contributed</th>
                          <th>Net Vendor Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.vendorCode?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontWeight: '600' }}>{r.fullName}</td>
                              <td>{r.email}</td>
                              <td><span className="badge badge-vendor">{r.vendorCode}</span></td>
                              <td>{r.totalProducts} items</td>
                              <td style={{ fontWeight: '700' }}>₹{r.grossSales?.toLocaleString('en-IN')}</td>
                              <td style={{ color: 'var(--accent-rose)' }}>-₹{r.commissionPaid?.toLocaleString('en-IN')}</td>
                              <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>₹{r.netPayout?.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'INVENTORY' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Brand</th>
                          <th>Fulfillment stock</th>
                          <th>Base Price</th>
                          <th>Final Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.name?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q) || r.brand?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontWeight: '600', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.name}>{r.name}</td>
                              <td><span className="badge badge-customer">{r.category}</span></td>
                              <td>{r.brand || 'N/A'}</td>
                              <td style={{ fontWeight: 'bold', color: r.stock <= 5 ? 'var(--accent-rose)' : 'inherit' }}>{r.stock} units</td>
                              <td>₹{r.price}</td>
                              <td style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>₹{r.finalPrice}</td>
                              <td><span className={`badge ${r.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}`}>{r.status}</span></td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'REFUNDS' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Refund ID</th>
                          <th>Order ID</th>
                          <th>Date Requested</th>
                          <th>Return Reason</th>
                          <th>Resolution</th>
                          <th>Stage</th>
                          <th>Refund status</th>
                          <th>Refund Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.orderId?.toLowerCase().includes(q) || r.returnReasonCategory?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                              <td>{r.requestedAt}</td>
                              <td><span className="badge badge-customer">{r.returnReasonCategory}</span></td>
                              <td>{r.resolutionType}</td>
                              <td><span className="badge badge-vendor">{r.returnStage}</span></td>
                              <td><span className={`badge ${r.status === 'PROCESSED' ? 'badge-approved' : 'badge-pending'}`}>{r.status}</span></td>
                              <td style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{r.amount}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PRODUCT APPROVALS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                        <th>Regular Price</th>
                        <th>Discount</th>
                        <th>Final Price</th>
                        <th>Stock</th>
                        <th>Merchant (Vendor Details)</th>
                        <th style={{ textAlign: 'center', width: '220px' }}>Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map((prod) => {
                        const disc = Number(prod.discountPercentage) || 0;
                        const finalP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
                        return (
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
                            <td style={{ color: disc > 0 ? '#94a3b8' : 'inherit', textDecoration: disc > 0 ? 'line-through' : 'none' }}>
                              ₹{Number(prod.price).toLocaleString('en-IN')}
                            </td>
                            <td>
                              {disc > 0 ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                  color: '#ffffff', 
                                  fontWeight: '800', 
                                  fontSize: '11px', 
                                  padding: '3px 8px', 
                                  borderRadius: '4px', 
                                  display: 'inline-block'
                                }}>
                                  {disc}% OFF
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</span>
                              )}
                            </td>
                            <td style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>
                              ₹{Number(finalP).toLocaleString('en-IN')}
                            </td>
                            <td>{prod.stock} units</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Store size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                  <span>{prod.vendorName || `Vendor #${prod.vendorId || 'SYSTEM'}`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                  <span>ID: #{prod.vendorId || 'N/A'}</span>
                                  {prod.vendorCode && (
                                    <span className="badge badge-vendor" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                      Code: {prod.vendorCode}
                                    </span>
                                  )}
                                </div>
                              </div>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RETURNS & REFUNDS GOVERNANCE (BUY → RETURN → REFUND LIFECYCLE) */}
          {activeTab === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={22} style={{ color: 'var(--accent-teal)' }} /> Customer Returns & Quality Check Governance
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Customer Lifecycle: BUY → RETURN → QUALITY INSPECTION → REFUND DISBURSAL. Admin verifies returned item condition before executing Razorpay payment reversal.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchReturnRequests} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingReturns ? "spin-animation" : ""} /> Refresh Returns
                </button>
              </div>

              {/* Return Metrics Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', background: pendingReturnsCount > 0 ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending QC & Decision</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    {pendingReturnsCount}
                  </div>
                  <div className="analytics-card-desc">Awaiting warehouse verification</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Approved & Disbursed</span>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#10b981' }}>
                    {returnRequests.filter(r => r.status === 'PROCESSED').length}
                  </div>
                  <div className="analytics-card-desc">QC passed & refunded via Razorpay</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Rejected Returns</span>
                    <X size={16} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#ef4444' }}>
                    {returnRequests.filter(r => r.status === 'REJECTED').length}
                  </div>
                  <div className="analytics-card-desc">Failed quality check / Ineligible</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-indigo)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Refund Volume</span>
                    <IndianRupee size={16} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-indigo)' }}>
                    ₹{returnRequests.filter(r => r.status === 'PROCESSED').reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Reversed back to customers</div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Reason, or Customer Name..." 
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['PENDING', 'ALL', 'PROCESSED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReturnFilter(st)}
                      className={`btn ${returnFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '6px 14px', height: '38px' }}
                    >
                      {st === 'PENDING' ? `Pending QC (${pendingReturnsCount})` : 
                       st === 'ALL' ? `All Requests (${returnRequests.length})` :
                       st === 'PROCESSED' ? `Approved & Refunded (${returnRequests.filter(r => r.status === 'PROCESSED').length})` :
                       `Rejected (${returnRequests.filter(r => r.status === 'REJECTED').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Requests Table */}
              {returnRequests.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <RotateCcw className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No customer return requests submitted yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Requested</th>
                        <th>Order ID</th>
                        <th>Customer Details</th>
                        <th>Reason Category</th>
                        <th>Resolution</th>
                        <th>Refund Amount</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center', width: '220px' }}>Inspection & Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRequests
                        .filter(r => {
                          if (returnFilter !== 'ALL' && r.status !== returnFilter) return false;
                          if (returnSearch.trim()) {
                            const q = returnSearch.toLowerCase();
                            const matchId = r.orderId?.toLowerCase().includes(q);
                            const matchReason = r.reason?.toLowerCase().includes(q);
                            const matchName = r.recipientName?.toLowerCase().includes(q);
                            return matchId || matchReason || matchName;
                          }
                          return true;
                        })
                        .map((r) => {
                          const isPending = r.status === 'PENDING';
                          const isProcessed = r.status === 'PROCESSED';
                          const isRejected = r.status === 'REJECTED';

                          return (
                            <tr key={r.id} style={{ background: isPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {r.requestedAt}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{r.orderId}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{r.recipientName || `User #${r.userId || 'GUEST'}`}</div>
                                {r.recipientPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.recipientPhone}</div>}
                              </td>
                              <td>
                                <span className={`badge ${
                                  r.returnReasonCategory === 'DEFECTIVE_DAMAGED' ? 'badge-rejected' :
                                  r.returnReasonCategory === 'WRONG_ITEM' ? 'badge-vendor' :
                                  r.returnReasonCategory === 'SIZE_FIT_ISSUE' ? 'badge-customer' : 'badge-pending'
                                }`} style={{ fontSize: '10px' }}>
                                  {r.returnReasonCategory || 'DEFECTIVE'}
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>
                                  {r.reason}
                                </div>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>
                                  {r.resolutionType || 'REFUND'}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{r.amount}</strong>
                              </td>
                              <td>
                                {isPending && (
                                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={11} /> PENDING QC
                                  </span>
                                )}
                                {isProcessed && (
                                  <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={11} /> APPROVED & REFUNDED
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={11} /> REJECTED
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isPending ? (
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveReturn(r.id, r.orderId, r.amount)}
                                      disabled={isProcessingReturnAction}
                                      className="btn btn-success"
                                      style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      title="Accept Return & Disburse Refund (Razorpay Test Mode)"
                                    >
                                      <Check size={12} /> Accept & Refund
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRejectReturnModal(r)}
                                      disabled={isProcessingReturnAction}
                                      className="btn btn-danger"
                                      style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      title="Reject Return Request (QC Failed)"
                                    >
                                      <X size={12} /> Reject
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReturnCase(r)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Eye size={12} /> View Audit
                                  </button>
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

          {/* TAB 3: PAYMENT STATUS MONITORING */}
          {activeTab === 'monitoring' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={22} style={{ color: 'var(--accent-teal)' }} /> Live Payment Status Monitoring
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Real-time transaction health console with Razorpay verification tracking and failed attempt detection.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchMonitoring} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingMonitoring ? "spin-animation" : ""} /> Refresh Status
                </button>
              </div>

              {/* Status Overview Metric Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders</span>
                    <Package size={16} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {monitoringMetrics.totalOrders}
                  </div>
                  <div className="analytics-card-desc">All platform checkouts</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Paid Volume</span>
                    <DollarSign size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#10b981' }}>
                    ₹{monitoringMetrics.totalPaidVolume?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">{monitoringMetrics.paidCount} verified orders</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending / Return QC</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    {monitoringMetrics.pendingCount}
                  </div>
                  <div className="analytics-card-desc">COD / Return requests</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', background: monitoringMetrics.failedCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title" style={{ color: monitoringMetrics.failedCount > 0 ? '#ef4444' : 'inherit' }}>Failed / Cancelled</span>
                    <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#ef4444' }}>
                    {monitoringMetrics.failedCount}
                  </div>
                  <div className="analytics-card-desc">Detected payment failures</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Refunded Orders</span>
                    <RotateCcw size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#8b5cf6' }}>
                    {monitoringMetrics.refundedCount}
                  </div>
                  <div className="analytics-card-desc">Full / partial refunds</div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Recipient Name, or Phone..." 
                    value={monitoringSearch}
                    onChange={(e) => setMonitoringSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMonitoringFilter(st)}
                      className={`btn ${monitoringFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '6px 14px', height: '38px' }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Monitoring Table */}
              {monitoringOrders.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Activity className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No orders registered on the platform yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Customer / Recipient</th>
                        <th>Payment Method</th>
                        <th>Payment ID</th>
                        <th>Total Amount</th>
                        <th>Payment Status</th>
                        <th>Fulfillment</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoringOrders
                        .filter(ord => {
                          const pStat = ord.paymentStatus || 'PENDING';
                          if (monitoringFilter !== 'ALL') {
                            if (monitoringFilter === 'REFUNDED') {
                              if (pStat !== 'REFUNDED' && pStat !== 'PARTIALLY_REFUNDED') return false;
                            } else if (pStat !== monitoringFilter) {
                              return false;
                            }
                          }
                          if (monitoringSearch.trim()) {
                            const q = monitoringSearch.toLowerCase();
                            const matchId = ord.orderId?.toLowerCase().includes(q);
                            const matchName = ord.recipientName?.toLowerCase().includes(q);
                            const matchPhone = ord.recipientPhone?.toLowerCase().includes(q);
                            return matchId || matchName || matchPhone;
                          }
                          return true;
                        })
                        .map((ord) => {
                          const pStat = ord.paymentStatus || 'PENDING';
                          const isPaid = pStat === 'PAID';
                          const isFailed = pStat === 'FAILED';
                          const isRefundPending = pStat === 'REFUND_PENDING';
                          const isRefunded = pStat === 'REFUNDED' || pStat === 'PARTIALLY_REFUNDED';

                          return (
                            <tr key={ord.id || ord.orderId} style={{ background: isFailed ? 'rgba(239, 68, 68, 0.04)' : isRefundPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{ord.date}</td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{ord.orderId}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{ord.recipientName || `User #${ord.userId || 'GUEST'}`}</div>
                                {ord.recipientPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.recipientPhone}</div>}
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  {ord.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {ord.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {ord.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{ord.totalAmount}</strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={11} strokeWidth={3} /> PAID
                                  </span>
                                )}
                                {isRefundPending && (
                                  <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    <Clock size={11} /> RETURN PENDING
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={11} strokeWidth={3} /> FAILED
                                  </span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <RotateCcw size={11} /> {pStat}
                                  </span>
                                )}
                                {!isPaid && !isRefundPending && !isFailed && !isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    {pStat}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="order-status-badge" style={{ fontSize: '11px' }}>
                                  {ord.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleInspectOrderStatus(ord.orderId)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                    title="View Live Status Details"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  {(isPaid || pStat === 'PARTIALLY_REFUNDED') && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRefundModal(ord)}
                                      className="btn btn-secondary"
                                      style={{ fontSize: '11px', padding: '4px 8px', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                      title="Issue Direct Refund"
                                    >
                                      <RotateCcw size={13} />
                                    </button>
                                  )}
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

          {/* TAB 4: PLATFORM TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={22} style={{ color: 'var(--accent-teal)' }} /> Platform-Wide Transactions Audit
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Unified ledger of all checkouts, Razorpay signatures, payment IDs, and refund logs.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchTransactions} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingTransactions ? "spin-animation" : ""} /> Refresh Ledger
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Razorpay Payment ID, or User ID..." 
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTxFilter(st)}
                      className={`btn ${txFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '6px 14px', height: '38px' }}
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
                  <p>No transaction records found on the platform.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>User ID</th>
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
                          if (txFilter !== 'ALL') {
                            if (txFilter === 'REFUNDED') {
                              if (tx.paymentStatus !== 'REFUNDED' && tx.paymentStatus !== 'PARTIALLY_REFUNDED') return false;
                            } else if (tx.paymentStatus !== txFilter) {
                              return false;
                            }
                          }
                          if (txSearch.trim()) {
                            const q = txSearch.toLowerCase();
                            const matchOrderId = tx.orderId?.toLowerCase().includes(q);
                            const matchPaymentId = tx.razorpayPaymentId?.toLowerCase().includes(q);
                            const matchUserId = tx.userId ? tx.userId.toString().includes(q) : false;
                            return matchOrderId || matchPaymentId || matchUserId;
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
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{tx.orderId}</strong>
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  User #{tx.userId || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>
                                  {tx.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {tx.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {tx.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{tx.totalAmount}</strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px' }}>PAID</span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>REFUNDED</span>
                                )}
                                {isPartiallyRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>PARTIAL REFUND</span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px' }}>FAILED</span>
                                )}
                                {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>{tx.paymentStatus}</span>
                                )}
                              </td>
                              <td>
                                {tx.totalRefunded > 0 ? (
                                  <div style={{ fontSize: '12px', color: '#c084fc' }}>
                                    <strong>₹{tx.totalRefunded}</strong> ({tx.refunds?.length} log{tx.refunds?.length === 1 ? '' : 's'})
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {(isPaid || isPartiallyRefunded) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRefundModal(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                                  >
                                    <RotateCcw size={12} /> Refund
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

          {/* TAB 5: VENDOR SETTLEMENTS */}
          {activeTab === 'settlements' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IndianRupee size={22} style={{ color: 'var(--accent-teal)' }} /> Vendor Settlement & Payout Ledger
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Automatic 10% platform commission ledger with manual test-mode settlement reconciliation.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchSettlements} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingSettlements ? "spin-animation" : ""} /> Refresh Settlements
                </button>
              </div>

              {/* Settlement Summary Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Gross Volume</span>
                    <DollarSign size={16} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{settlementsSummary.totalGross?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">All vendor item sales</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-rose)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Platform Revenue (10%)</span>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-rose)' }}>
                    ₹{settlementsSummary.totalCommission?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">Platform fee collected</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending Payouts</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    ₹{settlementsSummary.pendingPayout?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">Awaiting payout approval</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Settled Payouts</span>
                    <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-emerald)' }}>
                    ₹{settlementsSummary.settledPayout?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">Transferred to vendors</div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Vendor ID or Order ID..." 
                    value={settlementSearch}
                    onChange={(e) => setSettlementSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'PENDING', 'SETTLED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSettlementFilter(st)}
                      className={`btn ${settlementFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '6px 14px', height: '38px' }}
                    >
                      {st === 'ALL' ? `All (${settlements.length})` : 
                       st === 'PENDING' ? `Pending (${settlements.filter(s => s.status === 'PENDING').length})` : 
                       `Settled (${settlements.filter(s => s.status === 'SETTLED').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlements Table */}
              {settlements.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <IndianRupee className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No vendor settlement records found. Settlements are created when paid orders are placed.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Vendor</th>
                        <th>Order ID</th>
                        <th>Product Name</th>
                        <th>Gross Sale</th>
                        <th>Commission (10%)</th>
                        <th>Net Vendor Payout</th>
                        <th>Status</th>
                        <th>Settled At</th>
                        <th style={{ textAlign: 'center' }}>Payout Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements
                        .filter(s => {
                          if (settlementFilter !== 'ALL' && s.status !== settlementFilter) return false;
                          if (settlementSearch.trim()) {
                            const q = settlementSearch.toLowerCase();
                            const matchVendor = s.vendorId ? s.vendorId.toString().includes(q) : false;
                            const matchOrder = s.orderId?.toLowerCase().includes(q);
                            return matchVendor || matchOrder;
                          }
                          return true;
                        })
                        .map((s) => {
                          const isSettled = s.status === 'SETTLED';

                          return (
                            <tr key={s.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.createdAt}</td>
                              <td>
                                <span className="badge badge-vendor" style={{ fontSize: '11px' }}>
                                  Vendor #{s.vendorId}
                                </span>
                              </td>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                                {s.orderId}
                              </td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '500' }}>
                                {s.productName || `Item #${s.orderItemId}`}
                              </td>
                              <td style={{ fontWeight: '700' }}>₹{s.grossAmount}</td>
                              <td style={{ color: 'var(--accent-rose)', fontSize: '13px' }}>
                                -₹{s.commissionAmount} ({s.commissionPercentage}%)
                              </td>
                              <td style={{ fontWeight: '800', color: 'var(--accent-emerald)', fontSize: '14px' }}>
                                ₹{s.netPayoutAmount}
                              </td>
                              <td>
                                {isSettled ? (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={11} /> SETTLED
                                  </span>
                                ) : (
                                  <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <Clock size={11} /> PENDING
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {s.settledAt || 'Pending transfer'}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {!isSettled ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSettled(s.id)}
                                    disabled={isSettlingId === s.id}
                                    className="btn btn-success"
                                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Check size={12} /> {isSettlingId === s.id ? "Settling..." : "Mark Settled"}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                                    ✓ Disbursed
                                  </span>
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
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div 
                  style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', flexShrink: 0 }}
                >
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
                    <span className="badge badge-vendor" style={{ textTransform: 'none' }}>
                      Vendor #{selectedProduct.vendorId || 'SYSTEM'} {selectedProduct.vendorName ? `(${selectedProduct.vendorName})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Details */}
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Store size={18} style={{ color: 'var(--accent-blue)' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', margin: 0 }}>
                    Merchant / Vendor Details
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Vendor Name</span>
                    <div><strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.vendorName || `Vendor #${selectedProduct.vendorId || 'SYSTEM'}`}</strong></div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Vendor ID</span>
                    <div><strong style={{ color: 'var(--text-primary)' }}>#{selectedProduct.vendorId || 'N/A'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Price, Discount and Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Regular Price</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: selectedProduct.discountPercentage > 0 ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: selectedProduct.discountPercentage > 0 ? 'line-through' : 'none' }}>
                    ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Final Price</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-teal)' }}>
                    ₹{Number(selectedProduct.finalPrice || selectedProduct.price).toLocaleString('en-IN')}
                  </span>
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
                    onClick={() => setShowRejectionInput(true)} 
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

      {/* Return Case Inspection Modal */}
      {selectedReturnCase && (
        <div className="modal-overlay" onClick={() => setSelectedReturnCase(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Return Lifecycle Audit</h2>
              </div>
              <button onClick={() => setSelectedReturnCase(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{selectedReturnCase.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <strong>{selectedReturnCase.recipientName || `User #${selectedReturnCase.userId || 'N/A'}`} ({selectedReturnCase.recipientPhone || 'No phone'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Return Reason Category:</span>
                  <span className="badge badge-customer">{selectedReturnCase.returnReasonCategory || 'DEFECTIVE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reason Stated:</span>
                  <strong>{selectedReturnCase.reason}</strong>
                </div>
                {selectedReturnCase.customerNotes && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Customer Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{selectedReturnCase.customerNotes}</p>
                  </div>
                )}
                {selectedReturnCase.adminNotes && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Admin/QC Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: '#a78bfa' }}>{selectedReturnCase.adminNotes}</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refund Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '16px' }}>₹{selectedReturnCase.amount}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedReturnCase(null)} className="btn btn-secondary">
                  Close
                </button>
                {selectedReturnCase.status === 'PENDING' && (
                  <button 
                    type="button" 
                    onClick={() => handleApproveReturn(selectedReturnCase.id, selectedReturnCase.orderId, selectedReturnCase.amount)}
                    className="btn btn-success"
                  >
                    <Check size={14} /> Accept & Disburse Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Return Modal */}
      {targetRejectRefund && (
        <div className="modal-overlay" onClick={() => setTargetRejectRefund(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={20} style={{ color: 'var(--accent-rose)' }} />
                <h2 className="modal-title">Reject Return Request</h2>
              </div>
              <button onClick={() => setTargetRejectRefund(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRejectReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>Order: <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{targetRejectRefund.orderId}</strong></div>
                <div>Amount: <strong style={{ color: 'var(--accent-emerald)' }}>₹{targetRejectRefund.amount}</strong></div>
                <div>Customer Reason: <strong>{targetRejectRefund.reason}</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label">Rejection Reason / Inspection Notes *</label>
                <textarea 
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Explain why the return was rejected (e.g. Physical damage caused by customer, missing tags, return window expired)..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setTargetRejectRefund(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={isProcessingReturnAction || !rejectReasonText.trim()}>
                  {isProcessingReturnAction ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Order Payment Inspection Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Live Payment & Order Status</h2>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{selectedOrderDetails.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <span className="badge badge-customer">{selectedOrderDetails.paymentMethod || 'RAZORPAY'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                  <span className={`badge ${selectedOrderDetails.paymentStatus === 'PAID' ? 'badge-approved' : selectedOrderDetails.paymentStatus === 'FAILED' ? 'badge-rejected' : 'badge-pending'}`}>
                    {selectedOrderDetails.paymentStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fulfillment Status:</span>
                  <span className="order-status-badge">{selectedOrderDetails.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Razorpay Payment ID:</span>
                  <code style={{ color: 'var(--accent-teal)' }}>{selectedOrderDetails.razorpayPaymentId || 'N/A'}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '15px' }}>₹{selectedOrderDetails.totalAmount}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedOrderDetails(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Direct Refund Modal */}
      {showRefundModal && refundTargetOrder && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: '#a78bfa' }} />
                <h2 className="modal-title">Administrative Direct Refund</h2>
              </div>
              <button onClick={() => setShowRefundModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{refundTargetOrder.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Original Amount:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{refundTargetOrder.totalAmount}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Refund Amount (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="1"
                  max={refundTargetOrder.refundableBalance !== undefined ? refundTargetOrder.refundableBalance : refundTargetOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter amount to refund"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Reason *</label>
                <textarea 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '70px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRefundModal(false)} 
                  className="btn btn-secondary"
                  disabled={isProcessingRefund}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' }}
                  disabled={isProcessingRefund || !refundAmount}
                >
                  {isProcessingRefund ? "Executing Razorpay Refund..." : "Authorize Direct Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Profile Inspection Modal */}
      {selectedVendorDetail && (
        <div className="modal-overlay" onClick={() => setSelectedVendorDetail(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Vendor Operation Details</h2>
              </div>
              <button onClick={() => setSelectedVendorDetail(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vendor Name:</span>
                  <strong>{selectedVendorDetail.fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                  <strong>{selectedVendorDetail.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                  <strong>{selectedVendorDetail.phone || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Operational Code:</span>
                  <span className="badge badge-vendor" style={{ fontWeight: 'bold' }}>{selectedVendorDetail.vendorCode || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fulfillment Status:</span>
                  <span className="badge badge-approved">ACTIVE MERCHANT</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Products Listed:</span>
                  <strong>{selectedVendorDetail.totalProducts} items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cumulative Sales:</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>₹{selectedVendorDetail.grossSales?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Platform Commission (10%):</span>
                  <strong style={{ color: 'var(--accent-rose)' }}>-₹{selectedVendorDetail.commissionPaid?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vendor Net Payout:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '15px' }}>₹{selectedVendorDetail.netPayout?.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pending Settlements:</span>
                  <strong style={{ color: '#f59e0b' }}>{selectedVendorDetail.pendingPayoutsCount} records</strong>
                </div>
              </div>

              {selectedVendorDetail.address && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Registered Warehouse Address:</span>
                  <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {selectedVendorDetail.address}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedVendorDetail(null)} className="btn btn-secondary">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
