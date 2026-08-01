import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Check, X, Sun, Moon, Briefcase } from 'lucide-react';

export default function Login({ switchToRegister, onLoginSuccess, theme, onToggleTheme }) {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'CUSTOMER', vendorCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', title: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlashMessage({ type: '', title: '', text: '' });

    if (formData.role === 'VENDOR' && (!formData.vendorCode || formData.vendorCode.length !== 6)) {
      setFlashMessage({
        type: 'error',
        title: 'Validation failed.',
        text: 'A 6-digit unique Vendor ID is required to log in as a Vendor.'
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      setFlashMessage({ 
        type: 'success', 
        title: 'Login successful.', 
        text: `Welcome back, ${response.data.fullName}! Redirecting to dashboard...` 
      });
      setTimeout(() => onLoginSuccess(response.data), 1500);
    } catch (error) {
      setFlashMessage({ 
        type: 'error', 
        title: 'Authentication failed.', 
        text: error.response?.data || 'Invalid email, password, or role details.' 
      });
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Top Banner Flash Toast */}
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.title}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      <div className="auth-card" style={{ position: 'relative' }}>
        {/* Theme Toggle Button */}
        <button 
          type="button" 
          onClick={onToggleTheme} 
          className="btn-icon-only" 
          style={{ position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', padding: '6px' }}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={14} style={{ color: 'var(--accent-blue)' }} /> : <Moon size={14} style={{ color: 'var(--accent-indigo)' }} />}
        </button>

        <div className="auth-header">
          <h2 className="auth-logo">ShopStack</h2>
          <p className="auth-subtitle">Sign in to your merchant or customer account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Signing in as</label>
            <div className="input-icon-wrapper">
              <Briefcase className="input-icon" />
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '44px' }}
              >
                <option value="CUSTOMER">Customer / Buyer</option>
                <option value="VENDOR">Merchant Vendor</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
              </select>
            </div>
          </div>

          {formData.role === 'VENDOR' && (
            <div className="form-group" style={{ animation: 'slideUp 0.15s ease' }}>
              <label className="form-label">6-digit Vendor ID</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" />
                <input
                  type="text"
                  name="vendorCode"
                  maxLength="6"
                  placeholder="e.g. 123456"
                  value={formData.vendorCode}
                  onChange={(e) => setFormData({...formData, vendorCode: e.target.value.replace(/\D/g, '')})}
                  required
                  className="form-input"
                  style={{ letterSpacing: formData.vendorCode ? '3px' : 'normal', fontWeight: 'bold' }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <span onClick={switchToRegister} className="auth-link">
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}