import React, { useState } from 'react';
import '../CSS/Login.css';
import { login } from '../Services/API';
import { useNavigate } from 'react-router-dom';
import img1 from '../Images/login.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    try {
      const response = await login(userData);
      setMessage(response.message); // Show success message
      localStorage.setItem('token', response.token); // Store token in localStorage
      localStorage.setItem('username', response.username); // Store username in localStorage
      navigate('/Main'); // Redirect to home after successful login
    } catch (error) {
      setMessage(error.response.data.message); // Show error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={img1} alt="Illustration" className="login-illustration" />
      </div>
      <div className="login-right">
        <h2>Welcome back!</h2>
        <p>Login to continue to Intrusion Detection System</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p>Don't have an account? <span onClick={() => navigate('/Signup')} className="link">Sign up</span></p>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
