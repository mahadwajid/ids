import React, { useEffect, useState } from 'react';
import { fetchAnalysisData } from '../Services/API';
import '../CSS/DataVisualization.css';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryLabel, VictoryContainer } from 'victory';
import { FaDatabase, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const DataVisualization = ({ selectedDataset }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedDataset) {
        setAnalysis(null);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAnalysisData();
        const datasetInfo = data.find(
          (dataset) => dataset.name === selectedDataset
        );
        if (datasetInfo) {
          setAnalysis(datasetInfo.analysis);
        } else {
          setAnalysis(null);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedDataset]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }
  if (error) return <p>{error}</p>;

  if (!analysis) {
    return <p>No analysis data available for the selected dataset.</p>;
  }

  const normalVsAttackData = [
    { x: 'Normal', y: analysis.NoOfNormalSamples || 0 },
    { x: 'Attack', y: analysis.NoOfAttackSamples || 0 },
  ];

  const attackClassData = Object.entries(analysis.SamplesPerClass || {})
    .filter(([className]) => className !== analysis.NormalClass)
    .map(([className, count]) => ({ x: className, y: count }));

  return (
    <div className="Main-Container">
      <h1 className="summary-heading">Data Visualization Summary</h1>
      {analysis ? (
        <>
          <div className="profile-info">
            <div className="left-profile-info">
              <div className="upper-left-profile-info">
                <p className="bold-light">DATASET NAME</p>
                <p className="bold-light">TYPE</p>
              </div>
              <div className="lower-left-profile-info">
                <p className="bold-light">
                  {analysis.DatasetName.split("\\").pop().replace(/^\d+-/, '').split('.')[0]}
                </p>
                <p className="bold-light">{analysis.DatasetType}</p>
              </div>
            </div>
            <div className="middle-profile-info">
              <div className="upper-left-profile-info">
                <p className="bold-light">SIZE (KB)</p>
                <p className="bold-light">NO OF ATTRIBUTES</p>
              </div>
              <div className="lower-left-profile-info">
                <p className="bold-light">{analysis['Size(KB)']}</p>
                <p className="bold-light">{analysis.NoOfAttributes}</p>
              </div>
            </div>
            <div className="right-profile-info">
              <div className="upper-left-profile-info">
                <p className="bold-light">NO OF CLASSES</p>
                <p className="bold-light">TOTAL SAMPLES</p>
              </div>
              <div className="lower-left-profile-info">
                <p className="bold-light">{analysis.NoOfClasses || 'Data not available'}</p>
                <p className="bold-light">{analysis.TotalSamples}</p>
              </div>
            </div>
          </div>

          <div className="dashboard">
            <div className="dashboard-item">
              <h3>NUMBER OF TOTAL SAMPLES</h3>
              <p>
                <FaDatabase style={{ marginRight: '20px' }} />
                {analysis.TotalSamples}
              </p>
            </div>
            <div className="dashboard-item">
              <h3>NUMBER OF NORMAL SAMPLES</h3>
              <p>
                <FaCheckCircle style={{ marginRight: '10px' }} />
                {analysis.NoOfNormalSamples || 'Data not available'}
              </p>
            </div>
            <div className="dashboard-item">
              <h3>NUMBER OF ATTACK SAMPLES</h3>
              <p>
                <FaExclamationCircle style={{ marginRight: '10px' }} />
                {analysis.NoOfAttackSamples || 'Data not available'}
              </p>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Normal vs Attack Samples</h3>
              <VictoryPie
                data={normalVsAttackData}
                colorScale={['#4caf50', '#f44336']}
                labels={({ datum }) => `${datum.x}: ${datum.y}`}
                style={{
                  labels: { fontSize: 12, fill: '#333' },
                }}
                width={400} // Adjust chart width
                height={400}
              />
            </div>
            <div className="chart-container">
              <h3>Attack Classes Breakdown</h3>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={40}
                style={{
                  parent: { maxWidth: '100%', margin: '10px' }, // Add margin here
                }}
                width={650} // Adjust chart width
                height={600}
                containerComponent={
                  <VictoryContainer
                    style={{
                      margin: '10px', // Set margin for the container
                    }}
                  />
                }
              >
                <VictoryAxis
                  label="Attack Classes"
                  style={{
                    axisLabel: { padding: 40, fontSize: 14 },
                    tickLabels: { fontSize: 12, angle: -45, padding: 10 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label="Sample Count"
                  style={{
                    axisLabel: { padding: 50, fontSize: 14 },
                    tickLabels: { fontSize: 12, padding: 5 },
                  }}
                />
                <VictoryBar
                  data={attackClassData}
                  x="x"
                  y="y"
                  style={{
                    data: { fill: '#f44336', width: 20 },
                    labels: { fontSize: 12 },
                  }}
                  labels={({ datum }) => datum.y}
                  labelComponent={<VictoryLabel dy={-10} />}
                />
              </VictoryChart>
            </div>
          </div>
        </>
      ) : (
        <p>No analysis data available. Please upload a dataset first.</p>
      )}
    </div>
  );
};

export default DataVisualization;
