import sys
import json
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer

def preprocess_dataset(
    missingValueHandling, featureScaling, encodingCategorical, featureSelection, dataset_path, output_path
):
    try:
        # Load the dataset
        df = pd.read_csv(dataset_path)

        # Strip leading and trailing spaces from column names
        df.columns = df.columns.str.strip()

        # Replace infinite values with NaN
        df.replace([float('inf'), float('-inf')], float('nan'), inplace=True)

        # Separate target labels if present
        target_columns = [col for col in df.columns if col.strip().lower() in ['attack_cat', 'label']]
        targets = df[target_columns] if target_columns else None
        df = df.drop(columns=target_columns, errors='ignore')

        # Identify numeric and non-numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        non_numeric_cols = df.select_dtypes(exclude=["number"]).columns.tolist()

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

        # Feature scaling for numeric columns
        scaling_summary = {}
        if featureScaling and numeric_cols:
            scaler = StandardScaler()
            for col in numeric_cols:
                scaling_summary[col] = {
                    "Original Mean": df[col].mean(),
                    "Original Std": df[col].std()
                }
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            for col in numeric_cols:
                scaling_summary[col].update({
                    "Scaled Mean": df[col].mean(),
                    "Scaled Std": df[col].std()
                })

        # Feature selection or PCA
        feature_selection_summary = {}
        if featureSelection:
            numeric_data = df.select_dtypes(include=["number"])
            if numeric_data.shape[1] > 0:
                pca = PCA(n_components=0.95)  # Retain 95% variance
                df_pca = pd.DataFrame(pca.fit_transform(numeric_data), columns=[
                    f"PC{i+1}" for i in range(pca.n_components_)
                ])
                explained_variance = pca.explained_variance_ratio_
                feature_selection_summary = {
                    f"PC{i+1}": f"{round(var * 100, 2)}% variance explained"
                    for i, var in enumerate(explained_variance)
                }
                df = pd.concat([df_pca, df.drop(columns=numeric_cols, errors="ignore")], axis=1)

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
            "numericFeatureNames": numeric_cols,
            "nonNumericFeatureNames": non_numeric_cols,
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
