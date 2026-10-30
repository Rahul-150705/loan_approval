import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface LayoutProps { children: ReactNode }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully.');
    navigate('/login');
  };

  const applicantNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Apply', path: '/apply' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const bankerNav = [
    { icon: LayoutDashboard, label: 'Applications', path: '/banker' },
    { icon: Bell, label: 'Inbox', path: '/banker/inbox' },
  ];

  const navItems = user?.role === 'banker' ? bankerNav : applicantNav;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1F1E1D] flex" style={{ fontFamily: 'Syne, sans-serif' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-[#E7E3DC] bg-[#FFFFFF] fixed h-full z-40">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#E7E3DC]">
          <div className="w-8 h-8 bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-black text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>L</span>
          </div>
          <div>
            <p className="text-[#1F1E1D] font-bold text-sm tracking-wide">LoanSmart</p>
            <p className="text-[9px] text-orange-600 uppercase tracking-[0.15em]" style={{ fontFamily: 'DM Mono, monospace' }}>
              {user?.role === 'banker' ? 'Banker Portal' : 'Applicant Portal'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group
                  ${active
                    ? 'bg-orange-50 border border-orange-200 text-orange-600 font-bold'
                    : 'text-[#6B6861] hover:text-[#1F1E1D] hover:bg-[#F4F2EE]'}`}
                style={{ borderRadius: 0, fontFamily: 'DM Mono, monospace' }}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-orange-500' : 'text-[#8C877D] group-hover:text-[#1F1E1D]'}`} />
                <span className="text-xs uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User bar + Sign out */}
        <div className="p-4 border-t border-[#E7E3DC] bg-[#FAFAF8]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-xs font-bold text-[#1F1E1D] truncate">{user?.name}</p>
              <p className="text-[10px] text-orange-600 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-[#8C877D] hover:text-red-500 hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[#E7E3DC] bg-[#FFFFFF] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 flex items-center justify-center">
              <span className="text-white font-black text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>L</span>
            </div>
            <span className="font-bold text-sm text-[#1F1E1D]">LoanSmart</span>
          </div>
          <button onClick={handleLogout} className="text-[#8C877D] hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile bottom bar */}
        <nav className="lg:hidden flex border-t border-[#E7E3DC] bg-[#FFFFFF] sticky bottom-0 z-30">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[9px] uppercase tracking-wider
                  ${active ? 'text-orange-600 bg-orange-50/50' : 'text-[#8C877D]'}`}
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
