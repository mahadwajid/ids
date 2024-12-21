import React, { useState, useEffect } from "react";
import "../CSS/Navbar.css"; // Assuming the CSS file is in the correct location
import { Link } from "react-router-dom";

function Navbar() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve username from localStorage when the component mounts
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    localStorage.removeItem("username"); // Clear the username from localStorage
    window.location.href = "/"; // Redirect to login page after logout
  };

  return (
    <div className="navbar">
      <i className="fa fa-bars" style={{ color: "white" }}></i>

      <div className="right-section">
        <div className="dropdown">
          <img
            src="https://via.placeholder.com/50x50.png?text=ML"
            alt="Profile"
            className="round-icon"
          />

          <div className="dropdown-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="https://via.placeholder.com/50x50.png?text=ML"
                alt="Profile"
                className="round-icon"
              />
              <div>
                <p style={{ margin: 0 }}>{username ? username : "Guest"}</p>
              </div>
            </div>
            <div className="horizontal-line"></div>
            <div className="anchorTagFor">
              <Link to="Change-password">
                <i className="fa fa-lock"></i> Change Password
              </Link>
            </div>
            <div className="horizontal-line"></div>
            <div className="anchorTagFor">
              <Link to="/" onClick={handleLogout}>
                <i className="fa fa-sign-out-alt"></i> Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
