import express from 'express';
import multer from 'multer';
import { uploadDataset, getAllDatasets } from '../Controllers/datasetController.js';

const router = express.Router();

// Configure Multer for Temporary File Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in an "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('dataset'), uploadDataset); // Handle file uploads
router.get('/retrive', getAllDatasets);

export default router;