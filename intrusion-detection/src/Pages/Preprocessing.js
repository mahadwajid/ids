import React, { useState } from "react";
import { preprocessDataset } from "../Services/API";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../CSS/Preprocessing.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Preprocessing({ selectedDataset }) {
  const [showSummary, setShowSummary] = useState(false);
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
      setShowSummary(true);
    } catch (error) {
      console.error("Error during preprocessing:", error);
    }
  };

  const renderCellValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value); // Convert objects/arrays to readable strings
    }
    return value; // Render primitive values
  };

  // Prepare data for the bar chart
  const featureGraphData = preprocessingResults
    ? {
        labels: ["Numeric Features", "Non-Numeric Features"],
        datasets: [
          {
            label: "Number of Features",
            data: [
              preprocessingResults.numericFeatureNames.length,
              preprocessingResults.nonNumericFeatureNames.length,
            ],
            backgroundColor: ["#42A5F5", "#FFA726"],
          },
        ],
      }
    : null;

  return (
    <div className="Main-container-1">
      <div className="DatasetFeature">
        <div className="Preprocessing-options">
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
              style={{ float: "right" }}
            >
              Apply
            </button>
          </form>
        </div>

        {/* Chart Section */}
        <div className="chart-container-1">
          <h3>Feature Distribution Graph</h3>
          {featureGraphData && <Bar data={featureGraphData} options={{ responsive: true }} />}
        </div>

        {/* Display Feature Names */}
        {preprocessingResults && (
          <div className="feature-lists">
            <h4>Numeric Features:</h4>
            <ul>
              {preprocessingResults.numericFeatureNames.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <h4>Non-Numeric Features:</h4>
            <ul>
              {preprocessingResults.nonNumericFeatureNames.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Processed Dataset Preview */}
        {preprocessingResults && (
          <div className="dataset-preview">
            <h3>Processed Dataset Preview</h3>
            <table className="dataset-table">
              <thead>
                <tr>
                  {Array.isArray(preprocessingResults.processedDatasetPreview) &&
                  preprocessingResults.processedDatasetPreview.length > 0
                    ? Object.keys(preprocessingResults.processedDatasetPreview[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))
                    : <th>Value</th>}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(preprocessingResults.processedDatasetPreview) &&
                preprocessingResults.processedDatasetPreview.length > 0
                  ? preprocessingResults.processedDatasetPreview.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{renderCellValue(value)}</td>
                        ))}
                      </tr>
                    ))
                  : Object.entries(preprocessingResults.processedDatasetPreview).map(
                      ([key, value], index) => (
                        <tr key={index}>
                          <td>{key}</td>
                          <td>{renderCellValue(value)}</td>
                        </tr>
                      )
                    )}
              </tbody>
            </table>
          </div>
        )}

        {/* Preprocessing Summary */}
        {showSummary && preprocessingResults && (
          <div className="Summary-Panel">
            <h3>Preprocessing Summary</h3>
            <div className="summary-item">
              <h4>Missing Value Handling Applied</h4>
              <p>{preprocessingResults.missingValueHandled ? "Yes" : "No"}</p>
            </div>
            <div className="summary-item">
              <h4>Feature Scaling Applied</h4>
              <p>{preprocessingResults.featureScalingApplied ? "Yes" : "No"}</p>
            </div>
            <div className="summary-item">
              <h4>Categorical Encoding Applied</h4>
              <p>{preprocessingResults.categoricalEncodingApplied ? "Yes" : "No"}</p>
            </div>
            <div className="summary-item">
              <h4>Feature Selection Applied</h4>
              <p>{preprocessingResults.featureSelectionApplied ? "Yes" : "No"}</p>
            </div>
            <div className="summary-item">
              <h4>Summary</h4>
              <p>{preprocessingResults.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preprocessing;
