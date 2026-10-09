import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

# ---------- Stable paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))

# ---------- Load artifacts ----------
model = joblib.load(os.path.join(MODELS_DIR, "loan_rf_model.joblib"))
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
feature_columns = joblib.load(os.path.join(MODELS_DIR, "feature_columns.joblib"))
num_cols = joblib.load(os.path.join(MODELS_DIR, "num_cols.joblib"))  # columns scaled during training

st.set_page_config(page_title="Loan Approval Predictor", page_icon="💼", layout="wide")

st.markdown("""
<style>
    .main {
        background: linear-gradient(180deg, #f5f7ff 0%, #edf4ff 100%);
    }
    .top-header {
        background: linear-gradient(135deg, #0b1220 0%, #0f3d91 50%, #2563eb 100%);
        padding: 1.5rem 1.6rem;
        border-radius: 22px;
        color: white;
        margin-bottom: 1.2rem;
        box-shadow: 0 16px 30px rgba(37, 99, 235, 0.18);
    }
    .brand-badge {
        display: inline-block;
        padding: 0.35rem 0.7rem;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 999px;
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
        margin-bottom: 0.6rem;
    }
    .status-card {
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
        background: #ffffff;
        border: 1px solid #dfe8f8;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
        margin-top: 1rem;
    }
    .rule-box {
        background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        border: 1px solid #dfe8f8;
        border-radius: 16px;
        padding: 0.9rem 1rem;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    }
    .metric-box {
        background: #ffffff;
        border-radius: 16px;
        padding: 1rem;
        border: 1px solid #dfe8f8;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
        height: 100%;
    }
    .stForm {
        background: rgba(255,255,255,0.7);
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 1rem;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
    }
    .block-container {
        padding-top: 1.2rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="top-header">
    <div class="brand-badge">Smart Finance</div>
    <h2 style="margin:0; font-size:2rem;">Loan Approval Decision System</h2>
    <p style="margin:0.5rem 0 0 0; color:#dbeafe;">Responsible lending with strict eligibility checks</p>
</div>
""", unsafe_allow_html=True)

st.caption("Complete applicant profile review and decision support for secure lending.")

st.sidebar.title("Decision Policy")
st.sidebar.markdown("""
<div class="rule-box">
<ul>
<li>Income threshold: ₹4,000+ combined household income</li>
<li>Credit history must be fully satisfactory</li>
<li>Requested loan must not exceed 15× income</li>
<li>Approval confidence must be at least 50%</li>
</ul>
</div>
""", unsafe_allow_html=True)

metric_col1, metric_col2, metric_col3 = st.columns(3)
with metric_col1:
    st.markdown("<div class='metric-box'><h4>Fast Review</h4><p>Real-time applicant screening</p></div>", unsafe_allow_html=True)
with metric_col2:
    st.markdown("<div class='metric-box'><h4>Risk Control</h4><p>Strict affordability checks</p></div>", unsafe_allow_html=True)
with metric_col3:
    st.markdown("<div class='metric-box'><h4>Decision Support</h4><p>AI + policy-based review</p></div>", unsafe_allow_html=True)

# ---------- Input Form ----------
with st.form("loan_form"):
    col1, col2 = st.columns(2)

    with col1:
        Gender = st.selectbox("Gender", ["Male", "Female"])
        Married = st.selectbox("Married", ["No", "Yes"])
        Dependents = st.selectbox("Dependents", ["0", "1", "2", "3+"])
        Education = st.selectbox("Education", ["Graduate", "Not Graduate"])
        Self_Employed = st.selectbox("Self Employed", ["No", "Yes"])
        Property_Area = st.selectbox("Property Area", ["Rural", "Semiurban", "Urban"])

    with col2:
        ApplicantIncome = st.number_input("Applicant Income", min_value=0, step=100, value=5000)
        CoapplicantIncome = st.number_input("Coapplicant Income", min_value=0, step=100, value=0)
        LoanAmount = st.number_input("Loan Amount", min_value=0, step=1000, value=120000)
        Loan_Term_Years = st.number_input("Loan Term (in years)", min_value=1, max_value=30, step=1, value=30)
        Credit_History = st.selectbox("Credit History", [1, 0])  # 1=good, 0=bad

    Loan_Amount_Term = Loan_Term_Years * 12

    submitted = st.form_submit_button("Predict")

# ---------- Build row exactly like training ----------
def build_model_row():
    # Start with raw dict
    raw = pd.DataFrame([{
        "Gender": Gender,
        "Married": Married,
        "Dependents": Dependents,
        "Education": Education,
        "Self_Employed": Self_Employed,
        "ApplicantIncome": ApplicantIncome,
        "CoapplicantIncome": CoapplicantIncome,
        "LoanAmount": LoanAmount,
        "Loan_Amount_Term": Loan_Amount_Term,
        "Credit_History": Credit_History,
        "Property_Area": Property_Area,
    }])

    # Binary maps (must match notebook)
    bin_maps = {
        "Gender": {"Male": 1, "Female": 0},
        "Married": {"Yes": 1, "No": 0},
        "Education": {"Graduate": 1, "Not Graduate": 0},
        "Self_Employed": {"Yes": 1, "No": 0},
    }
    for c, m in bin_maps.items():
        if c in raw.columns:
            raw[c] = raw[c].map(m)

    # Dependents: "3+" -> 3 (int)
    if "Dependents" in raw.columns:
        raw["Dependents"] = raw["Dependents"].replace("3+", "3").astype(int)

    # One-hot encode ONLY Property_Area (drop_first=True to match training)
    raw = pd.get_dummies(raw, columns=["Property_Area"], drop_first=True)

    # Ensure every expected column exists; missing -> 0
    for col in feature_columns:
        if col not in raw.columns:
            raw[col] = 0

    # Reorder to exact training feature order
    raw = raw[feature_columns]

    # Scale ONLY training numeric columns
    raw_scaled = raw.copy()
    if len(num_cols) > 0:
        raw_scaled[num_cols] = scaler.transform(raw_scaled[num_cols])

    return raw_scaled

# ---------- Strict business guardrails ----------
def apply_approval_guardrails(pred, proba, applicant_income, coapplicant_income, loan_amount, credit_history):
    total_income = float(applicant_income) + float(coapplicant_income)
    loan_value = float(loan_amount)
    loan_to_income_ratio = loan_value / total_income if total_income > 0 else float("inf")

    # Strict limits to prevent approvals for low-income / oversized loans.
    if credit_history != 1:
        return False, "Rejected: credit history must be good to qualify."
    if total_income < 4000:
        return False, "Rejected: total household income is below the minimum approval threshold."
    if loan_value > total_income * 15:
        return False, "Rejected: requested loan is above the strict affordability limit for this income level."
    if proba is not None and proba < 0.50:
        return False, "Rejected: model confidence is below the 50% approval threshold."
    if pred != 1:
        return False, "Rejected: model score does not meet the approval boundary."

    return True, "Approved: applicant meets the strict income and affordability criteria."

# ---------- Predict ----------
if submitted:
    try:
        X_one = build_model_row()
        pred = model.predict(X_one)[0]
        proba = None
        try:
            proba = model.predict_proba(X_one)[0][1]
        except Exception:
            pass

        approved, reason = apply_approval_guardrails(
            pred=pred,
            proba=proba,
            applicant_income=ApplicantIncome,
            coapplicant_income=CoapplicantIncome,
            loan_amount=LoanAmount,
            credit_history=Credit_History,
        )

        st.markdown("<div class='status-card'>", unsafe_allow_html=True)
        if approved:
            st.success("✅ Prediction: **Loan Approved**")
        else:
            st.error("❌ Prediction: **Loan Rejected**")

        if proba is not None:
            st.caption(f"Approval probability: {proba:.2%}")
        st.caption(reason)
        st.markdown("</div>", unsafe_allow_html=True)

        # Debug toggle (uncomment if needed)
        # st.write("Feature columns used by model:", feature_columns)
        # st.write("Row columns sent to model:", list(X_one.columns))

    except Exception as e:
        st.exception(e)
        st.warning("Input preparation failed. Check that notebook encoding/scaling matches the app.")
