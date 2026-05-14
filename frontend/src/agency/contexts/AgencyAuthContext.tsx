import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../../services/authService';
import { TOKEN_KEY, USER_KEY } from '../../utils/constants';

interface AgencyUser {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  agencyName?: string;
}

interface AgencyAuthContextType {
  agencyUser: AgencyUser | null;
  token: string | null;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearMustChangePassword: () => void;
}

const AgencyAuthContext = createContext<AgencyAuthContextType | null>(null);

export const AgencyAuthProvider = ({ children }: { children: ReactNode }) => {
  const [agencyUser, setAgencyUser] = useState<AgencyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('agency_token');
    const savedUser = localStorage.getItem('agency_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'AGENCY_PARTNER') {
          setToken(savedToken);
          setAgencyUser(parsed);
          setMustChangePassword(!!(parsed as any).mustChangePassword);
        }
      } catch {
        localStorage.removeItem('agency_token');
        localStorage.removeItem('agency_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response.role !== 'AGENCY_PARTNER') {
      throw new Error('Ce compte n\'est pas un compte agence.');
    }
    const user: AgencyUser = {
      id: response.id ?? 0,
      email: response.email ?? '',
      firstName: response.firstName ?? '',
      lastName: response.lastName ?? '',
      role: response.role ?? '',
    };
    const tok = response.token ?? '';
    const mcp = response.mustChangePassword ?? false;
    setToken(tok);
    setAgencyUser(user);
    setMustChangePassword(mcp);
    localStorage.setItem('agency_token', tok);
    localStorage.setItem('agency_user', JSON.stringify({ ...user, mustChangePassword: mcp }));
  };

  const logout = () => {
    setToken(null);
    setAgencyUser(null);
    setMustChangePassword(false);
    localStorage.removeItem('agency_token');
    localStorage.removeItem('agency_user');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const clearMustChangePassword = () => {
    setMustChangePassword(false);
    const savedUser = localStorage.getItem('agency_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        parsed.mustChangePassword = false;
        localStorage.setItem('agency_user', JSON.stringify(parsed));
      } catch { /* ignore */ }
    }
  };

  return (
    <AgencyAuthContext.Provider value={{ agencyUser, token, isLoading, mustChangePassword, login, logout, clearMustChangePassword }}>
      {children}
    </AgencyAuthContext.Provider>
  );
};

export const useAgencyAuth = () => {
  const ctx = useContext(AgencyAuthContext);
  if (!ctx) throw new Error('useAgencyAuth must be used within AgencyAuthProvider');
  return ctx;
};
