import sys
import torch
import pandas as pd
import json
import numpy as np
import math
import os
from scipy.stats import entropy
from numpy.linalg import norm
os.environ["OMP_NUM_THREADS"] = "1"

class Generator(torch.nn.Module):
    def __init__(self, latent_dim, output_dim):
        super(Generator, self).__init__()
        self.model = torch.nn.Sequential(
            torch.nn.Linear(latent_dim, 128),
            torch.nn.ReLU(),
            torch.nn.Linear(128, 256),
            torch.nn.ReLU(),
            torch.nn.Linear(256, 512),
            torch.nn.ReLU(),
            torch.nn.Linear(512, output_dim),
            torch.nn.Tanh()
        )

    def forward(self, x):
        return self.model(x)

class Discriminator(torch.nn.Module):
    def __init__(self, input_dim):
        super(Discriminator, self).__init__()
        self.model = torch.nn.Sequential(
            torch.nn.Linear(input_dim, 512),
            torch.nn.LeakyReLU(0.2),
            torch.nn.Linear(512, 256),
            torch.nn.LeakyReLU(0.2),
            torch.nn.Linear(256, 1),
            torch.nn.Sigmoid()
        )

    def forward(self, x):
        return self.model(x)

def calculate_inception_score(generated_samples, n_split=10, eps=1e-16):
    try:
        scores = []
        n_samples = generated_samples.shape[0]
        n_part = math.floor(n_samples / n_split)
        
        for i in range(n_split):
            part = generated_samples[i * n_part:(i + 1) * n_part]
            softmax_preds = torch.nn.functional.softmax(torch.tensor(part), dim=1).numpy()
            py = np.mean(softmax_preds, axis=0)
            scores_for_split = [entropy(pyx, py + eps) for pyx in softmax_preds]
            scores.append(np.exp(np.mean(scores_for_split)))
        
        return float(np.mean(scores))
    except Exception as e:
        sys.stderr.write(f"Error calculating inception score: {str(e)}\n")
        return None

def calculate_cosine_similarity(real_samples, synthetic_samples):
    try:
        cosine_similarities = [
            np.dot(real_sample, synthetic_sample) / (norm(real_sample) * norm(synthetic_sample))
            for real_sample, synthetic_sample in zip(real_samples, synthetic_samples)
        ]
        return np.mean(cosine_similarities)
    except Exception as e:
        sys.stderr.write(f"Error calculating cosine similarity: {str(e)}\n")
        return None

def evaluate_synthetic_samples(real_samples, synthetic_samples):
    try:
        inception_score = calculate_inception_score(synthetic_samples)
        cosine_sim = calculate_cosine_similarity(real_samples, synthetic_samples)
        return {
            "inception_score": inception_score,
            "cosine_similarity": cosine_sim
        }
    except Exception as e:
        sys.stderr.write(f"Error in sample evaluation: {str(e)}\n")
        return None

def load_gan_models(generator_path, discriminator_path, latent_dim, input_dim):
    try:
        generator = Generator(latent_dim, input_dim)
        discriminator = Discriminator(input_dim)
        generator.load_state_dict(torch.load(generator_path, map_location=torch.device('cpu')))
        discriminator.load_state_dict(torch.load(discriminator_path, map_location=torch.device('cpu')))
        generator.eval()
        discriminator.eval()
        return generator, discriminator
    except Exception as e:
        sys.stderr.write(f"Error loading models: {str(e)}\n")
        return None, None

def generate_synthetic_samples(generator, num_samples, latent_dim, num_features):
    try:
        noise = torch.randn(num_samples, latent_dim)
        with torch.no_grad():
            synthetic_features = generator(noise).numpy()
        if synthetic_features.shape[1] != num_features:
            if synthetic_features.shape[1] < num_features:
                padding = np.zeros((synthetic_features.shape[0], num_features - synthetic_features.shape[1]))
                synthetic_features = np.hstack((synthetic_features, padding))
            else:
                synthetic_features = synthetic_features[:, :num_features]
        return synthetic_features
    except Exception as e:
        sys.stderr.write(f"Error generating synthetic samples: {str(e)}\n")
        return None

def balance_dataset(dataset_path, generator, discriminator, latent_dim):
    try:
        df = pd.read_csv(dataset_path)
        original_columns = df.columns.tolist()
        num_features = len(original_columns) - 2
        feature_columns = original_columns[:-2]
        real_samples = df[feature_columns].values
        class_counts = df['attack_cat'].value_counts()
        majority_class_count = class_counts.max()
        balanced_dfs = [df]
        all_synthetic_samples = []
        
        for class_name, count in class_counts.items():
            if count < majority_class_count:
                samples_needed = majority_class_count - count
                synthetic_features = generate_synthetic_samples(generator, samples_needed, latent_dim, num_features)
                if synthetic_features is not None:
                    all_synthetic_samples.extend(synthetic_features)
                    synthetic_df = pd.DataFrame(synthetic_features, columns=feature_columns)
                    synthetic_df['label'] = 1
                    synthetic_df['attack_cat'] = class_name
                    synthetic_df = synthetic_df[original_columns]
                    balanced_dfs.append(synthetic_df)
                else:
                    sys.stderr.write(f"Failed to generate samples for {class_name}\n")
        
        balanced_df = pd.concat(balanced_dfs, ignore_index=True)
        new_counts = balanced_df['attack_cat'].value_counts()
        all_synthetic_samples = np.array(all_synthetic_samples)
        evaluation_metrics = evaluate_synthetic_samples(real_samples, all_synthetic_samples) if len(all_synthetic_samples) > 0 else None
        return balanced_df, class_counts, new_counts, evaluation_metrics
    except Exception as e:
        sys.stderr.write(f"Error in balancing dataset: {str(e)}\n")
        return None, None, None, None

def main():
    try:
        dataset_path = sys.argv[1]
        generator_path = sys.argv[2]
        discriminator_path = sys.argv[3]
        balanced_output_path = sys.argv[4]
        latent_dim = 100
        input_dim = 42
        generator, discriminator = load_gan_models(generator_path, discriminator_path, latent_dim, input_dim)
        if generator is None or discriminator is None:
            result = {"error": "Failed to load models"}
            print(json.dumps(result))
            sys.exit(1)
        balanced_df, original_counts, new_counts, evaluation_metrics = balance_dataset(dataset_path, generator, discriminator, latent_dim)
        if balanced_df is not None:
            balanced_df.to_csv(balanced_output_path, index=False)
            original_summary = {str(k): int(v) for k, v in original_counts.items()}
            balanced_summary = {str(k): int(v) for k, v in new_counts.items()}
            result = {
                "balanced_dataset_path": balanced_output_path,
                "original_summary": original_summary,
                "balanced_summary": balanced_summary,
                "evaluation_metrics": evaluation_metrics,
                "status": "success"
            }
            print(json.dumps(result))
        else:
            result = {"error": "Dataset balancing failed"}
            print(json.dumps(result))
            sys.exit(1)
    except Exception as e:
        result = {"error": "An unexpected error occurred", "details": str(e)}
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()