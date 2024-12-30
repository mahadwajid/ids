import React, { useState, useEffect } from "react";
import { preprocessDataset } from "../Services/API";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../CSS/Preprocessing.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, ArcElement, Title, Tooltip, Legend);

function Preprocessing({ selectedDataset }) {
  const [preprocessingResults, setPreprocessingResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem("preprocessingResults");
    if (savedResults) {
      setPreprocessingResults(JSON.parse(savedResults));
    }
  }, []);

  // Save preprocessingResults to localStorage whenever it changes
  useEffect(() => {
    if (preprocessingResults) {
      localStorage.setItem("preprocessingResults", JSON.stringify(preprocessingResults));
    } else {
      localStorage.removeItem("preprocessingResults");
    }
  }, [preprocessingResults]);

  const simulateProgress = (callback) => {
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 10; // Increment progress by 10%
      callback(simulatedProgress);
      if (simulatedProgress >= 100) {
        clearInterval(interval);
      }
    }, 500); // Update every 500ms
  };

  const handleApply = async () => {
    if (!selectedDataset) {
      alert("Please select a dataset first!");
      return;
    }

    const options = {
      missingValueHandling: document.getElementById("missing-value-handling").checked,
      featureScaling: document.getElementById("feature-scaling").checked,
      encodingCategorical: document.getElementById("encoding-categorical").checked,
      featureSelection: document.getElementById("feature-selection").checked,
      dataset: selectedDataset,
    };

    setIsProcessing(true); // Start processing
    setProgress(0); // Reset progress

    try {
      simulateProgress((progressValue) => setProgress(progressValue));
      const data = await preprocessDataset(options); // Replace with actual API call
      setPreprocessingResults(data);
    } catch (error) {
      console.error("Error during preprocessing:", error);
    } finally {
      setIsProcessing(false); // End processing
      setProgress(100); // Ensure progress is at 100%
    }
  };

  const handleClear = () => {
    setPreprocessingResults(null);
    localStorage.removeItem("preprocessingResults");
  };

  const renderMatrix = (title, data, columnsToDisplay, maxRows = 3) => {
    if (!data || Object.keys(data).length === 0) {
      return <p>{title} data is not available.</p>;
    }

    let rows = [];
    if (title === "Missing Value Summary") {
      const originalValues = Object.entries(data["Original Missing Values"] || {}).slice(0, maxRows);
      const afterValues = Object.entries(data["After Preprocessing"] || {}).slice(0, maxRows);

      rows = originalValues.map(([feature, originalCount], index) => ({
        Feature: feature,
        "Original Missing Count": originalCount,
        "After Preprocessing": afterValues[index] ? afterValues[index][1] : "N/A",
      }));
    } else {
      rows = Object.entries(data).slice(0, maxRows).map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          return { Feature: key, Value: value };
        } else if (typeof value === "object") {
          return { Feature: key, ...value };
        }
        return null;
      });
    }

    return (
      <div className="summary-section">
        <h4>{title}</h4>
        <table className="summary-table">
          <thead>
            <tr>
              {columnsToDisplay.map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columnsToDisplay.map((key, i) => (
                  <td key={i}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const featureGraphData = preprocessingResults
    ? {
        labels: ["Numeric Features", "Non-Numeric Features"],
        datasets: [
          {
            label: "Number of Features",
            data: [
              preprocessingResults.numericFeatureNames?.length || 0,
              preprocessingResults.nonNumericFeatureNames?.length || 0,
            ],
            backgroundColor: ["#42A5F5", "#FFA726"],
          },
        ],
      }
    : null;

  const missingValueGraphData = preprocessingResults && preprocessingResults.missingValueSummary
    ? {
        labels: Object.keys(preprocessingResults.missingValueSummary["Original Missing Values"] || {}),
        datasets: [
          {
            label: "Original Missing Values",
            data: Object.values(preprocessingResults.missingValueSummary["Original Missing Values"] || {}),
            backgroundColor: "#FFA726",
          },
          {
            label: "After Preprocessing",
            data: Object.values(preprocessingResults.missingValueSummary["After Preprocessing"] || {}),
            backgroundColor: "#42A5F5",
          },
        ],
      }
    : null;

  const featureScalingGraphData = preprocessingResults && preprocessingResults.featureScalingSummary
    ? {
        labels: Object.keys(preprocessingResults.featureScalingSummary || {}),
        datasets: [
          {
            label: "Scaled Mean",
            data: Object.values(preprocessingResults.featureScalingSummary).map(item => item["Scaled Mean"] || 0),
            backgroundColor: "#42A5F5",
            borderColor: "#42A5F5",
            fill: false,
          },
          {
            label: "Scaled Std",
            data: Object.values(preprocessingResults.featureScalingSummary).map(item => item["Scaled Std"] || 0),
            backgroundColor: "#FFA726",
            borderColor: "#FFA726",
            fill: false,
          },
        ],
      }
    : null;

  const encodingGraphData = preprocessingResults && preprocessingResults.encodingSummary
    ? {
        labels: Object.keys(preprocessingResults.encodingSummary || {}),
        datasets: [
          {
            label: "Number of Encoded Features",
            data: Object.values(preprocessingResults.encodingSummary || {}).map(value =>
              parseInt(value.match(/\d+/)?.[0] || 0) // Extract numeric count from the string
            ),
            backgroundColor: "#42A5F5",
          },
        ],
      }
    : null;

    const featureSelectionGraphData = preprocessingResults && preprocessingResults.featureSelectionSummary
    ? {
        labels: Object.keys(preprocessingResults.featureSelectionSummary || {}),
        datasets: [
          {
            label: "Variance Explained (%)",
            data: Object.values(preprocessingResults.featureSelectionSummary || {}).map(value => {
              // Ensure value is a string before calling .match()
              const numericValue = typeof value === 'string'
                ? parseFloat(value.match(/[\d.]+/)?.[0] || 0)  // Extract numeric percentage
                : 0;  // Default to 0 if it's not a string
              return numericValue;
            }),
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
              "#FF9F40", "#FFA726", "#42A5F5", "#AB47BC", "#26C6DA",
            ],
          },
        ],
      }
    : null;
  

  return (
    <div className="preprocessing-container">
      {isProcessing && (
        <div className="loader-container">
          <div className="loader"></div>
          <p style={{ color: "white", marginTop: "10px" }}>Processing...</p>
        </div>
      )}

      <div className="options-and-chart">
        <div className="preprocessing-options">
          <h3>Preprocessing Options</h3>
          <form>
            <div className="checkbox-option">
              <input type="checkbox" id="missing-value-handling" />
              <label htmlFor="missing-value-handling">Missing Value Handling</label>
            </div>
            <div className="checkbox-option">
              <input type="checkbox" id="feature-scaling" />
              <label htmlFor="feature-scaling">Feature Scaling</label>
            </div>
            <div className="checkbox-option">
              <input type="checkbox" id="encoding-categorical" />
              <label htmlFor="encoding-categorical">Encoding Categorical Variables</label>
            </div>
            <div className="checkbox-option">
              <input type="checkbox" id="feature-selection" />
              <label htmlFor="feature-selection">Feature Selection or PCA</label>
            </div>
            <button
              type="button"
              className="apply-button"
              onClick={handleApply}
            >
              Apply
            </button>

            <button type="button" className="clear-button" onClick={handleClear}>
              Clear
            </button>
          </form>
        </div>

        {/* <div className="chart-container-1">
          <h3>Feature Distribution Graph</h3>
          {featureGraphData && <Bar data={featureGraphData} options={{ responsive: true }} />}
        </div> */}
      </div>

      {preprocessingResults && (
        <div className="summary-container">
          <h3>Preprocessing Summaries</h3>

          <div className="summary-section-row">
            {renderMatrix(
              "Missing Value Summary",
              preprocessingResults.missingValueSummary,
              ["Feature", "Original Missing Count", "After Preprocessing"],
              3
            )}
            <div className="summary-graph">
              <h4>Missing Value Handling Graph</h4>
              {missingValueGraphData && <Bar data={missingValueGraphData} options={{ responsive: true }} />}
            </div>
          </div>

          <div className="summary-section-row">
            {renderMatrix(
              "Feature Scaling Summary",
              preprocessingResults.featureScalingSummary,
              ["Feature", "Scaled Mean", "Scaled Std"],
              3
            )}
            <div className="summary-graph">
              <h4>Feature Scaling Graph</h4>
              {featureScalingGraphData && <Line data={featureScalingGraphData} options={{ responsive: true }} />}
            </div>
          </div>

          <div className="summary-section-row">
            {renderMatrix(
              "Encoding Summary",
              preprocessingResults.encodingSummary,
              ["Feature", "Value"],
              3
            )}
            <div className="summary-graph">
              <h4>Encoding Graph</h4>
              {encodingGraphData && <Bar data={encodingGraphData} options={{ responsive: true }} />}
            </div>
          </div>

          <div className="summary-section-row">
            {renderMatrix(
              "Feature Selection Summary",
              preprocessingResults.featureSelectionSummary,
              ["Feature", "Value"],
              3
            )}
            <div className="summary-graph">
              <h4>Feature Selection Graph</h4>
              {featureSelectionGraphData && <Pie data={featureSelectionGraphData} options={{ responsive: true }} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Preprocessing;
