import pandas as pd
import sys
import json

def analyze_dataset(file_path):
    try:
        df = pd.read_csv(file_path)

        # Basic analysis
        dataset_name = file_path.split("/")[-1]
        dataset_type = "Imbalanced" if df[df.columns[-1]].value_counts().std() > 100 else "Balanced"
        size_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
        no_of_attributes = len(df.columns) - 1  # Exclude target column
        total_samples = len(df)

        # Identify target column (assuming the target is categorical)
        target_column = None
        for column in df.columns:
            if df[column].dtype == 'object' or df[column].dtype == 'category':  # Check if the column is categorical
                target_column = column
                break

        if not target_column:
            return {"error": "No categorical target column found in the dataset."}

        # Analyze classes
        class_counts = df[target_column].value_counts().to_dict()
        no_of_classes = len(class_counts)
        samples_per_class = class_counts  # This is a dictionary with class label counts

        # Automatically determine "Normal" class (the class with the highest sample count)
        sorted_classes = sorted(class_counts.items(), key=lambda x: x[1], reverse=True)
        
        # First item is assumed to be "Normal" class, the rest are attack classes
        normal_class, normal_count = sorted_classes[0]
        attack_classes = sorted_classes[1:]  # All remaining classes are considered attack classes
        
        # Count the total number of attack samples (sum of counts of all attack classes)
        no_of_attack_samples = sum([count for _, count in attack_classes])
        no_of_normal_samples = normal_count

        # Prepare analysis summary
        analysis = {
            "DatasetName": dataset_name,
            "DatasetType": dataset_type,
            "Size(KB)": size_kb,
            "NoOfAttributes": no_of_attributes,
            "NoOfClasses": no_of_classes,
            "TotalSamples": total_samples,
            "SamplesPerClass": samples_per_class,
            "NoofNormalSamples": no_of_normal_samples,
            "NoofAttackSamples": no_of_attack_samples,
            "NormalClass": normal_class,
            "AttackClasses": [attack_class for attack_class, _ in attack_classes]
        }

        return analysis

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = analyze_dataset(file_path)
    print(json.dumps(result))
