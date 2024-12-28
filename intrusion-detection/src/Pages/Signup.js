import React, { useState } from 'react';
import '../CSS/Signup.css'; // Import the Signup-specific CSS
import { signup } from '../Services/API'; // Assuming you have an API service for signup
import { useNavigate } from 'react-router-dom';
import img1 from '../Images/login.png';

function Signup() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Collect all form data
    const userData = { username, name, email, password };

    try {
      const response = await signup(userData); // Call signup function
      setMessage(response.message); // Show success message
      navigate('/Login'); // Redirect to login page
    } catch (error) {
      setMessage(error.response.data.message); // Show error message
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={img1} alt="Illustration" className="signup-illustration" />
      </div>
      <div className="signup-right">
        <h2>Create your account</h2>
        <p>Signup to start using our system</p>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
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
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <p>
          Already have an account? <span onClick={() => navigate('/')} className="link">Login</span>
        </p>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Signup;
