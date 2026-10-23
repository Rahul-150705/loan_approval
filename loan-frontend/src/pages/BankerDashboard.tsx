import React, { useState } from 'react';
import {
  CheckCircle, XCircle,
  Mail,
  FileText, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';

interface Application {
  applicantName: string;
  applicantEmail: string;
  result: 'approved' | 'rejected';
  reason: string;
  probability: number;
  loanAmount: number;
  applicantIncome: number;
  CoapplicantIncome: number;
  Gender: string;
  Married: string;
  Dependents: string;
  Education: string;
  Self_Employed: string;
  Property_Area: string;
  Credit_History: number;
  Loan_Term_Years: number;
  sentToBanker: boolean;
  timestamp: string;
  bankerStatus?: 'pending' | 'contacted' | 'approved' | 'rejected';
}

const BankerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>(() => {
    const inbox = JSON.parse(localStorage.getItem('banker_inbox') || '[]');
    return inbox.map((a: Application) => ({ ...a, bankerStatus: a.bankerStatus || 'pending' }));
  });

  const updateStatus = (email: string, bankerStatus: Application['bankerStatus']) => {
    const updated = applications.map(a =>
      a.applicantEmail === email ? { ...a, bankerStatus } : a
    );
    setApplications(updated);
    localStorage.setItem('banker_inbox', JSON.stringify(updated));
    if (selectedApp?.applicantEmail === email) {
      setSelectedApp(prev => prev ? { ...prev, bankerStatus } : null);
    }
    toast.success(`Status updated to: ${bankerStatus}`);
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.bankerStatus === 'pending').length,
    contacted: applications.filter(a => a.bankerStatus === 'contacted').length,
    approved: applications.filter(a => a.bankerStatus === 'approved').length,
  };

  const statusColor: Record<string, string> = {
    pending: 'text-amber-700 bg-amber-50 border-amber-300',
    contacted: 'text-orange-700 bg-orange-50 border-orange-300',
    approved: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    rejected: 'text-red-700 bg-red-50 border-red-300',
  };

  return (
    <Layout>
      <div className="space-y-8" style={{ fontFamily: 'Syne, sans-serif' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E7E3DC]">
          <div>
            <p className="text-[9px] text-orange-600 uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
              Banker Portal
            </p>
            <h1 className="text-4xl font-black text-[#1F1E1D] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {user?.name?.split(' ')[0]}'s<br />
              <span className="text-orange-500 italic">Loan Applications</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
              Live Review
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E7E3DC] border border-[#E7E3DC]">
          {[
            { num: '01', label: 'Total Received', value: stats.total, color: 'text-[#1F1E1D]' },
            { num: '02', label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
            { num: '03', label: 'Contacted', value: stats.contacted, color: 'text-orange-600' },
            { num: '04', label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          ].map(({ num, label, value, color }) => (
            <div key={num} className="bg-[#FFFFFF] p-6 relative">
              <span className="absolute top-4 right-4 text-[9px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>{num}</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6861] mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
              <p className={`text-4xl font-black leading-none ${color}`} style={{ fontFamily: 'Playfair Display, serif' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Application list + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-[#E7E3DC] border border-[#E7E3DC]">
          {/* List */}
          <div className="lg:col-span-2 bg-[#FFFFFF]">
            <div className="px-6 py-4 border-b border-[#E7E3DC] bg-[#FAFAF8]">
              <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
                Inbox
              </p>
              <h3 className="text-base font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Applications Queue
              </h3>
            </div>

            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-12 h-12 bg-orange-50 flex items-center justify-center mb-4 border border-orange-200">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-xs text-[#6B6861] text-center" style={{ fontFamily: 'DM Mono, monospace' }}>
                  No submitted applications yet.<br />Waiting for applicant submission.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E7E3DC]">
                {applications.map((app, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left px-6 py-4 hover:bg-orange-50/40 transition-all group
                      ${selectedApp?.applicantEmail === app.applicantEmail ? 'bg-orange-50 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-black text-orange-700">{app.applicantName?.charAt(0)}</span>
                          </div>
                          <p className="text-xs font-bold text-[#1F1E1D] truncate">{app.applicantName}</p>
                        </div>
                        <p className="text-[10px] text-[#6B6861] truncate" style={{ fontFamily: 'DM Mono, monospace' }}>
                          {app.applicantEmail}
                        </p>
                        <p className="text-[9px] text-[#8C877D] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                          ₹{Number(app.loanAmount).toLocaleString()} • {new Date(app.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wider ${statusColor[app.bankerStatus || 'pending']}`}
                          style={{ fontFamily: 'DM Mono, monospace' }}>
                          {app.bankerStatus}
                        </span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 uppercase ${app.result === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}
                          style={{ fontFamily: 'DM Mono, monospace' }}>
                          AI: {app.result}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3 bg-[#FFFFFF]">
            {!selectedApp ? (
              <div className="flex flex-col items-center justify-center h-full py-24">
                <div className="w-16 h-16 bg-orange-50 flex items-center justify-center mb-4 border border-orange-200">
                  <Eye className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-sm font-bold text-[#8C877D] text-center" style={{ fontFamily: 'DM Mono, monospace' }}>
                  Select an application from the queue<br />to review details and contact
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-[#E7E3DC] pb-4">
                  <div>
                    <p className="text-[9px] text-orange-600 uppercase tracking-[0.2em] mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                      Application Dossier
                    </p>
                    <h3 className="text-xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {selectedApp.applicantName}
                    </h3>
                    <p className="text-[10px] text-[#6B6861] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {selectedApp.applicantEmail}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-3 py-1 border uppercase tracking-wider ${statusColor[selectedApp.bankerStatus || 'pending']}`}
                    style={{ fontFamily: 'DM Mono, monospace' }}>
                    {selectedApp.bankerStatus}
                  </span>
                </div>

                {/* AI Result */}
                <div className={`p-4 border ${selectedApp.result === 'approved' ? 'border-emerald-300 bg-emerald-50/70' : 'border-red-300 bg-red-50/70'}`}>
                  <div className="flex items-center gap-3">
                    {selectedApp.result === 'approved'
                      ? <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    }
                    <div>
                      <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.15em]" style={{ fontFamily: 'DM Mono, monospace' }}>AI Assessment</p>
                      <p className={`text-sm font-black ${selectedApp.result === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {selectedApp.result === 'approved' ? 'Loan Pre-Approved by Model' : 'Loan Rejected by Model'}
                      </p>
                      <p className="text-[10px] text-[#1F1E1D] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {selectedApp.reason}
                      </p>
                      <p className="text-[10px] text-orange-600 font-bold mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                        Confidence: {selectedApp.probability ? `${(selectedApp.probability * 100).toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-px bg-[#E7E3DC] border border-[#E7E3DC]">
                  {[
                    { label: 'Loan Amount', value: `₹${Number(selectedApp.loanAmount).toLocaleString()}` },
                    { label: 'Monthly Income', value: `₹${Number(selectedApp.applicantIncome).toLocaleString()}` },
                    { label: 'Education', value: selectedApp.Education },
                    { label: 'Employment', value: selectedApp.Self_Employed === 'Yes' ? 'Self Employed' : 'Salaried' },
                    { label: 'Credit History', value: selectedApp.Credit_History === 1 ? 'Good (1)' : 'Poor (0)' },
                    { label: 'Property Area', value: selectedApp.Property_Area },
                    { label: 'Loan Term', value: `${selectedApp.Loan_Term_Years} Years` },
                    { label: 'Dependents', value: selectedApp.Dependents },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#FFFFFF] p-3">
                      <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.1em] mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
                      <p className="text-sm font-bold text-[#1F1E1D]">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Contact applicant */}
                <div className="bg-[#FAFAF8] border border-[#E7E3DC] p-4">
                  <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
                    Contact Applicant
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={`mailto:${selectedApp.applicantEmail}?subject=Loan Application Review - Decision Update&body=Dear ${selectedApp.applicantName},%0D%0A%0D%0AWe have reviewed your loan application for the requested amount of ₹${Number(selectedApp.loanAmount).toLocaleString()}.%0D%0A%0D%0APlease respond to this email with your KYC documents to proceed.%0D%0A%0D%0ABest regards,%0D%0A${user?.name}%0D%0ALoan Officer`}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-sm"
                      style={{ borderRadius: 0, fontFamily: 'DM Mono, monospace' }}
                      onClick={() => updateStatus(selectedApp.applicantEmail, 'contacted')}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email {selectedApp.applicantName?.split(' ')[0]}
                    </a>
                  </div>
                </div>

                {/* Update status */}
                <div>
                  <p className="text-[9px] text-[#6B6861] uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
                    Update Review Status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['contacted', 'approved', 'rejected', 'pending'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedApp.applicantEmail, s)}
                        className={`py-2.5 text-[9px] font-black uppercase tracking-[0.1em] transition-all border
                          ${selectedApp.bankerStatus === s
                            ? statusColor[s] + ' font-bold shadow-sm'
                            : 'border-[#E7E3DC] bg-[#FAFAF8] text-[#6B6861] hover:border-[#D1CCC2] hover:text-[#1F1E1D]'
                          }`}
                        style={{ borderRadius: 0, fontFamily: 'DM Mono, monospace' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BankerDashboard;
