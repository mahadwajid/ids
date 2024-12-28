import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Use import for path
import { fileURLToPath } from "url";
import connectDB from "./Connection.js"; // Ensure this matches the export in Connection.js
import authRoutes from "./Routes/authRoutes.js";
import datasetRoutes from "./Routes/datasetRoutes.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve routes
app.use("/", authRoutes);
app.use("/datasets", datasetRoutes);
app.use("/graphs", express.static(path.join(__dirname, "graphs"))); // Serve the 'graphs' directory

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
