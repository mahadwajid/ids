import React, { useState } from 'react';
import '../CSS/DataBalancing.css';
import { fetchAndBalanceDataset } from '../Services/API';

function DataBalancing() {
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const handleBalanceDataset = async () => {
        setLoading(true);
        try {
            const result = await fetchAndBalanceDataset();
            setSummary(result);
            setShowSummary(true);
        } catch (error) {
            console.error('Error balancing dataset:', error);
            alert('An error occurred while processing the dataset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Data-main-container">
            <h2>Apply GAN Balancing</h2>
            <button onClick={handleBalanceDataset} disabled={loading}>
                {loading ? 'Processing...' : 'Fetch & Balance Dataset'}
            </button>

            {showSummary && (
                <div className="Summary-Databalancing">
                    <h3>Balancing Summary</h3>
                    <p><strong>Original Distribution:</strong> {JSON.stringify(summary.original_summary)}</p>
                    <p><strong>Balanced Distribution:</strong> {JSON.stringify(summary.balanced_summary)}</p>
                    <p><strong>Inception Score:</strong> {summary.inception_score}</p>
                    <p><strong>Distance:</strong> {summary.distance}</p>
                </div>
            )}
        </div>
    );
}

export default DataBalancing;
