import React, { useState } from 'react';
import { login } from '../Services/API';
import { useNavigate } from 'react-router-dom';

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
      navigate("/Main"); // Redirect to home after successful login
    } catch (error) {
      setMessage(error.response.data.message); // Show error message
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/Signup"); // Redirect to signup page
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}

      <div>
        <p>Don't have an account? <span onClick={handleSignUpRedirect} style={{ color: 'blue', cursor: 'pointer' }}>Create a new account</span></p>
      </div>
    </div>
  );
};

export default Login;
