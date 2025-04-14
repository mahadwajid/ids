import React, { useState, useEffect } from "react";
import "../CSS/Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { fetchAnalysisData } from "../Services/API";

function Navbar({ selectedDataset, setSelectedDataset }) {
  const [username, setUsername] = useState("");
  const [datasets, setDatasets] = useState([]); // State to store dataset names
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const storedDataset = localStorage.getItem("selectedDataset");
    if (storedDataset) {
      setSelectedDataset(storedDataset);
    }
  }, [setSelectedDataset]);

  // Fetch datasets when the component mounts
  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    fetchDatasets(); // Fetch datasets when Navbar mounts

    const handleDatasetUpdate = () => {
        fetchDatasets(); // ✅ Fetch datasets when a new dataset is uploaded
    };

    window.addEventListener("datasetUpdated", handleDatasetUpdate);

    return () => {
        window.removeEventListener("datasetUpdated", handleDatasetUpdate);
    };
}, []);

  const fetchDatasets = async () => {
    try {
      const data = await fetchAnalysisData(); // Fetch datasets from the backend
      setDatasets(data.map((dataset) => dataset.name)); // Assuming the API returns an array of datasets with a "name" property
    } catch (error) {
      console.error("Failed to fetch datasets:", error.message);
    }
  };

  const handleDatasetChange = (e) => {
    const dataset = e.target.value;
    setSelectedDataset(dataset);
    localStorage.setItem("selectedDataset", dataset); // Persist the selection
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("selectedDataset");
    window.location.href = "/";
  };

  // Check if current route is Preprocessing or Data Visualization
  const showDatasetDropdown =
    location.pathname.includes("Main/Preprocessing") ||
    location.pathname.includes("/Main/data-visualization") || 
    location.pathname.includes("/Main/intrusion-detection");

  return (
    <div className="navbar">
      {showDatasetDropdown && (
        <div className="left-section">
          <i className="fa fa-bars" style={{ color: "white" }}></i>
          <div className="dataset-dropdown">
            <select
              className="dataset-select"
              value={selectedDataset || ""}
              onChange={handleDatasetChange}
            >
              <option value="">Select Dataset</option>
              {datasets.map((dataset, index) => (
                <option key={index} value={dataset}>
                  {dataset}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="right-section">
        <div className="dropdown">
          <img
            src="https://via.placeholder.com/50x50.png?text=ML"
            alt="Profile"
            className="round-icon"
          />
          <div className="dropdown-content">
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
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
