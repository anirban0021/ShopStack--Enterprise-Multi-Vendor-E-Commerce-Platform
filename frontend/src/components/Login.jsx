import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ switchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      alert('Login Successful! Welcome ' + response.data.fullName);
      setMessage('Login successful!');
    } catch (error) {
      alert(error.response?.data || 'Invalid email or password');
      setMessage('Login failed!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', color: '#fff' }}>
      <h2>ShopStack Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Don't have an account?{' '}
        <span 
          onClick={switchToRegister} 
          style={{ color: '#00d2ff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Register here
        </span>
      </p>
    </div>
  );
}