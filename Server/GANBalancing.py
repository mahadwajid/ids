import sys
import torch
import pandas as pd
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
os.environ["OMP_NUM_THREADS"] = "1"


# Define the Generator model
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

# Define the Discriminator model
class Discriminator(torch.nn.Module):
    def __init__(self, input_dim):
        super(Discriminator, self).__init__()
        self.model = torch.nn.Sequential(
            torch.nn.Linear(input_dim, 512),
            torch.nn.LeakyReLU(0.2),
            torch.nn.Linear(512, 256),
            torch.nn.LeakyReLU(0.2),
            torch.nn.Linear(256, 128),
            torch.nn.LeakyReLU(0.2),
            torch.nn.Linear(128, 1),
            torch.nn.Sigmoid()
        )

    def forward(self, x):
        return self.model(x)

# Load GAN models
def load_gan_models(generator_path, discriminator_path, latent_dim, input_dim):
    generator = Generator(latent_dim, input_dim)
    generator.load_state_dict(torch.load(generator_path, map_location=torch.device('cpu')))
    generator.eval()

    discriminator = Discriminator(input_dim)
    discriminator.load_state_dict(torch.load(discriminator_path, map_location=torch.device('cpu')))
    discriminator.eval()

    return generator, discriminator

# Balance dataset
def balance_dataset(dataset_path, generator, discriminator, latent_dim):
    df = pd.read_csv(dataset_path)
    class_counts = df['attack_cat'].value_counts()
    target_count = class_counts.max()
    minority_classes = class_counts[class_counts < target_count].index.tolist()

    balanced_df = df.copy()
    distances = []

    for minority_class in minority_classes:
        minority_samples = df[df['attack_cat'] == minority_class]
        samples_to_generate = target_count - len(minority_samples)
        noise = torch.randn((samples_to_generate, latent_dim))
        synthetic_samples = generator(noise).detach()
        real_samples = torch.tensor(minority_samples.iloc[:, :-2].values, dtype=torch.float32)
        distances.append(np.linalg.norm(real_samples - synthetic_samples[:len(real_samples)], axis=1).mean())
        selected_samples = synthetic_samples.numpy()
        synthetic_df = pd.DataFrame(selected_samples, columns=df.columns[:-2])
        synthetic_df['label'] = 1
        synthetic_df['attack_cat'] = minority_class
        balanced_df = pd.concat([balanced_df, synthetic_df], ignore_index=True)

    return balanced_df, class_counts, balanced_df['attack_cat'].value_counts(), np.mean(distances)

if __name__ == "__main__":
    dataset_path = sys.argv[1]
    generator_path = sys.argv[2]
    discriminator_path = sys.argv[3]
    latent_dim = int(sys.argv[4])
    input_dim = int(sys.argv[5])
    balanced_output_path = sys.argv[6]

    generator, discriminator = load_gan_models(generator_path, discriminator_path, latent_dim, input_dim)
    balanced_df, original_counts, new_counts, avg_distance = balance_dataset(dataset_path, generator, discriminator, latent_dim)

    balanced_df.to_csv(balanced_output_path, index=False)

    result = {
        "balanced_dataset_path": balanced_output_path,
        "original_summary": original_counts.to_dict(),
        "balanced_summary": new_counts.to_dict(),
        "distance": avg_distance,
    }
    print(json.dumps(result))
