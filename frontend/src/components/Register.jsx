import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    role: 'CUSTOMER' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      alert(res.data);
    } catch (err) {
      alert(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' }}>
      <h2>ShopStack Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
          required 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <select 
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
        </select>
        <button type="submit" style={{ padding: '12px', fontSize: '16px', cursor: 'pointer' }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
        Already have an account?{' '}
        <span 
          onClick={switchToLogin} 
          style={{ color: '#00d2ff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Login here
        </span>
      </p>
    </div>
  );
}