import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'applicant' | 'banker';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: () => boolean;
}

const USERS: Record<string, { password: string; name: string; role: UserRole }> = {
  'rahul.cd23@bitsathy.ac.in': {
    password: 'rahul123',
    name: 'Rahul Kumar',
    role: 'applicant',
  },
  'aravind.cd23@bitsathy.ac.in': {
    password: 'aravind123',
    name: 'Aravind Banker',
    role: 'banker',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('loan_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string) => {
    const found = USERS[email.trim().toLowerCase()];
    if (!found) return { success: false, error: 'No account found for this email.' };
    if (found.password !== password) return { success: false, error: 'Incorrect password.' };
    const u: User = { email: email.trim().toLowerCase(), name: found.name, role: found.role };
    setUser(u);
    localStorage.setItem('loan_user', JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loan_user');
    localStorage.removeItem('loan_application');
  };

  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
