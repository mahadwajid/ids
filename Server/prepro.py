import sys
import json
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer

def preprocess_dataset(missingValueHandling, featureScaling, encodingCategorical, featureSelection, dataset_path):
    try:
        # Load the dataset
        df = pd.read_csv(dataset_path)

        # Separate numeric and non-numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        non_numeric_cols = df.select_dtypes(exclude=["number"]).columns.tolist()

        # Handle missing values for numeric columns
        if missingValueHandling:
            if numeric_cols:
                imputer = SimpleImputer(strategy="mean")
                df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

            # Handle missing values for non-numeric columns
            if non_numeric_cols:
                imputer = SimpleImputer(strategy="most_frequent")
                df[non_numeric_cols] = imputer.fit_transform(df[non_numeric_cols])

        # Encode categorical variables
        if encodingCategorical and non_numeric_cols:
            df = pd.get_dummies(df, columns=non_numeric_cols)

        # Feature scaling for numeric columns
        if featureScaling and numeric_cols:
            scaler = StandardScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

        # Feature selection or PCA
        if featureSelection:
            pca = PCA(n_components=0.95)  # Retain 95% variance
            df = pd.DataFrame(pca.fit_transform(df))

        # Prepare response with feature names
        response = {
            "processedDatasetPreview": df.head().to_dict(),
            "missingValueHandled": missingValueHandling,
            "featureScalingApplied": featureScaling,
            "categoricalEncodingApplied": encodingCategorical,
            "featureSelectionApplied": featureSelection,
            "summary": "Preprocessing completed successfully.",
            "numericFeatureNames": numeric_cols,
            "nonNumericFeatureNames": non_numeric_cols,
        }

        return response

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    dataset_path = sys.argv[1]
    options = json.loads(sys.argv[2])
    result = preprocess_dataset(**options, dataset_path=dataset_path)
    print(json.dumps(result))
