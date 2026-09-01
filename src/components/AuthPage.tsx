import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, Mail, Lock, User, Building2, Phone, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authenticateUserInFirestore, syncUserToFirestore } from '../services/firebaseDataSync';
import { GstInput } from './GstInput';
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_MOTTO } from '../constants/brandLogo';

interface AuthPageProps {
  tab?: 'login' | 'register';
  user: any;
  onUpdateUser: (u: any) => void;
}

export function AuthPage({ tab = 'login', user, onUpdateUser }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [authTab, setAuthTab] = useState<'login' | 'register'>(tab);

  // Sync tab with URL if it changes
  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  // Login Form States
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'dealer' | 'manufacturer' | 'architect'>('customer');
  const [regGstin, setRegGstin] = useState('');
  const [isGstValid, setIsGstValid] = useState(true);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('Kripya ID aur Password enter karein.');
      return;
    }
    setIsAuthenticating(true);
    setLoginError('');
    try {
      const res = await authenticateUserInFirestore(loginId, loginPassword);
      if (res.success && res.user) {
        onUpdateUser(res.user);
        toast.success(`🎉 Welcome back, ${res.user.name || res.user.companyName}!`);
        navigate('/');
      } else {
        setLoginError(res.error || 'Login failed. Please check credentials.');
      }
    } catch {
      setLoginError('Authentication connection failure.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regCompany.trim() || !regUsername.trim() || !regPhone.trim() || !regPassword.trim()) {
      toast.error('Kripya sabhi fields enter karein!');
      return;
    }
    if (!isGstValid && regGstin) {
      toast.error('GSTIN verification failed. Sahi format me GST number likhein ya empty chhodein.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const newUser = {
        id: `user_${Date.now()}`,
        name: regName.trim(),
        companyName: regCompany.trim(),
        username: regUsername.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
        role: regRole,
        gstin: regGstin.trim().toUpperCase(),
        isVerified: false,
        membershipType: 'free',
        createdAt: Date.now()
      };
      const success = await syncUserToFirestore(newUser);
      if (success) {
        onUpdateUser(newUser);
        toast.success('🎉 Registration Successful! Welcome to Vyapar Bridge B2B Commerce!');
        navigate('/');
      } else {
        toast.error('Failed to register. Username or Phone number might already exist.');
      }
    } catch {
      toast.error('Registration server connection failure.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTabChange = (targetTab: 'login' | 'register') => {
    setAuthTab(targetTab);
    navigate(targetTab === 'login' ? '/login' : '/register');
  };

  return (
    <div id="auth-page" className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-full shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Home Feed</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl relative flex flex-col space-y-6 my-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-amber-500 p-0.5 bg-white shadow-md flex items-center justify-center">
            <img src={BRAND_LOGO_SRC} alt="Vyapar Bridge" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">{BRAND_NAME}</h2>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase text-amber-500 dark:text-amber-400 mt-0.5">{BRAND_MOTTO}</p>
          </div>
        </div>

        {/* Login/Register Tabs */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button 
            id="tab-btn-signin"
            onClick={() => handleTabChange('login')} 
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase transition-colors ${authTab === 'login' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
          >
            Sign In
          </button>
          <button 
            id="tab-btn-register"
            onClick={() => handleTabChange('register')} 
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase transition-colors ${authTab === 'register' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}
          >
            Register
          </button>
        </div>

        {authTab === 'login' ? (
          <>
            <form id="auth-login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div id="login-error-alert" className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-900/40 leading-tight">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Username / Mobile Number / Email</label>
                <div className="relative">
                  <input 
                    id="login-id-input"
                    type="text" 
                    required 
                    value={loginId} 
                    onChange={(e) => setLoginId(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                    placeholder="e.g. factory_owner or 9876543210" 
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <input 
                    id="login-password-input"
                    type="password" 
                    required 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                    placeholder="••••••••" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>
              <button 
                id="login-submit-btn"
                type="submit" 
                disabled={isAuthenticating} 
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-extrabold uppercase py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In Securely 🔒'}
              </button>
            </form>

            {/* Quick Demo Logins for Testing */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
              <p className="text-center text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                Quick Testing / Administrative Logins
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginId('manit');
                    setLoginPassword('admin');
                    toast.success('Admin credentials loaded! Press Log In to enter.');
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-red-200 dark:border-red-950/40 bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-[1.02] cursor-pointer text-center"
                >
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase">Admin Panel</span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">manit / admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginId('manufacturer');
                    setLoginPassword('123456');
                    toast.success('Manufacturer credentials loaded! Press Log In to enter.');
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-dashed border-amber-200 dark:border-amber-950/40 bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all hover:scale-[1.02] cursor-pointer text-center"
                >
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">Manufacturer</span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">manufacturer / 123456</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <form id="auth-register-form" onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-200 max-h-[55vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Owner Name</label>
              <div className="relative">
                <input 
                  id="reg-name-input"
                  type="text" 
                  required 
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                  placeholder="Your Name" 
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Company / Business Name</label>
              <div className="relative">
                <input 
                  id="reg-company-input"
                  type="text" 
                  required 
                  value={regCompany} 
                  onChange={(e) => setRegCompany(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                  placeholder="e.g. Morbi Ceramics" 
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Username (Lowercase & Alphanumeric)</label>
              <div className="relative">
                <input 
                  id="reg-username-input"
                  type="text" 
                  required 
                  value={regUsername} 
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                  placeholder="e.g. morbi_traders" 
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">10-Digit Mobile Number</label>
              <div className="relative">
                <input 
                  id="reg-phone-input"
                  type="tel" 
                  required 
                  pattern="[6-9][0-9]{9}" 
                  value={regPhone} 
                  onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                  placeholder="e.g. 9876543210" 
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <input 
                  id="reg-password-input"
                  type="password" 
                  required 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100" 
                  placeholder="Choose Password" 
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Business Role Type</label>
              <select 
                id="reg-role-select"
                value={regRole} 
                onChange={(e: any) => setRegRole(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100 font-semibold"
              >
                <option value="customer">Retailer / Shopkeeper (Customer)</option>
                <option value="dealer">Dealer / Distributor / Wholesaler</option>
                <option value="manufacturer">Company / Factory / Manufacturer</option>
                <option value="architect">Architect / Interior Designer</option>
              </select>
            </div>

            {/* GST input component integration */}
            <GstInput value={regGstin} onChange={setRegGstin} onValidationChange={setIsGstValid} />

            <button 
              id="reg-submit-btn"
              type="submit" 
              disabled={isAuthenticating} 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-extrabold uppercase py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register B2B Account ✨'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-slate-400 dark:text-zinc-500 text-[11px] font-semibold uppercase tracking-wider space-x-4">
        <span>Vyapar Bridge B2B Commerce Platform</span>
        <span>•</span>
        <span>India's Vocal for Local Hub</span>
      </div>
    </div>
  );
}
