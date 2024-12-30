import sys
import json
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.impute import SimpleImputer

def preprocess_dataset(
    missingValueHandling, featureScaling, encodingCategorical, featureSelection, dataset_path, output_path
):
    try:
        # Load the dataset
        df = pd.read_csv(dataset_path)

        # Standardize column names by stripping and converting to lowercase
        df.columns = df.columns.str.strip().str.lower()
        print(f"Columns in Dataset: {list(df.columns)}")  # Debugging: Show column names

        # Replace infinite values with NaN
        df.replace([float('inf'), float('-inf')], float('nan'), inplace=True)

        # Drop the 'id' column if it exists
        if 'id' in df.columns:
            df = df.drop(columns=['id'])
            print("Removed 'id' column.")

        # Separate target labels if present
        target_columns = [col for col in df.columns if col in ['attack_cat', 'label']]
        print(f"Identified Target Columns: {target_columns}")  # Debugging

        targets = df[target_columns] if target_columns else None
        df = df.drop(columns=target_columns, errors='ignore')

        # Identify numeric and non-numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        non_numeric_cols = df.select_dtypes(exclude=["number"]).columns.tolist()
        print(f"Numeric Columns: {numeric_cols}")
        print(f"Non-Numeric Columns: {non_numeric_cols}")

        # Original missing values
        original_missing_values = df.isna().sum()

        # Handle missing values
        if missingValueHandling:
            if numeric_cols:
                imputer = SimpleImputer(strategy="mean")
                df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

            if non_numeric_cols:
                imputer = SimpleImputer(strategy="most_frequent")
                df[non_numeric_cols] = imputer.fit_transform(df[non_numeric_cols])

        # Missing values after preprocessing
        missing_values_after = df.isna().sum()

        # Encode categorical variables with Label Encoding
        encoding_summary = {}
        if encodingCategorical and non_numeric_cols:
            label_encoders = {}
            for col in non_numeric_cols:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col])
                label_encoders[col] = dict(zip(le.classes_, le.transform(le.classes_)))
                encoding_summary[col] = f"Encoded {len(le.classes_)} unique values"

        # Feature selection using SelectKBest with chi2 (including all columns)
        feature_selection_summary = {}
        selected_features = []
        if featureSelection and targets is not None:
            # Ensure all columns are non-negative for chi2
            all_cols = numeric_cols + non_numeric_cols  # Include all columns
            df[all_cols] = df[all_cols].apply(lambda x: x - x.min() if x.min() < 0 else x)

            target = targets[target_columns[0]]  # Assuming the first target column is used
            selector = SelectKBest(score_func=chi2, k=42)  # Select top 42 features

            # Apply feature selection
            selector.fit(df[all_cols], target)

            selected_features = [all_cols[i] for i in selector.get_support(indices=True)]
            feature_selection_summary = {
                feature: score for feature, score in zip(selected_features, selector.scores_)
            }

            # Retain only the selected features
            df = df[selected_features]

        # Feature scaling for selected features (last step)
        scaling_summary = {}
        if featureScaling and selected_features:
            scaler = StandardScaler()
            df_scaled = scaler.fit_transform(df[selected_features])
            scaled_data = pd.DataFrame(df_scaled, columns=selected_features)

            # Output only the scaled mean and scaled std for each selected feature
            for col in selected_features:
                scaling_summary[col] = {
                    "Scaled Mean": scaled_data[col].mean(),  # Only output the scaled mean
                    "Scaled Std": scaled_data[col].std()     # Only output the scaled std
                }
            df = scaled_data

        # Concatenate targets back to the processed dataset
        if targets is not None:
            df = pd.concat([df, targets.reset_index(drop=True)], axis=1)

        # Save the preprocessed dataset to the output path
        df.to_csv(output_path, index=False)

        # Prepare response summaries
        response = {
            "missingValueSummary": {
                "Original Missing Values": original_missing_values.to_dict(),
                "After Preprocessing": missing_values_after.to_dict()
            },
            "featureScalingSummary": scaling_summary,
            "encodingSummary": encoding_summary,
            "featureSelectionSummary": feature_selection_summary,
            "selectedFeatures": selected_features,
            "preprocessedFilePath": output_path
        }

        return response

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    dataset_path = sys.argv[1]
    options = json.loads(sys.argv[2])
    output_path = sys.argv[3]

    result = preprocess_dataset(**options, dataset_path=dataset_path, output_path=output_path)
    print(json.dumps(result))
