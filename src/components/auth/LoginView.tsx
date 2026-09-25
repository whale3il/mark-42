import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Landmark,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { AuthUser } from '../../types/auth';

interface LoginViewProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateToSignUp: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onNavigateToSignUp,
  theme,
  toggleTheme
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your email address or 10-digit NUBAN account number.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.login(identifier, password);
      onSuccess(user);
    } catch {
      setError('Invalid credentials. Please verify your details or use demo access.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoUser = AuthService.getDemoUser();
      localStorage.setItem('aureus_auth_user', JSON.stringify(demoUser));
      onSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-neutral-950 text-neutral-100'} p-4 sm:p-8 transition-colors duration-200 relative`}>
      {/* Top Bar / Branding */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 shadow-md">
            <span className="text-base font-bold tracking-wider text-emerald-400 font-mono">AV</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight font-sans">
                Aureus Wealth
              </span>
              <span className="text-[10px] font-medium tracking-wider text-emerald-500 uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">
                Private Bank
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Institutional Sovereign Wealth & Clearing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
          </button>

          <button
            onClick={handleDemoLogin}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Login</span>
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Form Header */}
          <div className="relative mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-[11px] font-mono text-neutral-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NIBSS & CBN Protected Gateway</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-sans text-neutral-100">
              Client Portal Login
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your registered credentials or 10-digit NUBAN to access your portfolio
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email Address or 10-Digit NUBAN
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. client@aureusbank.com or 0129482015"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                  required
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-neutral-400">Remember this workstation</span>
              </label>

              <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-emerald-400" /> 2FA Ready
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <>
                  <span>Authenticate & Open Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Button for mobile & desktop */}
          <div className="mt-4 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Log In as Demo Client (Alexander V. Wright)</span>
            </button>
          </div>

          {/* Switch to Sign Up */}
          <div className="mt-5 text-center">
            <p className="text-xs text-neutral-400">
              New to Aureus Wealth Bank?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 ml-1 transition-colors"
              >
                Create Account & Generate NUBAN →
              </button>
            </p>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center space-y-1.5">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit TLS Military Encryption · CBN Licensed · NDIC Insured
          </p>
          <p className="text-[10px] text-neutral-600 font-mono">
            Node.js / Express + Prisma Backend Ready Client
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-100 mb-1">Reset Access Credentials</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Enter your registered email address or NUBAN to receive a secure recovery magic link.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Recovery instructions transmitted to your security channel.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="client@aureusbank.com"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  required
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-neutral-600">
        © {new Date().getFullYear()} Aureus Wealth Private Bank. Central Bank of Nigeria Regulatory Standard NUBAN Integration.
      </div>
    </div>
  );
};
