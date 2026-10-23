import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { User, Mail, Building2, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const application = JSON.parse(localStorage.getItem('loan_application') || 'null');

  return (
    <Layout>
      <div className="space-y-8 max-w-2xl" style={{ fontFamily: 'Syne, sans-serif' }}>
        <div className="pb-6 border-b border-[#E7E3DC]">
          <p className="text-[9px] text-orange-600 uppercase tracking-[0.3em] mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
            Account
          </p>
          <h1 className="text-4xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
            User <span className="text-orange-500 italic">Profile</span>
          </h1>
        </div>

        {/* Avatar + info */}
        <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-orange-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {user?.name}
              </h2>
              <p className="text-[10px] text-orange-600 uppercase tracking-[0.15em] font-bold mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                {user?.role === 'banker' ? 'Banker — Review Officer' : 'Loan Applicant'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: User, label: 'Full Name', value: user?.name },
              { icon: Building2, label: 'Role Designation', value: user?.role === 'banker' ? 'Senior Loan Officer' : 'Primary Loan Applicant' },
              { icon: Shield, label: 'Institution', value: 'BITS Athena — CD23' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-[#E7E3DC] last:border-0">
                <div className="w-8 h-8 bg-[#FAFAF8] border border-[#E7E3DC] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#6B6861]" />
                </div>
                <div>
                  <p className="text-[9px] text-[#8C877D] uppercase tracking-[0.15em]" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
                  <p className="text-sm font-bold text-[#1F1E1D]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application summary if applicant */}
        {user?.role === 'applicant' && application && (
          <div className="bg-[#FFFFFF] border border-[#E7E3DC] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E3DC] mb-4">
              <p className="text-[9px] text-orange-600 uppercase tracking-[0.2em] font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>Active Loan Application</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Loan Amount', value: `₹${Number(application.loanAmount).toLocaleString()}` },
                { label: 'AI Result', value: application.result },
                { label: 'Confidence', value: application.probability ? `${(application.probability * 100).toFixed(0)}%` : '—' },
                { label: 'Sent to Banker', value: application.sentToBanker ? 'Forwarded ✓' : 'Pending' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#FAFAF8] border border-[#E7E3DC] p-3">
                  <p className="text-[9px] text-[#8C877D] uppercase tracking-[0.1em] mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</p>
                  <p className="text-sm font-bold text-[#1F1E1D] capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
