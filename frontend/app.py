import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

# ---------- Stable paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODELS_DIR = os.path.join(PROJECT_DIR, "models")

# ---------- Load artifacts ----------
model = joblib.load(os.path.join(MODELS_DIR, "loan_rf_model.joblib"))
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
feature_columns = joblib.load(os.path.join(MODELS_DIR, "feature_columns.joblib"))
num_cols = joblib.load(os.path.join(MODELS_DIR, "num_cols.joblib"))

st.set_page_config(page_title="Loan application review", page_icon="💼", layout="wide")

st.markdown("""
<style>
    :root {
        --ink: #202a25;
        --muted: #66736c;
        --line: #dce4df;
        --paper: #ffffff;
        --canvas: #f5f8f6;
        --accent: #176b59;
        --accent-dark: #105545;
    }
    .stApp { background: var(--canvas); color: var(--ink); }
    .block-container { max-width: 1180px; padding: 2.4rem 2rem 3rem; }
    h1, h2, h3, h4, p, label, span { letter-spacing: 0 !important; }
    h1 { color: var(--ink); font-size: 2rem !important; line-height: 1.2 !important; }
    h2, h3 { color: var(--ink); }
    [data-testid="stMarkdownContainer"] p { color: var(--muted); }
    .eyebrow {
        color: var(--accent);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        margin: 0 0 0.55rem;
    }
    .intro-copy { max-width: 680px; margin-bottom: 1.6rem; }
    [data-testid="stForm"] {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 1.25rem 1.35rem;
        box-shadow: 0 2px 8px rgba(25, 48, 37, 0.035);
    }
    [data-testid="stForm"] h3 { font-size: 1rem; margin: 0.15rem 0 0.85rem; }
    [data-testid="stWidgetLabel"] p { color: #34443b; font-weight: 600; font-size: 0.88rem; }
    [data-testid="stNumberInput"], [data-testid="stSelectbox"] { margin-bottom: 0.25rem; }
    [data-testid="stNumberInput"] input, [data-testid="stSelectbox"] [data-baseweb="select"] > div {
        background: #fff;
        border-color: #cbd7d0;
        border-radius: 6px;
        min-height: 42px;
    }
    [data-testid="stNumberInput"] input:focus, [data-testid="stSelectbox"] [data-baseweb="select"]:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(23, 107, 89, 0.16);
    }
    [data-testid="stFormSubmitButton"] button, [data-testid="stButton"] button {
        min-height: 44px;
        border-radius: 6px;
        font-weight: 650;
        transition: background-color 120ms ease, border-color 120ms ease;
    }
    [data-testid="stFormSubmitButton"] button[kind="primary"] {
        background: var(--accent);
        border-color: var(--accent);
    }
    [data-testid="stFormSubmitButton"] button[kind="primary"]:hover {
        background: var(--accent-dark);
        border-color: var(--accent-dark);
    }
    button:focus-visible, input:focus-visible, [tabindex="0"]:focus-visible {
        outline: 3px solid rgba(23, 107, 89, 0.38) !important;
        outline-offset: 2px;
    }
    .policy-panel { border-left: 2px solid #b8d2c7; padding: 0.1rem 0 0.1rem 1rem; }
    .policy-panel h3 { font-size: 1rem; margin: 0 0 0.35rem; }
    .policy-list { list-style: none; margin: 1rem 0 0; padding: 0; }
    .policy-list li { padding: 0.8rem 0; border-top: 1px solid var(--line); color: #34443b; font-size: 0.9rem; line-height: 1.45; }
    .policy-list strong { display: block; color: var(--ink); font-size: 0.88rem; margin-bottom: 0.15rem; }
    [data-testid="stAlert"] { border-radius: 6px; }
    @media (max-width: 760px) {
        .block-container { padding: 1.3rem 1rem 2rem; }
        h1 { font-size: 1.65rem !important; }
        [data-testid="stForm"] { padding: 1rem; }
        .policy-panel { margin-top: 1.5rem; }
    }
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="intro-copy">
    <p class="eyebrow">Loan operations · Application review</p>
    <h1>Loan application review</h1>
    <p>Enter the applicant’s details to assess eligibility and affordability.</p>
</div>
""", unsafe_allow_html=True)

# ---------- Input Form ----------
form_col, policy_col = st.columns([1.65, 0.85], gap="large")

with form_col:
    with st.form("loan_form"):
        applicant_col, loan_col = st.columns(2, gap="large")

        with applicant_col:
            st.subheader("Applicant")
            Gender = st.selectbox("Gender", ["Male", "Female"])
            Married = st.selectbox("Marital status", ["No", "Yes"])
            Dependents = st.selectbox("Dependents", ["0", "1", "2", "3+"])
            Education = st.selectbox("Education", ["Graduate", "Not Graduate"])
            Self_Employed = st.selectbox("Self-employed", ["No", "Yes"])
            Property_Area = st.selectbox("Property area", ["Rural", "Semiurban", "Urban"])

        with loan_col:
            st.subheader("Income & loan")
            ApplicantIncome = st.number_input(
                "Applicant income (₹ / month)", min_value=0, step=100, value=5000,
                help="Enter monthly income using the same currency as the loan amount.",
            )
            CoapplicantIncome = st.number_input(
                "Co-applicant income (₹ / month)", min_value=0, step=100, value=0,
                help="Enter 0 when there is no co-applicant income.",
            )
            LoanAmount = st.number_input(
                "Requested loan amount (₹)", min_value=0, step=1000, value=120000,
            )
            Loan_Term_Years = st.number_input(
                "Repayment term (years)", min_value=1, max_value=30, step=1, value=30,
            )
            Credit_History = st.selectbox(
                "Credit history",
                [1, 0],
                format_func=lambda value: "Satisfactory" if value == 1 else "Unsatisfactory",
                help="Choose whether the applicant has a satisfactory credit history.",
            )

        Loan_Amount_Term = Loan_Term_Years * 12
        submitted = st.form_submit_button("Review application", type="primary", use_container_width=True)

with policy_col:
    st.markdown("""
    <section class="policy-panel" aria-label="Eligibility criteria">
        <h3>Eligibility criteria</h3>
        <p>Applications are assessed against these policy checks.</p>
        <ul class="policy-list">
            <li><strong>Household income</strong>At least ₹4,000 combined monthly income</li>
            <li><strong>Credit history</strong>Satisfactory history is required</li>
            <li><strong>Affordability</strong>Loan amount up to 15× combined income</li>
            <li><strong>Model confidence</strong>At least 50% approval probability</li>
        </ul>
    </section>
    """, unsafe_allow_html=True)

# ---------- Build row exactly like training ----------
def build_model_row():
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

# ---------- Strict business guardrails ----------
def apply_approval_guardrails(pred, proba, applicant_income, coapplicant_income, loan_amount, credit_history):
    total_income = float(applicant_income) + float(coapplicant_income)
    loan_value = float(loan_amount)

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
        with st.spinner("Reviewing application..."):
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

        st.subheader("Review result")
        if approved:
            st.success("Loan approved")
        else:
            st.error("Loan not approved")

        st.caption(reason)
        if proba is not None:
            st.metric("Model approval probability", f"{proba:.1%}")

    except Exception as e:
        st.error("We could not complete the review. Check the entered details and try again.")
        with st.expander("Technical details"):
            st.exception(e)
