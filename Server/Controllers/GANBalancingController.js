import { execFile } from "child_process";
import Dataset from "../Models/Dataset.js";
import path from "path";
import fs from "fs/promises";

export const balanceDatasetWithGAN = async (req, res) => {
    try {
        const dataset = await Dataset.findOne({ preprocessedPath: { $exists: true } }).sort({ uploadedAt: -1 });
        if (!dataset) return res.status(404).json({ error: "No preprocessed dataset found" });

        let datasetPath = path.resolve(dataset.preprocessedPath);
        if (!await fileExists(datasetPath)) datasetPath = path.resolve("uploads", path.basename(dataset.preprocessedPath));
        if (!await fileExists(datasetPath)) return res.status(400).json({ error: "Dataset file not found" });

        const ganScriptPath = path.resolve("GANBalancing.py");
        const generatorPath = path.resolve("GANModel", "gan_generator.pth");
        const discriminatorPath = path.resolve("GANModel", "gan_discriminator.pth");

        if (!await fileExists(generatorPath) || !await fileExists(discriminatorPath))
            return res.status(500).json({ error: "GAN model files missing" });

        const latentDim = 100;
        const inputDim = 42;
        const balancedOutputPath = datasetPath.replace(".csv", "_balanced.csv");

        execFile(
            "python",
            [ganScriptPath, datasetPath, generatorPath, discriminatorPath, latentDim, inputDim, balancedOutputPath],
            { env: { ...process.env, KMP_DUPLICATE_LIB_OK: "TRUE" } }, // Add the environment variable
            (error, stdout, stderr) => {
                if (error) {
                    console.error("Error executing GAN script:", stderr);
                    return res.status(500).json({ error: "GAN script execution failed", details: stderr });
                }
                try {
                    const result = JSON.parse(stdout);
                    res.status(200).json({
                        message: "Dataset balanced successfully",
                        ...result,
                    });
                } catch (parseError) {
                    console.error("Error parsing JSON output:", parseError);
                    res.status(500).json({ error: "Failed to parse GAN results" });
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
    } catch {
        return false;
    }
};
