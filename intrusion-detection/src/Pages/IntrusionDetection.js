import '../CSS/IntrusionDetection.css';

function IntrusionDetection() {
    return (
        <div className="ids-container">
            <div className="upload-section">
                <h3>Upload Dataset</h3>
                <div className="upload-buttons"  >
                    <button className="btn upload-btn" >Upload</button>
                    <button className="btn continue-btn">Continue with Existing Dataset</button>
                </div>
            </div>

            <div className="metrics-section">
                <h3>Detection Metrics</h3>
                <table className="metrics-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Score</th>
                            <th>Weight</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Packets Analyzed</td>
                            <td>0</td>
                            <td>3.3%</td>
                        </tr>
                        <tr>
                            <td>Intrusions Detected</td>
                            <td>0</td>
                            <td>3.3%</td>
                        </tr>
                        <tr>
                            <td>Detection Accuracy</td>
                            <td>0%</td>
                            <td>8.3%</td>
                        </tr>
                        <tr>
                            <td>False Positives</td>
                            <td>0</td>
                            <td>8.3%</td>
                        </tr>
                        <tr>
                            <td>False Negatives</td>
                            <td>0</td>
                            <td>8.3%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="results-section">
                <h3>Detection Results</h3>
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Source IP</th>
                            <th>Destination IP</th>
                            <th>Protocol</th>
                            <th>Threat</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="graphs-section">
                <h3>Graphs and Charts</h3>
                <div className="graph-container">
                    <div className="graph" id="threat-level-graph">Threat Levels Over Time</div>
                    <div className="graph" id="intrusion-type-chart">Intrusion Types Distribution</div>
                    <div className="graph" id="network-traffic-summary">Network Traffic Summary</div>
                </div>
            </div>

            <div className="logs-section">
                <h3>Logs and Export</h3>
                <div className="logs-container">
                    <textarea className="logs-viewer" readOnly placeholder="Logs will appear here..."></textarea>
                    <button className="btn export-btn">Export Logs</button>
                </div>
            </div>
        </div>
    );
}

export default IntrusionDetection;
