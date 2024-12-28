import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import Dataset from "../Models/Dataset.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const preprocessDataset = async (req, res) => {
  try {
    const {
      missingValueHandling,
      featureScaling,
      encodingCategorical,
      featureSelection,
      dataset,
    } = req.body;

    const datasetRecord = await Dataset.findOne({ name: dataset });
    if (!datasetRecord) {
      return res.status(400).json({ error: `Dataset not found: ${dataset}` });
    }

    const uploadsDir = path.resolve("uploads");
    const datasetPath = path.resolve(uploadsDir, datasetRecord.path);

    if (!fs.existsSync(datasetPath)) {
      return res.status(400).json({ error: `Dataset file not found: ${dataset}` });
    }

    const options = JSON.stringify({
      missingValueHandling,
      featureScaling,
      encodingCategorical,
      featureSelection,
    });
    const escapedOptions = options.replace(/"/g, '\\"');

    const pythonScript = path.resolve(__dirname, "../prepro.py");
    const command = `python "${pythonScript}" "${datasetPath}" "${escapedOptions}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`[ERROR] Preprocessing Failed: ${stderr}`);
        return res.status(500).json({ error: "Python script execution failed", details: stderr });
      }

      try {
        const jsonOutput = stdout.split("\n").find((line) => line.startsWith("{"));
        if (!jsonOutput) throw new Error("No valid JSON output from Python script.");
        const output = JSON.parse(jsonOutput);
        res.status(200).json(output);
      } catch (parseErr) {
        console.error(`[ERROR] Parsing Output Failed: ${parseErr.message}`);
        res.status(500).json({ error: "Failed to parse Python output", details: parseErr.message });
      }
    });
  } catch (err) {
    console.error(`[ERROR] Internal Server Error: ${err.message}`);
    res.status(500).json({ error: "Preprocessing failed", details: err.message });
  }
};
