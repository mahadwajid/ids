import React, { useState } from 'react';
import '../CSS/Preprocessing.css';

function Preprocessing() {
    const [showSummary, setShowSummary] = useState(false);

    const handleApply = () => {
        setShowSummary(true);
    };

    return (
        <div className='Main-container-1'>
            <div className='DatasetFeature'>
    
            <div className='Preprocessing-options'>
                    <h3>Preprocessing Options</h3>
                    <form>
                        <div className="checkbox-option">
                            <input type="checkbox" id="missing-value-handling" />
                            <label htmlFor="missing-value-handling">Missing Value Handling (e.g: Imputation)</label>
                        </div>

                        <div className="checkbox-option">
                            <input type="checkbox" id="feature-scaling" />
                            <label htmlFor="feature-scaling">Feature Scaling (Normalization/Standardization)</label>
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
                            style={{ float: 'right' }}
                        >
                            Apply
                        </button>
                    </form>
                </div>

                <div className="chart-container-1">
                    <h3>DATASET Features</h3>
                    <img
                        src="https://via.placeholder.com/400x200"
                        alt="Dataset Graph"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {showSummary && (
                <div className='Summary-Panel'>
                    <div className='summary-item'>
                        <h4>No. of Features Retained</h4>
                        <p>...</p>
                    </div>
                    <div className='summary-item'>
                        <h4>Percentage of Missing Values Handled</h4>
                        <p>...</p>
                    </div>
                    <div className='chart-container-2'>
                        <h4>Data Distribution Graph</h4>
                        <div className="graph-row">
                            <div className="graph">
                                <h5>Before</h5>
                                <img
                                    src="https://via.placeholder.com/200x150"
                                    alt="Graph Before"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="graph">
                                <h5>After</h5>
                                <img
                                    src="https://via.placeholder.com/200x150"
                                    alt="Graph After"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Preprocessing;
