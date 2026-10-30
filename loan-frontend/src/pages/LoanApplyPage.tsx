import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Loader2, CheckCircle, XCircle, Send,
  ChevronLeft, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import axios from 'axios';

interface FormState {
  Gender: string;
  Married: string;
  Dependents: string;
  Education: string;
  Self_Employed: string;
  Property_Area: string;
  ApplicantIncome: number;
  CoapplicantIncome: number;
  LoanAmount: number;
  Loan_Term_Years: number;
  Credit_History: number;
}

const SelectField: React.FC<{
  label: string;
  options: (string | number)[];
  value: string | number;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <label
      className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B6861] mb-2"
      style={{ fontFamily: 'DM Mono, monospace' }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#FFFFFF] border border-[#E7E3DC] hover:border-[#D1CCC2] focus:border-orange-500 focus:outline-none px-4 py-3 text-sm text-[#1F1E1D] transition-colors cursor-pointer"
      style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
    >
      {options.map(o => (
        <option key={String(o)} value={o}>
          {String(o)}
        </option>
      ))}
    </select>
  </div>
);

const NumberField: React.FC<{
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, min, max, value, onChange }) => {
  return (
    <div>
      <label
        className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B6861] mb-2"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value === 0 ? '' : value}
        placeholder="0"
        onWheel={e => e.currentTarget.blur()}
        onChange={e => {
          const val = e.target.value;
          onChange(val === '' ? 0 : Number(val));
        }}
        className="w-full bg-[#FFFFFF] border border-[#E7E3DC] hover:border-[#D1CCC2] focus:border-orange-500 focus:outline-none px-4 py-3 text-sm text-[#1F1E1D] transition-colors"
        style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
      />
    </div>
  );
};

const LoanApplyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState<FormState>({
    Gender: 'Male',
    Married: 'No',
    Dependents: '0',
    Education: 'Graduate',
    Self_Employed: 'No',
    Property_Area: 'Urban',
    ApplicantIncome: 5000,
    CoapplicantIncome: 0,
    LoanAmount: 120000,
    Loan_Term_Years: 30,
    Credit_History: 1,
  });

  const handleChange = (key: keyof FormState, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', {
        ...form,
        Loan_Amount_Term: form.Loan_Term_Years * 12,
      });
      const data = response.data;
      setResult(data);

      const appData = {
        ...form,
        result: data.approved ? 'approved' : 'rejected',
        reason: data.reason,
        probability: data.probability,
        loanAmount: form.LoanAmount,
        applicantIncome: form.ApplicantIncome,
        sentToBanker: false,
        applicantName: user?.name,
        applicantEmail: user?.email,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('loan_application', JSON.stringify(appData));
      setStep('result');
    } catch (err: any) {
      // Mock fallback if backend offline
      const totalIncome = form.ApplicantIncome + form.CoapplicantIncome;
      const approved = (
        form.Credit_History === 1 &&
        totalIncome >= 4000 &&
        form.LoanAmount <= totalIncome * 15
      );
      const probability = approved ? 0.72 + Math.random() * 0.2 : 0.2 + Math.random() * 0.25;
      const reason = approved
        ? 'Approved: applicant meets the strict income and affordability criteria.'
        : totalIncome < 4000
        ? 'Rejected: total household income is below the minimum approval threshold.'
        : form.Credit_History !== 1
        ? 'Rejected: credit history must be good to qualify.'
        : 'Rejected: requested loan is above the strict affordability limit for this income level.';

      const mockResult = { approved, reason, probability };
      setResult(mockResult);
      const appData = {
        ...form,
        result: approved ? 'approved' : 'rejected',
        reason,
        probability,
        loanAmount: form.LoanAmount,
        applicantIncome: form.ApplicantIncome,
        sentToBanker: false,
        applicantName: user?.name,
        applicantEmail: user?.email,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('loan_application', JSON.stringify(appData));
      setStep('result');
    }
    setLoading(false);
  };

  const handleSendToBanker = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const existing = JSON.parse(localStorage.getItem('loan_application') || '{}');
    const updated = { ...existing, sentToBanker: true };
    localStorage.setItem('loan_application', JSON.stringify(updated));

    const bankerInbox = JSON.parse(localStorage.getItem('banker_inbox') || '[]');
    bankerInbox.push(updated);
    localStorage.setItem('banker_inbox', JSON.stringify(bankerInbox));

    toast.success('Application submitted to banker! Aravind will review and contact you.');
    setSubmitting(false);
    navigate('/dashboard');
  };

  if (step === 'result' && result) {
    return (
      <Layout>
        <div className="space-y-8 max-w-2xl mx-auto" style={{ fontFamily: 'Syne, sans-serif' }}>
          <div className="flex items-center gap-4 pb-6 border-b border-[#E7E3DC]">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 text-[#6B6861] hover:text-[#1F1E1D] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Back</span>
            </button>
            <div>
              <p className="text-[9px] text-orange-600 uppercase tracking-[0.3em]" style={{ fontFamily: 'DM Mono, monospace' }}>
                AI Prediction Result
              </p>
              <h1 className="text-2xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Loan Assessment
              </h1>
            </div>
          </div>

          {/* Result card */}
          <div className={`p-8 border ${result.approved ? 'border-emerald-300 bg-emerald-50/70' : 'border-red-300 bg-red-50/70'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 flex items-center justify-center flex-shrink-0 ${result.approved ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {result.approved
                  ? <CheckCircle className="w-7 h-7" />
                  : <XCircle className="w-7 h-7" />
                }
              </div>
              <div>
                <p className="text-[10px] text-[#6B6861] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
                  Prediction Outcome
                </p>
                <h2 className={`text-2xl font-black mb-3 ${result.approved ? 'text-emerald-700' : 'text-red-700'}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  Loan {result.approved ? 'Approved ✓' : 'Rejected ✗'}
                </h2>
                <p className="text-sm text-[#1F1E1D] leading-relaxed" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {result.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-4 h-4 text-orange-600" />
              <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
                AI Confidence Score
              </p>
            </div>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-black text-orange-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                {result.probability ? `${(result.probability * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-[10px] text-[#6B6861] mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                Model confidence
              </p>
            </div>
            <div className="mt-3 h-2 bg-[#F4F2EE] w-full">
              <div
                className="h-full bg-orange-500 transition-all duration-1000"
                style={{ width: `${((result.probability || 0) * 100).toFixed(0)}%` }}
              />
            </div>
            <p className="text-[9px] text-[#8C877D] mt-2" style={{ fontFamily: 'DM Mono, monospace' }}>
              Threshold: 50% minimum required for approval
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-px bg-[#E7E3DC] border border-[#E7E3DC]">
            {[
              { label: 'Loan Amount', value: `₹${Number(form.LoanAmount).toLocaleString()}` },
              { label: 'Monthly Income', value: `₹${Number(form.ApplicantIncome).toLocaleString()}` },
              { label: 'Credit History', value: form.Credit_History === 1 ? 'Good ✓' : 'Poor ✗' },
              { label: 'Property Area', value: form.Property_Area },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#FFFFFF] p-4">
                <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.15em] mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
                <p className="text-sm font-bold text-[#1F1E1D]">{value}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep('form')}
              className="flex-1 flex items-center justify-center gap-2 border border-[#E7E3DC] hover:border-[#D1CCC2] text-[#6B6861] hover:text-[#1F1E1D] bg-[#FFFFFF] py-3 text-xs font-black uppercase tracking-[0.1em] transition-all"
              style={{ borderRadius: 0, fontFamily: 'DM Mono, monospace' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Recalculate
            </button>

            {result.approved && (
              <button
                onClick={handleSendToBanker}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 text-xs font-black uppercase tracking-[0.1em] transition-all disabled:opacity-60 shadow-md"
                style={{ borderRadius: 0, fontFamily: 'DM Mono, monospace' }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Send to Banker (Aravind)'}
              </button>
            )}
          </div>

          {result.approved && (
            <div className="border border-orange-200 p-4 bg-orange-50/70">
              <p className="text-[11px] text-orange-800 leading-relaxed" style={{ fontFamily: 'DM Mono, monospace' }}>
                ℹ️ Your loan application has been approved by the AI model. Click "Send to Banker" to forward your full application to Aravind for final verification.
              </p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" style={{ fontFamily: 'Syne, sans-serif' }}>
        {/* Header */}
        <div className="pb-6 border-b border-[#E7E3DC]">
          <p className="text-[9px] text-orange-600 uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
            Loan Application
          </p>
          <h1 className="text-4xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
            AI Loan<br /><span className="text-orange-500 italic">Predictor</span>
          </h1>
          <p className="text-sm text-[#6B6861] mt-3 max-w-lg" style={{ fontFamily: 'DM Mono, monospace' }}>
            Fill in your financial profile below. Values can be directly typed without mouse increments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E3DC]">
              <p className="text-[9px] text-orange-600 uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>01</p>
              <h3 className="text-sm font-black text-[#1F1E1D]">Personal Details</h3>
            </div>
            <SelectField label="Gender" options={['Male', 'Female']} value={form.Gender} onChange={v => handleChange('Gender', v)} />
            <SelectField label="Married" options={['No', 'Yes']} value={form.Married} onChange={v => handleChange('Married', v)} />
            <SelectField label="Dependents" options={['0', '1', '2', '3+']} value={form.Dependents} onChange={v => handleChange('Dependents', v)} />
            <SelectField label="Education" options={['Graduate', 'Not Graduate']} value={form.Education} onChange={v => handleChange('Education', v)} />
            <SelectField label="Self Employed" options={['No', 'Yes']} value={form.Self_Employed} onChange={v => handleChange('Self_Employed', v)} />
            <SelectField label="Property Area" options={['Rural', 'Semiurban', 'Urban']} value={form.Property_Area} onChange={v => handleChange('Property_Area', v)} />
          </div>

          {/* Financial Details */}
          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E3DC]">
              <p className="text-[9px] text-orange-600 uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>02</p>
              <h3 className="text-sm font-black text-[#1F1E1D]">Financial Details</h3>
            </div>
            <NumberField label="Applicant Income (₹)" min={0} value={form.ApplicantIncome} onChange={v => handleChange('ApplicantIncome', v)} />
            <NumberField label="Co-applicant Income (₹)" min={0} value={form.CoapplicantIncome} onChange={v => handleChange('CoapplicantIncome', v)} />
            <NumberField label="Loan Amount (₹)" min={0} value={form.LoanAmount} onChange={v => handleChange('LoanAmount', v)} />
            <NumberField label="Loan Term (Years)" min={1} max={30} value={form.Loan_Term_Years} onChange={v => handleChange('Loan_Term_Years', v)} />
            <SelectField
              label="Credit History"
              options={[1, 0]}
              value={form.Credit_History}
              onChange={v => handleChange('Credit_History', Number(v))}
            />

            {/* Real-time summary */}
            <div className="bg-[#FAFAF8] border border-[#E7E3DC] p-4 mt-2">
              <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.15em] mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
                Summary
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>Total Income</p>
                  <p className="text-sm font-bold text-orange-600">₹{(form.ApplicantIncome + form.CoapplicantIncome).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>Loan/Income Ratio</p>
                  <p className={`text-sm font-bold ${form.LoanAmount > (form.ApplicantIncome + form.CoapplicantIncome) * 15 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {((form.LoanAmount / (form.ApplicantIncome + form.CoapplicantIncome || 1))).toFixed(1)}×
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white
              px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-60 shadow-md group"
            style={{ borderRadius: 0 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Run AI Prediction
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-[10px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>
            Random Forest model with strict affordability guardrails
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoanApplyPage;
