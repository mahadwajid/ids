import React, { useEffect, useState } from 'react';
import { fetchAnalysisData } from '../Services/API'; // Import the function from API.js
import '../CSS/DataVisualization.css';
import { FaDatabase, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';

const DataVisualization = () => {
    const [analysis, setAnalysis] = useState(null); // State to store the analysis data
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        // Fetch data from backend
        const fetchAnalysis = async () => {
            try {
                const data = await fetchAnalysisData(); // Use the function from API.js
                if (data.length > 0) {
                    console.log('Fetched Analysis Data:', data[0].analysis); // Debugging line
                    setAnalysis(data[0].analysis); // Access the first dataset's analysis
                } else {
                    setAnalysis(null); // Handle no data scenario
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, []); // Empty dependency array to fetch data only on mount

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const datasetGraphData = [
        { x: 0, y: 10 },
        { x: 4, y: 20 },
        { x: 8, y: 30 },
        { x: 12, y: 25 },
        { x: 16, y: 40 },
        { x: 20, y: 35 },
        { x: 24, y: 50 },
    ];

    const classesGraphData = [
        { x: 'Normal', y: analysis.NoofNormalSamples || 0 },
        { x: 'Attack', y: analysis.NoofAttackSamples || 0 },
    ];

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
                                {analysis.NoofNormalSamples || 'Data not available'}
                            </p>
                        </div>
                        <div className="dashboard-item">
                            <h3>NUMBER OF ATTACK SAMPLES</h3>
                            <p>
                                <FaExclamationCircle style={{ marginRight: '10px' }} />
                                {analysis.NoofAttackSamples || 'Data not available'}
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h3>DATASET GRAPH</h3>
                            <VictoryChart
                                theme={VictoryTheme.material}
                                domainPadding={20}
                                style={{
                                    parent: { maxWidth: '100%' },
                                }}
                            >
                                <VictoryAxis
                                    label="Time (Hours)"
                                    style={{
                                        axisLabel: { padding: 30, fontSize: 12 },
                                        tickLabels: { fontSize: 10, padding: 5 },
                                    }}
                                />
                                <VictoryAxis
                                    dependentAxis
                                    label="Values"
                                    style={{
                                        axisLabel: { padding: 40, fontSize: 12 },
                                        tickLabels: { fontSize: 10, padding: 5 },
                                    }}
                                />
                                <VictoryLine
                                    data={datasetGraphData}
                                    style={{
                                        data: { stroke: '#4caf50', strokeWidth: 2 },
                                    }}
                                />
                            </VictoryChart>
                        </div>
                        <div className="chart-container">
                            <h3>CLASSES</h3>
                            <VictoryChart
                                theme={VictoryTheme.material}
                                domainPadding={20}
                                style={{
                                    parent: { maxWidth: '100%' },
                                }}
                            >
                                <VictoryAxis
                                    label="Classes"
                                    style={{
                                        axisLabel: { padding: 30, fontSize: 12 },
                                        tickLabels: { fontSize: 10, padding: 5 },
                                    }}
                                />
                                <VictoryAxis
                                    dependentAxis
                                    label="Sample Count"
                                    style={{
                                        axisLabel: { padding: 40, fontSize: 12 },
                                        tickLabels: { fontSize: 10, padding: 5 },
                                    }}
                                />
                                <VictoryLine
                                    data={classesGraphData}
                                    style={{
                                        data: { stroke: '#f44336', strokeWidth: 2 },
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
