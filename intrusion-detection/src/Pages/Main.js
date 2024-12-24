import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Left from "./Left";
import Right from "./Right";

function Main() {
  const [selectedDataset, setSelectedDataset] = useState(null);

  return (
    <div style={{ display: "flex" }}>
      <Navbar selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} />
      <Left />
      <div style={{ marginLeft: "200px", width: "100%" }}>
        <Right selectedDataset={selectedDataset} />
      </div>
    </div>
  );
}

export default Main;
