import React from "react";
import { Routes, Route } from "react-router-dom";
import DataVisualization from "./DataVisualization";
import IntrusionDetection from "./IntrusionDetection";
import Home from "./Home";
import DataBalancing from "./DataBalancing";
import Preprocessing from "./Preprocessing";

const Right = ({ selectedDataset }) => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginTop: "50px", width: "100%" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="data-visualization" element={<DataVisualization selectedDataset={selectedDataset} />} />
          <Route path="intrusion-detection" element={<IntrusionDetection />} />
          <Route path="DataBalancing" element={<DataBalancing />} />
          <Route path="Preprocessing" element={<Preprocessing selectedDataset={selectedDataset}  />} />
          <Route path="*" element={<Home />} /> {/* Fallback for unmatched */}
        </Routes>
      </div>
    </div>
  );
};

export default Right;
