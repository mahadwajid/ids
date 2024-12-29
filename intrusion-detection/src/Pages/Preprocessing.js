import React, { useState } from "react";
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

    try {
      const data = await preprocessDataset(options);
      setPreprocessingResults(data);
    } catch (error) {
      console.error("Error during preprocessing:", error);
    }
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
            label: "Original Mean",
            data: Object.values(preprocessingResults.featureScalingSummary).map(item => item["Original Mean"] || 0),
            backgroundColor: "#FFA726",
            borderColor: "#FFA726",
            fill: false,
          },
          {
            label: "Original Std",
            data: Object.values(preprocessingResults.featureScalingSummary).map(item => item["Original Std"] || 0),
            backgroundColor: "#42A5F5",
            borderColor: "#42A5F5",
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
            data: Object.values(preprocessingResults.featureSelectionSummary || {}).map(value =>
              parseFloat(value.match(/[\d.]+/)?.[0] || 0) // Extract numeric percentage
            ),
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
          </form>
        </div>

        <div className="chart-container">
          <h3>Feature Distribution Graph</h3>
          {featureGraphData && <Bar data={featureGraphData} options={{ responsive: true }} />}
        </div>
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
              ["Feature", "Original Mean", "Original Std"],
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
