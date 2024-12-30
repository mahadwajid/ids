import { execFile } from "child_process";
import Dataset from "../Models/Dataset.js";
import path from "path";
import fs from "fs/promises";

export const balanceDatasetWithGAN = async (req, res) => {
    try {
        const dataset = await Dataset.findOne({ preprocessedPath: { $exists: true } }).sort({ uploadedAt: -1 });
        
        if (!dataset) {
            console.error("No preprocessed dataset found in the database.");
            return res.status(404).json({ error: "No preprocessed dataset found" });
        }

        let datasetPath = path.resolve(dataset.preprocessedPath);
        
        if (!await fileExists(datasetPath)) {
            datasetPath = path.resolve("uploads", path.basename(dataset.preprocessedPath));
            
            if (!await fileExists(datasetPath)) {
                console.error(`Dataset file not found at path: ${datasetPath}`);
                return res.status(400).json({ error: "Dataset file not found" });
            }
        }

        const ganScriptPath = path.resolve("E:/7th Semester/ids/Server/GANBalancing.py");
        const generatorPath = path.resolve("E:/7th Semester/ids/Server/GANModel/gan_generator.pth");
        const discriminatorPath = path.resolve("E:/7th Semester/ids/Server/GANModel/gan_discriminator.pth");

        if (!await fileExists(generatorPath) || !await fileExists(discriminatorPath)) {
            console.error("GAN model files missing.");
            return res.status(500).json({ error: "GAN model files missing" });
        }

        const balancedOutputPath = datasetPath.replace(".csv", "_balanced.csv");

        execFile(
            "python",
            [ganScriptPath, datasetPath, generatorPath, discriminatorPath, balancedOutputPath],
            { 
                env: { ...process.env, KMP_DUPLICATE_LIB_OK: "TRUE" },
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            },
            async (error, stdout, stderr) => {
                if (error) {
                    console.error("Error executing GAN script:", stderr);
                    return res.status(500).json({ 
                        error: "GAN script execution failed", 
                        details: stderr 
                    });
                }

                if (stderr) {
                    console.warn("GAN script warnings:", stderr);
                }

                try {
                    // Clean up the stdout to get only the JSON output
                    const output = stdout.trim();
                    const result = JSON.parse(output);

                    if (result.error) {
                        return res.status(500).json(result);
                    }

                    // Verify the balanced dataset was created
                    if (await fileExists(balancedOutputPath)) {
                        res.status(200).json({
                            message: "Dataset balanced successfully",
                            ...result
                        });
                    } else {
                        res.status(500).json({ 
                            error: "Balanced dataset file was not created",
                            details: result
                        });
                    }
                } catch (parseError) {
                    console.error("Error parsing GAN script output:", parseError);
                    console.error("Raw output:", stdout);
                    res.status(500).json({ 
                        error: "Failed to parse GAN results",
                        details: parseError.message,
                        rawOutput: stdout
                    });
                }
            }
        );        
        
    } catch (err) {
        console.error("Error in GAN controller:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
};

const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        console.error(`File not found at path: ${filePath}`, err);
        return false;
    }
};