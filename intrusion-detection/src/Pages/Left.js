import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/Sidebar.css"; // Add your CSS file here

function Left() {
  const [isActive, setIsActive] = useState("");

  const handleClick = (name) => {
    setIsActive(name);
  };

  return (
    <div className="sidebar-container">
      <div className="sidenav">
        <span className="Heading-sidebar">IntrusiGen</span>

        <div
          className={`SB-items ${isActive === "Home" ? "active" : ""}`}
          onClick={() => handleClick("Home")}
        >
          <Link to="/Main" className="SB-link">
            <i className="fa fa-upload SB-icon"></i> Upload Dataset
          </Link>
        </div>

        <div
          className={`SB-items ${isActive === "DataVisualization" ? "active" : ""}`}
          onClick={() => handleClick("DataVisualization")}
        >
          <Link to="/Main/data-visualization" className="SB-link">
            <i className="fa fa-bar-chart SB-icon"></i> Data Visualization
          </Link>
        </div>

        <div
          className={`SB-items ${isActive === "Preprocessing" ? "active" : ""}`}
          onClick={() => handleClick("Preprocessing")}
        >
          <Link to="/Main/Preprocessing" className="SB-link">
            <i className="fa fa-cogs SB-icon"></i> Preprocessing
          </Link>
        </div>

        <div
          className={`SB-items ${isActive === "DataBalancing" ? "active" : ""}`}
          onClick={() => handleClick("DataBalancing")}
        >
          <Link to="/Main/DataBalancing" className="SB-link">
            <i className="fa fa-balance-scale SB-icon"></i> Dataset Balancing
          </Link>
        </div>

        <div
          className={`SB-items ${isActive === "IntrusionDetection" ? "active" : ""}`}
          onClick={() => handleClick("IntrusionDetection")}
        >
          <Link to="/Main/intrusion-detection" className="SB-link">
            <i className="fa fa-shield SB-icon"></i> Intrusion Detection
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Left;
