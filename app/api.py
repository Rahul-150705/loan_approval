"""
Flask REST API for the Loan Approval ML model.
Runs on port 8000, separate from the Streamlit app.
Start with: python api.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))

model = joblib.load(os.path.join(MODELS_DIR, "loan_rf_model.joblib"))
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
feature_columns = joblib.load(os.path.join(MODELS_DIR, "feature_columns.joblib"))
num_cols = joblib.load(os.path.join(MODELS_DIR, "num_cols.joblib"))

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])


def build_model_row(data: dict) -> pd.DataFrame:
    raw = pd.DataFrame([{
        "Gender": data.get("Gender", "Male"),
        "Married": data.get("Married", "No"),
        "Dependents": data.get("Dependents", "0"),
        "Education": data.get("Education", "Graduate"),
        "Self_Employed": data.get("Self_Employed", "No"),
        "ApplicantIncome": float(data.get("ApplicantIncome", 5000)),
        "CoapplicantIncome": float(data.get("CoapplicantIncome", 0)),
        "LoanAmount": float(data.get("LoanAmount", 120000)),
        "Loan_Amount_Term": float(data.get("Loan_Amount_Term", 360)),
        "Credit_History": int(data.get("Credit_History", 1)),
        "Property_Area": data.get("Property_Area", "Urban"),
    }])

    bin_maps = {
        "Gender": {"Male": 1, "Female": 0},
        "Married": {"Yes": 1, "No": 0},
        "Education": {"Graduate": 1, "Not Graduate": 0},
        "Self_Employed": {"Yes": 1, "No": 0},
    }
    for c, m in bin_maps.items():
        if c in raw.columns:
            raw[c] = raw[c].map(m)

    if "Dependents" in raw.columns:
        raw["Dependents"] = raw["Dependents"].replace("3+", "3").astype(int)

    raw = pd.get_dummies(raw, columns=["Property_Area"], drop_first=True)

    for col in feature_columns:
        if col not in raw.columns:
            raw[col] = 0

    raw = raw[feature_columns]
    raw_scaled = raw.copy()
    if len(num_cols) > 0:
        raw_scaled[num_cols] = scaler.transform(raw_scaled[num_cols])

    return raw_scaled


def apply_approval_guardrails(pred, proba, data):
    applicant_income = float(data.get("ApplicantIncome", 0))
    coapplicant_income = float(data.get("CoapplicantIncome", 0))
    loan_amount = float(data.get("LoanAmount", 0))
    credit_history = int(data.get("Credit_History", 0))

    total_income = applicant_income + coapplicant_income
    loan_to_income = loan_amount / total_income if total_income > 0 else float("inf")

    if credit_history != 1:
        return False, "Rejected: credit history must be good to qualify."
    if total_income < 4000:
        return False, "Rejected: total household income is below the minimum approval threshold."
    if loan_amount > total_income * 15:
        return False, "Rejected: requested loan is above the strict affordability limit for this income level."
    if proba is not None and proba < 0.50:
        return False, "Rejected: model confidence is below the 50% approval threshold."
    if pred != 1:
        return False, "Rejected: model score does not meet the approval boundary."

    return True, "Approved: applicant meets the strict income and affordability criteria."


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        X = build_model_row(data)
        pred = model.predict(X)[0]

        proba = None
        try:
            proba = model.predict_proba(X)[0][1]
        except Exception:
            pass

        approved, reason = apply_approval_guardrails(pred, proba, data)

        return jsonify({
            "approved": approved,
            "reason": reason,
            "probability": float(proba) if proba is not None else None,
            "prediction": int(pred),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "loan_rf_model"})


if __name__ == "__main__":
    print("🚀 LoanSmart API running on http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=True)
