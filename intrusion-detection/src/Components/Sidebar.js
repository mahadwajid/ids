import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/Sidebar.css";

function Sidebar() {
  const [isActive, setIsActive] = useState("");

  const handleClick = (name) => {
    setIsActive(name);
  };

  return (
    <div className="sidebar-container">
      <div className="sidenav">
        <span className="Heading-sidebar">IDS</span>

        <div
          className={`SB-items ${isActive === "DataVisualization" ? "active" : ""}`}
          onClick={() => handleClick("DataVisualization")}
        >
          <Link to="/data-visualization" className="SB-link">
            <i className="fa fa-bar-chart SB-icon"></i> Data Visualization
          </Link>
        </div>
        
        

        <div
          className={`SB-items ${isActive === "IntrusionDetection" ? "active" : ""}`}
          onClick={() => handleClick("IntrusionDetection")}
        >
          <Link to="/intrusion-detection" className="SB-link">
            <i className="fa fa-shield SB-icon"></i> Intrusion Detection
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
