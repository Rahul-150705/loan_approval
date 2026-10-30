
import joblib
from pathlib import Path

model_dir = Path("models")

model = joblib.load(model_dir / "loan_rf_model.joblib")
scaler = joblib.load(model_dir / "scaler.joblib")
feature_columns = joblib.load(model_dir / "feature_columns.joblib")
num_cols = joblib.load(model_dir / "num_cols.joblib")

print("Model:", type(model).__name__)
print("Scaler:", type(scaler).__name__)
print("Feature columns:", feature_columns)
print("Numeric columns:", num_cols)
print("\nAll model files loaded successfully!")