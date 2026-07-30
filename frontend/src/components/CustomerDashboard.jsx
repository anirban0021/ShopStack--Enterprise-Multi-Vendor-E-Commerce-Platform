import React, { useState } from 'react';
import axios from 'axios';

export default function CustomerDashboard({ user, orders = [], onUpdateUser, onLogout, onGoToHome }) {
  const [profile, setProfile] = useState({
    id: user?.id,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'CUSTOMER'
  });

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  const [isEditing, setIsEditing] = useState(false);
  const [flash, setFlash] = useState({ type: '', title: '', text: '' });

  const showToast = (type, title, text) => {
    setFlash({ type, title, text });
    setTimeout(() => {
      setFlash({ type: '', title: '', text: '' });
    }, 3000);
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

  const handleToggleRole = async (targetRole) => {
    if (!profile.id) {
      showToast('error', 'Action Failed', 'User ID is missing. Please log in again.');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:8080/api/auth/customer/${profile.id}/role`, {
        role: targetRole
      });
      
      setProfile(res.data);
      onUpdateUser(res.data);
      
      if (targetRole === 'VENDOR') {
        showToast('success', 'Switched to Vendor View! 🏪', 'You now have selling privileges on ShopStack.');
      } else {
        showToast('success', 'Switched to Customer View! 🛒', 'You are now browsing as a standard Customer.');
      }
    } catch (err) {
      showToast('error', 'Switch Failed', err.response?.data || 'Failed to switch account role.');
    }
  };

  return (
    <div style={styles.container}>
      {flash.text && (
        <div style={flash.type === 'success' ? styles.toastSuccess : styles.toastError}>
          <div style={styles.toastIcon}>{flash.type === 'success' ? '✔' : '✖'}</div>
          <div>
            <strong>{flash.title}</strong>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>{flash.text}</div>
          </div>
        </div>
      )}

      <div style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={styles.logo}>ShopStack</h1>
          <button onClick={onGoToHome} style={styles.backHomeBtn}>
            ← Back to Store
          </button>
        </div>

        <div style={styles.navRight}>
          <span>Hello, <strong>{profile.fullName}</strong> ({profile.role})</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.dashboard}>
        {/* Interactive Sidebar Tabs */}
        <div style={styles.sidebar}>
          <div 
            onClick={() => setActiveTab('profile')} 
            style={activeTab === 'profile' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
          >
            👤 Profile & Address
          </div>
          <div 
            onClick={() => setActiveTab('orders')} 
            style={activeTab === 'orders' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
          >
            📦 My Orders ({orders.length})
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === 'profile' ? (
            <>
              {profile.role === 'CUSTOMER' ? (
                <div style={styles.sellerBanner}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Want to sell on ShopStack? 🏪</h3>
                    <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>
                      Switch your profile mode to Vendor to manage and list products.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('VENDOR')} style={styles.sellerBtn}>
                    Switch to Vendor Mode 🔄
                  </button>
                </div>
              ) : (
                <div style={styles.vendorActiveBanner}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#15803d' }}>Currently in Vendor Mode 🏪</h3>
                    <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                      You have active seller privileges. You can switch back to Customer mode anytime.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('CUSTOMER')} style={styles.customerSwitchBtn}>
                    Switch to Customer Mode 🔄
                  </button>
                </div>
              )}

              <h2>Your Account Profile</h2>

              {!isEditing ? (
                <div style={styles.profileCard}>
                  <p><strong>Full Name:</strong> {profile.fullName}</p>
                  <p>
                    <strong>Current Active Mode:</strong>{' '}
                    <span style={profile.role === 'VENDOR' ? styles.vendorBadge : styles.badge}>
                      {profile.role}
                    </span>
                  </p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Phone Number:</strong> {profile.phone || 'Not added yet'}</p>
                  <p><strong>Shipping Address:</strong> {profile.address || 'Not added yet'}</p>
                  <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} style={styles.form}>
                  <label style={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                    required 
                    style={styles.input}
                  />

                  <label style={styles.label}>Phone Number</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                    style={styles.input}
                  />

                  <label style={styles.label}>Shipping Address</label>
                  <textarea 
                    rows="3" 
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                    style={styles.input}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={styles.saveBtn}>Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Order History Section */
            <div>
              <h2>Your Order History</h2>
              {orders.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>You haven't placed any orders yet.</p>
              ) : (
                orders.map((ord, i) => (
                  <div key={i} style={styles.orderHistoryCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ color: '#38bdf8' }}>{ord.orderId}</strong>
                      <span style={styles.statusBadge}>{ord.status}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>Date: {ord.date}</div>
                    
                    <div style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                          <span>{item.imageUrl} {item.name}</span>
                          <strong>₹{item.price}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#4ade80' }}>
                      Total Amount: ₹{ord.totalAmount}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#1e293b', borderBottom: '1px solid #334155' },
  logo: { color: '#38bdf8', margin: 0, fontSize: '24px' },
  backHomeBtn: { padding: '6px 14px', background: '#334155', color: '#38bdf8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  dashboard: { display: 'flex', padding: '30px', gap: '30px' },
  sidebar: { width: '250px', background: '#1e293b', padding: '20px', borderRadius: '10px', height: 'fit-content' },
  menuItem: { padding: '12px 15px', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', marginBottom: '8px' },
  activeMenuItem: { background: '#0284c7', color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, background: '#1e293b', padding: '25px', borderRadius: '10px' },
  
  sellerBanner: { background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  sellerBtn: { padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  
  vendorActiveBanner: { background: 'linear-gradient(135deg, #dcfce7, #86efac)', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  customerSwitchBtn: { padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },

  profileCard: { display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', background: '#0f172a', padding: '20px', borderRadius: '8px' },
  badge: { background: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  vendorBadge: { background: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  editBtn: { padding: '10px 20px', width: 'fit-content', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { color: '#94a3b8', fontSize: '14px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '15px' },
  saveBtn: { padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  
  orderHistoryCard: { background: '#0f172a', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #334155' },
  statusBadge: { background: '#166534', color: '#4ade80', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },

  toastSuccess: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#4caf50', color: '#fff', padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 1000 },
  toastError: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#e53935', color: '#fff', padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 1000 },
  toastIcon: { fontSize: '20px', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '50%' }
};