import React, { useState } from 'react';
import { uploadDataset } from '../Services/API'; // Import the service function
import '../CSS/Home.css';

function Home() {
    const [file, setFile] = useState(null); // State to store selected file
    const [fileName, setFileName] = useState(null); // State to display uploaded file name
    const [fileSize, setFileSize] = useState(null); // State to display file size
    const [dragActive, setDragActive] = useState(false); // State to manage drag-and-drop highlight
    const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
    const [uploadMessage, setUploadMessage] = useState(''); // State to display success/error message
    const [analysis, setAnalysis] = useState(null);

    const handleFileUpload = (event) => {
        event.preventDefault();
        const selectedFile = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile); // Store the file
            setFileName(selectedFile.name); // Display file name
            setFileSize(selectedFile.size); // Display file size
        }
        setDragActive(false); // Remove drag highlight
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragActive(true); // Highlight drop zone
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragActive(false); // Remove drag highlight
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file) {
            setUploadMessage('Please select a file to upload.');
            return;
        }
    
        const formData = new FormData();
        formData.append('dataset', file);
        formData.append('name', fileName);
        formData.append('size', fileSize);
    
        setUploadProgress(0); // Reset progress
    
        try {
            const message = await uploadDataset(formData, (progress) => {
                setUploadProgress(progress); // Update progress state
            });
            setUploadMessage(message); // Display success message
        } catch (error) {
            setUploadMessage(error.message); // Display error message
        }
    };
    

    return (
        <div className="mainhome-1">
            <div className="Heading-home-1">
                <h1>Upload Dataset</h1>
            </div>

            <div
                className={`Uploading-main ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileUpload}
            >
                <label htmlFor="file-upload" className="upload-button">
                    <i className="fa fa-upload"></i> Upload or Drag your files here
                </label>
                <input
                    type="file"
                    id="file-upload"
                    accept=".csv, .txt, .doc, .pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }} // Hide the input but keep it functional
                />
                {fileName && (
                    <p className="upload-info">
                        File Selected: <strong>{fileName}</strong>
                    </p>
                )}
            </div>

            <button className="upload-submit" onClick={handleUpload}>
                Upload
            </button>

            {uploadProgress > 0 && (
                <div className="progress-bar">
                    <div
                        className="progress"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {uploadMessage && (
                <p className="upload-info">
                    <strong>{uploadMessage}</strong>
                </p>
            )}
        </div>
    );
}

export default Home;
