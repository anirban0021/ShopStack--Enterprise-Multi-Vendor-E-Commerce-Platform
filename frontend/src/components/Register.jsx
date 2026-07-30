import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    role: 'CUSTOMER' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', title: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlashMessage({ type: '', title: '', text: '' });
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      setFlashMessage({ 
        type: 'success', 
        title: 'New account added successfully.', 
        text: 'Please wait while we set things up for you...' 
      });
      setTimeout(() => switchToLogin(), 2200);
    } catch (err) {
      setFlashMessage({ 
        type: 'error', 
        title: 'Registration failed.', 
        text: err.response?.data || 'Please check your inputs and try again.' 
      });
    }
  };

  return (
    <div style={styles.card}>
      {flashMessage.text && (
        <div style={flashMessage.type === 'success' ? styles.toastSuccess : styles.toastError}>
          <div style={styles.toastIcon}>
            {flashMessage.type === 'success' ? '✔' : '✖'}
          </div>
          <div>
            <strong>{flashMessage.title}</strong>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>{flashMessage.text}</div>
          </div>
        </div>
      )}

      <h2 style={styles.title}>ShopStack Registration</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" 
          placeholder="Full Name" 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
          required 
          style={styles.input}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          style={styles.input}
        />
        
        <div style={styles.passwordWrapper}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
            style={styles.input}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            {showPassword ? "👁️" : "🙈"}
          </button>
        </div>

        {/* Updated Role Dropdown containing all 4 image requirements */}
        <select 
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          style={styles.input}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
          <option value="ADMINISTRATOR">Administrator</option>
          <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
        </select>

        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>

      <p style={styles.footerText}>
        Already have an account?{' '}
        <span onClick={switchToLogin} style={styles.link}>
          Login here
        </span>
      </p>
    </div>
  );
}

const styles = {
  card: { maxWidth: '420px', margin: '60px auto', padding: '30px', borderRadius: '12px', background: '#1e293b', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#fff', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#38bdf8' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '15px', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', width: '100%' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  button: { padding: '12px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  toastSuccess: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#4caf50', color: '#fff', padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '450px' },
  toastError: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#e53935', color: '#fff', padding: '15px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '450px' },
  toastIcon: { fontSize: '20px', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '50%' },
  footerText: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' },
  link: { color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }
};