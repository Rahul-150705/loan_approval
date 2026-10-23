import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRole, setSelectedRole] = useState<'applicant' | 'banker'>('applicant');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!credentials.email) e.email = 'Email is required';
    if (!credentials.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(credentials.email, credentials.password);
    if (result.success) {
      toast.success('Welcome back! Redirecting to your dashboard...');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Authentication failed');
    }
    setLoading(false);
  };

  const fillDemo = (role: 'applicant' | 'banker') => {
    if (role === 'applicant') {
      setCredentials({ email: 'rahul.cd23@bitsathy.ac.in', password: 'rahul123' });
    } else {
      setCredentials({ email: 'aravind.cd23@bitsathy.ac.in', password: 'aravind123' });
    }
    setSelectedRole(role);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex" style={{ fontFamily: 'Syne, sans-serif' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 bg-[#FFFFFF] border-r border-[#E7E3DC] overflow-hidden">
        {/* Subtle orange accent gradient */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl pointer-events-none"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-50/80 rounded-full blur-3xl pointer-events-none"
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>L</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1F1E1D]">LoanSmart</span>
              <span className="text-[10px] block text-orange-600 uppercase tracking-[0.25em]" style={{ fontFamily: 'DM Mono, monospace' }}>
                AI Credit Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Center narrative */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200">
            <div className="w-1.5 h-1.5 bg-orange-500" />
            <span className="text-[10px] text-orange-700 uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
              ML-Powered Credit Engine
            </span>
          </div>

          <h1 className="text-5xl font-black text-[#1F1E1D] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Instant loan<br />
            <span className="text-orange-500 italic">decisions</span> with<br />
            explainable AI.
          </h1>

          <p className="text-sm text-[#6B6861] leading-relaxed" style={{ fontFamily: 'DM Mono, monospace' }}>
            Real-time loan qualification evaluation backed by a trained Random Forest model. Submit your application, evaluate eligibility criteria, and connect directly with reviewing officers.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-px bg-[#E7E3DC] pt-px">
            <div className="bg-[#FFFFFF] p-4">
              <p className="text-2xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>99.2%</p>
              <p className="text-[9px] text-[#6B6861] uppercase tracking-wider mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>Model Accuracy</p>
            </div>
            <div className="bg-[#FFFFFF] p-4">
              <p className="text-2xl font-black text-orange-600" style={{ fontFamily: 'Playfair Display, serif' }}>&lt; 1s</p>
              <p className="text-[9px] text-[#6B6861] uppercase tracking-wider mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>Inference Time</p>
            </div>
            <div className="bg-[#FFFFFF] p-4">
              <p className="text-2xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>100%</p>
              <p className="text-[9px] text-[#6B6861] uppercase tracking-wider mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>Transparent</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-[#8C877D] border-t border-[#E7E3DC] pt-4" style={{ fontFamily: 'DM Mono, monospace' }}>
          <span>Department of Computer Technology</span>
          <span>BITS Athena CD23</span>
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center">
              <span className="text-white font-black text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>L</span>
            </div>
            <span className="font-bold text-[#1F1E1D]">LoanSmart</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-[#8C877D] uppercase tracking-widest" style={{ fontFamily: 'DM Mono, monospace' }}>Portal</p>
            <p className="text-xs font-bold text-orange-600 capitalize" style={{ fontFamily: 'DM Mono, monospace' }}>{selectedRole} Access</p>
          </div>
        </div>

        <div className="my-auto py-8">
          {/* Role selector tabs */}
          <div className="flex gap-px bg-[#E7E3DC] p-px mb-8">
            <button
              type="button"
              onClick={() => fillDemo('applicant')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold transition-all
                ${selectedRole === 'applicant'
                  ? 'bg-[#FFFFFF] text-orange-600 border-b-2 border-orange-500 shadow-sm'
                  : 'bg-[#F4F2EE] text-[#6B6861] hover:text-[#1F1E1D]'}`}
              style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
            >
              <User className="w-3.5 h-3.5" />
              Applicant (Rahul)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('banker')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold transition-all
                ${selectedRole === 'banker'
                  ? 'bg-[#FFFFFF] text-orange-600 border-b-2 border-orange-500 shadow-sm'
                  : 'bg-[#F4F2EE] text-[#6B6861] hover:text-[#1F1E1D]'}`}
              style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
            >
              <Building2 className="w-3.5 h-3.5" />
              Banker (Aravind)
            </button>
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-[10px] text-orange-600 uppercase tracking-[0.2em]" style={{ fontFamily: 'DM Mono, monospace' }}>
              Sign In
            </p>
            <h2 className="text-3xl font-black text-[#1F1E1D]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedRole === 'applicant' ? 'Applicant Access' : 'Banker Portal'}
            </h2>
            <p className="text-xs text-[#6B6861]" style={{ fontFamily: 'DM Mono, monospace' }}>
              Select a tab above to auto-fill credentials, or type manually.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B6861] mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="name@bitsathy.ac.in"
                className={`w-full bg-[#FFFFFF] border px-4 py-3 text-sm text-[#1F1E1D] transition-colors focus:outline-none
                  ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#E7E3DC] hover:border-[#D1CCC2] focus:border-orange-500'}`}
                style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B6861] mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-[#FFFFFF] border px-4 py-3 text-sm text-[#1F1E1D] transition-colors focus:outline-none pr-10
                    ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-[#E7E3DC] hover:border-[#D1CCC2] focus:border-orange-500'}`}
                  style={{ fontFamily: 'DM Mono, monospace', borderRadius: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#1F1E1D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white
                py-4 text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-60 shadow-md group"
              style={{ borderRadius: 0 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-8 p-4 bg-orange-50/70 border border-orange-200">
            <p className="text-[10px] text-orange-800 font-bold uppercase tracking-wider mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
              Configured Accounts:
            </p>
            <div className="space-y-1 text-xs text-[#6B6861]" style={{ fontFamily: 'DM Mono, monospace' }}>
              <p><span className="text-[#1F1E1D] font-bold">Applicant:</span> rahul.cd23@bitsathy.ac.in (rahul123)</p>
              <p><span className="text-[#1F1E1D] font-bold">Banker:</span> aravind.cd23@bitsathy.ac.in (aravind123)</p>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-[#8C877D]" style={{ fontFamily: 'DM Mono, monospace' }}>
          LoanSmart System • Built with React & Machine Learning
        </div>
      </div>
    </div>
  );
};

export default Login;
