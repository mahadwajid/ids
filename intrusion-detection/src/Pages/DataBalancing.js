import React, { useState } from 'react';
import '../CSS/DataBalancing.css';

function DataBalancing() {
    const [options, setOptions] = useState({
        GANS: false,
        Oversampling: false,
        Undersampling: false,
        ClassWeightAdjustment: false,
    });

    const [showSummary, setShowSummary] = useState(false);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setOptions((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handleApply = () => {
        console.log('Selected Options:', options);
        setShowSummary(true);
    };

    return (
        <div className="Data-main-container">
            <h2>Data Balancing Options</h2>
            <div className="DataBalancing-options">
                <form>
                    <div className="checkbox-option">
                        <input
                            type="checkbox"
                            id="gans"
                            name="GANS"
                            checked={options.GANS}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="gans">GANS</label>
                    </div>
                    <div className="checkbox-option">
                        <input
                            type="checkbox"
                            id="oversampling"
                            name="Oversampling"
                            checked={options.Oversampling}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="oversampling">Oversampling</label>
                    </div>
                    <div className="checkbox-option">
                        <input
                            type="checkbox"
                            id="undersampling"
                            name="Undersampling"
                            checked={options.Undersampling}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="undersampling">Undersampling</label>
                    </div>
                    <div className="checkbox-option">
                        <input
                            type="checkbox"
                            id="class-weight-adjustment"
                            name="ClassWeightAdjustment"
                            checked={options.ClassWeightAdjustment}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="class-weight-adjustment">Class Weight Adjustment</label>
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

            {showSummary && (
                <div className="Summary-Databalancing">
                    <h3>Balancing Summary</h3>
                    <div className="graph-section">
                        <div className="graph">
                            <h4>Before Balancing</h4>
                            <img
                                src="https://via.placeholder.com/300x200"
                                alt="Graph Before"
                            />
                        </div>
                        <div className="graph">
                            <h4>After Balancing</h4>
                            <img
                                src="https://via.placeholder.com/300x200"
                                alt="Graph After"
                            />
                        </div>
                    </div>
                    <div className="summary-info">
                        <div className="info-item">
                            <h4>No. of Samples Added/Removed</h4>
                            <p>...</p>
                        </div>
                        <div className="info-item">
                            <h4>Balancing Method Applied</h4>
                            <p>{Object.keys(options).filter((key) => options[key]).join(', ') || 'None'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataBalancing;
