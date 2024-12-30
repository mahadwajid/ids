import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material'; // Material-UI components
import { Bar, Line } from 'react-chartjs-2'; // Chart components
import '../CSS/DataBalancing.css'; // Import your custom CSS
import { fetchAndBalanceDataset } from '../Services/API'; // Your API call function

const DataBalancing = () => {
  const [summary, setSummary] = useState(() => {
    const savedSummary = localStorage.getItem('dataSummary');
    return savedSummary ? JSON.parse(savedSummary) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chartColors = [
    "rgba(255, 99, 132, 0.6)",  // Red
    "rgba(54, 162, 235, 0.6)",  // Blue
    "rgba(255, 206, 86, 0.6)",  // Yellow
    "rgba(75, 192, 192, 0.6)",  // Teal
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)",  // Orange
    "rgba(199, 199, 199, 0.6)", // Gray
  ];

  const borderColors = chartColors.map((color) => color.replace("0.6", "1.0")); // Brighter borders

  // Save summary to localStorage whenever it changes
  useEffect(() => {
    if (summary) {
      localStorage.setItem('dataSummary', JSON.stringify(summary));
    }
  }, [summary]);

  // Handle dataset balancing
  const handleBalanceDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAndBalanceDataset();
      setSummary(result);
    } catch (error) {
      console.error('Error balancing dataset:', error);
      setError('An error occurred while processing the dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Clear stored data
  const handleClearData = () => {
    localStorage.removeItem('dataSummary');
    setSummary(null);
  };

  // Format numbers
  const formatNumber = (num) => {
    return Number(num).toFixed(4);
  };

  // Chart data for evaluation metrics
  const getEvaluationChartData = (metrics) => ({
    labels: ['Cosine Similarity', 'Discriminator Score'],
    datasets: [
      {
        label: 'Value',
        data: [metrics.cosine_similarity, metrics.discriminator_score],
        backgroundColor: chartColors.slice(0, 2), // First two colors
        borderColor: borderColors.slice(0, 2),
        borderWidth: 1,
      },
    ],
  });

  // Chart data for distributions
  const getChartData = (data) => ({
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Count',
        data: Object.values(data),
        backgroundColor: chartColors.slice(0, Object.keys(data).length), // Use a subset of colors
        borderColor: borderColors.slice(0, Object.keys(data).length),
        borderWidth: 1,
      },
    ],
  });

  return (
    <div className="data-main-container">
      <div className="text-container">
        <Typography variant="h4" align="center" gutterBottom>
          Apply GAN Balancing
        </Typography>
        <button onClick={handleBalanceDataset} disabled={loading} className="apply-button-1">
          {loading ? 'Processing...' : 'Fetch & Balance Dataset'}
        </button>
        {summary && (
          <button onClick={handleClearData} className="clear-button">
            Clear Data
          </button>
        )}
      </div>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {summary && (
        <div className="summary-container">
          <Typography variant="h5" align="center" gutterBottom>
            Data Balancing Summaries
          </Typography>

          <div className="summary-section-row">
            {/* Original Distribution */}
            <Card className="summary-section">
              <CardHeader title="Original Distribution" />
              <CardContent>
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.class_counts_before_generation).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card className="summary-graph">
              <CardHeader title="Original Distribution Chart" />
              <CardContent>
                <Bar data={getChartData(summary.class_counts_before_generation)} />
              </CardContent>
            </Card>
          </div>

          {/* Balanced Distribution */}
          <div className="summary-section-row">
            <Card className="summary-section">
              <CardHeader title="Balanced Distribution" />
              <CardContent>
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.class_counts_after_generation).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card className="summary-graph">
              <CardHeader title="Balanced Distribution Chart" />
              <CardContent>
                <Bar data={getChartData(summary.class_counts_after_generation)} />
              </CardContent>
            </Card>
          </div>

          {/* Model Evaluation Metrics */}
          <Card className="metrics-card">
            <CardHeader title="Model Evaluation Metrics" />
            <CardContent>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cosine Similarity</td>
                    <td>{formatNumber(summary.evaluation_metrics.cosine_similarity)}</td>
                  </tr>
                  <tr>
                    <td>Discriminator Score</td>
                    <td>{formatNumber(summary.evaluation_metrics.discriminator_score)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="chart-container-GAN">
                <Line data={getEvaluationChartData(summary.evaluation_metrics)} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DataBalancing;
