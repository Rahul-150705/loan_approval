import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, ArrowRight,
  TrendingUp, Shield, Send, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const application = JSON.parse(localStorage.getItem('loan_application') || 'null');

  const getStatusConfig = () => {
    if (!application) return null;
    if (application.sentToBanker) return {
      color: 'text-orange-700',
      bg: 'bg-orange-50 border-orange-200',
      label: 'Submitted to Banker',
      icon: Send,
      iconColor: 'text-orange-600',
    };
    if (application.result === 'approved') return {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      label: 'Pre-Approved (Pending Banker Review)',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    };
    if (application.result === 'rejected') return {
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      label: 'Not Eligible',
      icon: XCircle,
      iconColor: 'text-red-600',
    };
    return {
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      label: 'Prediction Complete',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    };
  };

  const statusConfig = getStatusConfig();

  const steps = [
    { num: '01', label: 'Fill Application', done: !!application, active: !application },
    { num: '02', label: 'AI Prediction', done: !!application?.result, active: !!application && !application.result },
    { num: '03', label: 'Submit to Banker', done: !!application?.sentToBanker, active: !!application?.result && !application.sentToBanker },
    { num: '04', label: 'Banker Review', done: false, active: !!application?.sentToBanker },
  ];

  return (
    <Layout>
      <div className="space-y-8" style={{ fontFamily: 'Syne, sans-serif' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E7E3DC]">
          <div>
            <p className="text-[9px] text-orange-600 uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
              Applicant Portal
            </p>
            <h1 className="text-4xl font-black text-[#1F1E1D] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hello, {user?.name?.split(' ')[0]}<br />
              <span className="text-orange-500 italic">Loan Dashboard</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/apply')}
            className="self-start md:self-auto flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white
              px-6 py-3 text-xs font-black uppercase tracking-[0.15em] transition-all shadow-md group"
            style={{ borderRadius: 0 }}
          >
            <span>{application ? 'Recalculate Loan' : 'Apply for Loan'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Status card if applied */}
        {application && statusConfig && (
          <div className={`p-6 border ${statusConfig.bg}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0 border border-orange-200">
                  <statusConfig.icon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                </div>
                <div>
                  <p className="text-[10px] text-[#6B6861] uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
                    Application Status
                  </p>
                  <h3 className={`text-xl font-bold mt-1 ${statusConfig.color}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                    {statusConfig.label}
                  </h3>
                  <p className="text-xs text-[#6B6861] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {application.reason}
                  </p>
                </div>
              </div>
              {application.probability && (
                <div className="text-right">
                  <p className="text-[10px] text-[#6B6861] uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>AI Confidence</p>
                  <p className="text-2xl font-black text-orange-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {(application.probability * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Process progress */}
        <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 shadow-sm">
          <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>
            Application Progress
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map(s => (
              <div key={s.num} className="relative">
                <div className={`p-4 border transition-all ${
                  s.done
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : s.active
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-[#E7E3DC] bg-[#FAFAF8] opacity-60'
                }`}>
                  <p className="text-[9px] text-[#8C877D] font-mono mb-1">{s.num}</p>
                  <p className="text-xs font-bold text-[#1F1E1D]">{s.label}</p>
                  <p className="text-[9px] mt-2 font-mono" style={{
                    color: s.done ? '#059669' : s.active ? '#EA580C' : '#8C877D'
                  }}>
                    {s.done ? '✓ Complete' : s.active ? '● In Progress' : '○ Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E7E3DC] border border-[#E7E3DC]">
          {[
            { num: '01', label: 'Requested Amount', value: application ? `₹${Number(application.loanAmount).toLocaleString()}` : '—', sub: 'Principal' },
            { num: '02', label: 'Monthly Income', value: application ? `₹${Number(application.applicantIncome).toLocaleString()}` : '—', sub: 'Applicant' },
            { num: '03', label: 'Credit Score', value: application ? (application.Credit_History === 1 ? '750+' : '<650') : '—', sub: 'Bureau rating' },
            { num: '04', label: 'Term Duration', value: application ? `${application.Loan_Term_Years || 30} Yrs` : '—', sub: 'Repayment' },
          ].map(({ num, label, value, sub }) => (
            <div key={num} className="bg-[#FFFFFF] p-6 relative">
              <span className="absolute top-4 right-4 text-[9px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>{num}</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6861] mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
              <p className="text-3xl font-black text-[#1F1E1D] leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>{value}</p>
              <p className="text-[9px] text-[#8C877D] mt-2" style={{ fontFamily: 'DM Mono, monospace' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Two-card action row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-base font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                How AI Evaluation Works
              </h3>
            </div>
            <p className="text-xs text-[#6B6861] leading-relaxed mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>
              Our Random Forest model inspects 11 key financial parameters including income-to-loan ratios, co-applicant financial strength, and credit history benchmarks to calculate eligibility in milliseconds.
            </p>
            <div className="space-y-2 text-xs border-t border-[#E7E3DC] pt-4">
              <div className="flex justify-between text-[#6B6861]">
                <span>Credit History Requirement</span>
                <span className="font-bold text-emerald-600">Strict (Score = 1)</span>
              </div>
              <div className="flex justify-between text-[#6B6861]">
                <span>Min Household Income</span>
                <span className="font-bold text-[#1F1E1D]">₹4,000 / month</span>
              </div>
              <div className="flex justify-between text-[#6B6861]">
                <span>Max Loan-to-Income</span>
                <span className="font-bold text-[#1F1E1D]">15× Annual</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-base font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Banker Verification
              </h3>
            </div>
            <p className="text-xs text-[#6B6861] leading-relaxed mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>
              Once your application achieves model pre-approval, you can forward it directly to your designated loan officer (Aravind) for manual document verification and sanctioning.
            </p>
            <div className="bg-[#FAFAF8] border border-[#E7E3DC] p-4 text-xs space-y-1" style={{ fontFamily: 'DM Mono, monospace' }}>
              <p className="text-[10px] text-orange-600 uppercase tracking-wider font-bold">Assigned Reviewer</p>
              <p className="font-bold text-[#1F1E1D]">Aravind Kumar</p>
              <p className="text-[#6B6861]">aravind.cd23@bitsathy.ac.in</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicantDashboard;
