import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Landmark,
  CreditCard,
  Copy,
  Check,
  DollarSign,
  Sun,
  Moon,
  Info,
  Layers,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import {
  AuthUser,
  SignUpStep,
  UserRegistrationPayload,
  PinSetupPayload,
  AccountCreationPayload,
  GeneratedNubanAccount
} from '../../types/auth';
import { CurrencyCode, BankAccount } from '../../types/banking';
import { AuthService } from '../../services/authService';
import { SUPPORTED_NIGERIAN_CLEARING_BANKS } from '../../utils/nubanGenerator';

interface SignUpWizardProps {
  onComplete: (user: AuthUser, initialAccount: BankAccount) => void;
  onNavigateToLogin: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const SignUpWizard: React.FC<SignUpWizardProps> = ({
  onComplete,
  onNavigateToLogin,
  theme,
  toggleTheme
}) => {
  const [currentStep, setCurrentStep] = useState<SignUpStep>('user_info');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 State: User Information
  const [userInfo, setUserInfo] = useState<UserRegistrationPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+234 ',
    dateOfBirth: '1992-06-15',
    stateProvince: 'Lagos',
    password: '',
    confirmPassword: '',
    agreedToTerms: true,
    bvnConsent: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 State: PIN Setup
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Step 3 State: Account Choice
  const [accountType, setAccountType] = useState<'savings' | 'checking' | 'multicurrency' | 'investment'>('savings');
  const [accountCategoryTitle, setAccountCategoryTitle] = useState('Apex Tier 3 Savings');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [accountNickname, setAccountNickname] = useState('Primary Operational Ledger');
  const [initialDeposit, setInitialDeposit] = useState<number>(150000);
  const [dailyLimit, setDailyLimit] = useState<number>(5000000);

  // Step 4 State: Generated NUBAN
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);
  const [generatedNuban, setGeneratedNuban] = useState<GeneratedNubanAccount | null>(null);
  const [createdBankAccount, setCreatedBankAccount] = useState<BankAccount | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copiedNuban, setCopiedNuban] = useState(false);

  // Password validation helpers
  const hasMinLength = userInfo.password.length >= 8;
  const hasUpper = /[A-Z]/.test(userInfo.password);
  const hasNumber = /[0-9]/.test(userInfo.password);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber;

  // STEP 1 -> STEP 2: Submit user info
  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
      setError('Please provide your first and last legal name.');
      return;
    }
    if (!userInfo.email.trim() || !userInfo.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!userInfo.phone.trim() || userInfo.phone.length < 8) {
      setError('Please provide a valid contact phone number.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters with uppercase and numbers.');
      return;
    }
    if (userInfo.password !== userInfo.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!userInfo.agreedToTerms) {
      setError('You must agree to the banking terms and regulatory disclosure.');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.registerUser(userInfo);
      setRegisteredUser(user);
      setCurrentStep('set_pin');
    } catch {
      setError('Could not process registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Submit PIN
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pinStr = pin.join('');
    const confirmPinStr = confirmPin.join('');

    if (pinStr.length !== 4 || !/^\d{4}$/.test(pinStr)) {
      setError('Please enter a valid 4-digit numeric transaction PIN.');
      return;
    }
    if (pinStr !== confirmPinStr) {
      setError('PIN confirmation does not match. Please re-enter.');
      return;
    }

    if (!registeredUser) return;

    setLoading(true);
    try {
      await AuthService.setTransactionPin(registeredUser.id, {
        pin: pinStr,
        confirmPin: confirmPinStr,
        biometricEnabled
      });
      setCurrentStep('choose_account');
    } catch {
      setError('Failed to configure transaction PIN.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 -> STEP 4: Submit Account Choice & Generate NUBAN
  const handleAccountChoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!registeredUser) return;

    setCurrentStep('generate_nuban');
    setGenerationProgress(15);

    // Simulate authentic CBN generation steps with progress animation
    setTimeout(() => setGenerationProgress(45), 400);
    setTimeout(() => setGenerationProgress(75), 900);

    setTimeout(async () => {
      try {
        const result = await AuthService.provisionNubanAccount(registeredUser, {
          accountType,
          accountCategoryTitle,
          currency,
          accountNickname,
          initialDeposit,
          dailyTransferLimit: dailyLimit
        });

        setGeneratedNuban(result.nubanAccount);
        setCreatedBankAccount(result.bankAccount);
        setGenerationProgress(100);

        setTimeout(() => {
          setCurrentStep('success');
        }, 500);
      } catch {
        setError('Error generating NUBAN. Please try again.');
        setCurrentStep('choose_account');
      }
    }, 1500);
  };

  const handleCopyNuban = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNuban(true);
    setTimeout(() => setCopiedNuban(false), 2000);
  };

  // Final CTA: Proceed to dashboard
  const handleFinish = () => {
    if (registeredUser && createdBankAccount) {
      onComplete(registeredUser, createdBankAccount);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-neutral-950 text-neutral-100'} p-4 sm:p-8 transition-colors duration-200`}>
      {/* Top Bar Header */}
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
                Account Provisioning
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">Central Bank of Nigeria (CBN) NUBAN Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-100 transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
          </button>

          <button
            onClick={onNavigateToLogin}
            className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
          >
            <span>Existing Client?</span>
            <span className="text-emerald-400 font-medium">Log In</span>
          </button>
        </div>
      </div>

      {/* Main Flow Container */}
      <div className="w-full max-w-2xl mx-auto my-6">
        {/* Step Indicator */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between text-xs font-mono mb-2 text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step {currentStep === 'user_info' ? 1 : currentStep === 'set_pin' ? 2 : currentStep === 'choose_account' ? 3 : currentStep === 'generate_nuban' ? 4 : 5} of 5</span>
            </span>
            <span className="text-neutral-500 capitalize">
              {currentStep === 'user_info' && '1. Account Registration'}
              {currentStep === 'set_pin' && '2. Security PIN Setup'}
              {currentStep === 'choose_account' && '3. Vault & Account Selection'}
              {currentStep === 'generate_nuban' && '4. Minting 10-Digit NUBAN'}
              {currentStep === 'success' && '5. Confirmation & Vault Access'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{
                width:
                  currentStep === 'user_info'
                    ? '20%'
                    : currentStep === 'set_pin'
                    ? '40%'
                    : currentStep === 'choose_account'
                    ? '65%'
                    : currentStep === 'generate_nuban'
                    ? '85%'
                    : '100%'
              }}
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CARD CONTENT ACCORDING TO STEP */}
        <div className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
          {/* STEP 1: USER REGISTRATION */}
          {currentStep === 'user_info' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-neutral-100">
                  Open Private Client Account
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Establish your individual sovereign profile with Central Bank of Nigeria compliant verification.
                </p>
              </div>

              <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Legal First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userInfo.firstName}
                        onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                        placeholder="Chukwudi"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Legal Last / Surname
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userInfo.lastName}
                        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                        placeholder="Okafor"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        placeholder="c.okafor@company.ng"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Phone Number (Nigerian / Intl)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        placeholder="+234 803 123 4567"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={userInfo.dateOfBirth}
                        onChange={(e) => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      State / City of Residence
                    </label>
                    <select
                      value={userInfo.stateProvince}
                      onChange={(e) => setUserInfo({ ...userInfo, stateProvince: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Lagos">Lagos State (Victoria Island / Ikoyi)</option>
                      <option value="Abuja">Abuja FCT (Maitama / Asokoro)</option>
                      <option value="Rivers">Rivers State (Port Harcourt)</option>
                      <option value="Oyo">Oyo State (Ibadan)</option>
                      <option value="Kano">Kano State</option>
                      <option value="Diaspora">Overseas / Diaspora Non-Resident</option>
                    </select>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Master Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userInfo.password}
                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userInfo.confirmPassword}
                        onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80 grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Uppercase Letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Numeric Digit
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-2 pt-2 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer text-neutral-400">
                    <input
                      type="checkbox"
                      checked={userInfo.agreedToTerms}
                      onChange={(e) => setUserInfo({ ...userInfo, agreedToTerms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-[11px] leading-tight">
                      I agree to the Aureus Wealth Private Bank Electronic Terms of Service, Privacy Policy, and Nigerian NDIC deposit insurance regulations.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-neutral-400">
                    <input
                      type="checkbox"
                      checked={userInfo.bvnConsent}
                      onChange={(e) => setUserInfo({ ...userInfo, bvnConsent: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-[11px] leading-tight">
                      I authorize instant Central Bank of Nigeria (CBN) Tier 3 KYC and electronic BVN/NIN verification.
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    ← Back to Log In
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <span>Proceed to PIN Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: SET TRANSACTION PIN */}
          {currentStep === 'set_pin' && (
            <div>
              <div className="mb-6 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-100">
                  Set Secure 4-Digit Transaction PIN
                </h2>
                <p className="text-xs text-neutral-400 mt-1.5">
                  Your 4-digit PIN authorizes instant NIP transfers, bill settlements, wire disbursements, and card controls.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6 max-w-sm mx-auto">
                <div>
                  <label className="block text-center text-xs font-medium text-neutral-300 mb-2">
                    Enter 4-Digit Transaction PIN
                  </label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={`pin-${idx}`}
                        id={`pin-input-${idx}`}
                        type="password"
                        maxLength={1}
                        value={pin[idx]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newPin = [...pin];
                          newPin[idx] = val;
                          setPin(newPin);
                          if (val && idx < 3) {
                            const next = document.getElementById(`pin-input-${idx + 1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
                            const prev = document.getElementById(`pin-input-${idx - 1}`);
                            prev?.focus();
                          }
                        }}
                        className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-center text-xs font-medium text-neutral-300 mb-2">
                    Confirm 4-Digit Transaction PIN
                  </label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={`confirm-pin-${idx}`}
                        id={`confirm-pin-input-${idx}`}
                        type="password"
                        maxLength={1}
                        value={confirmPin[idx]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newPin = [...confirmPin];
                          newPin[idx] = val;
                          setConfirmPin(newPin);
                          if (val && idx < 3) {
                            const next = document.getElementById(`confirm-pin-input-${idx + 1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !confirmPin[idx] && idx > 0) {
                            const prev = document.getElementById(`confirm-pin-input-${idx - 1}`);
                            prev?.focus();
                          }
                        }}
                        className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
                  <div className="flex items-center gap-2 text-neutral-200 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security Protocol Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Aureus Wealth Bank employees will never ask for your PIN. Do not use repetitive digits (e.g. 1111) or consecutive numbers (e.g. 1234).
                  </p>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-neutral-200">Enable Biometric & Hardware Passkey</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                  />
                </label>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('user_info')}
                    className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <span>Save PIN & Choose Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: CHOOSE ACCOUNT TYPE */}
          {currentStep === 'choose_account' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-neutral-100">
                  Select Your Primary Account Type
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Choose the vault structure for your initial bank account. You can create additional segregated vaults anytime from your portfolio.
                </p>
              </div>

              <form onSubmit={handleAccountChoiceSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'savings',
                      categoryTitle: 'Apex Tier 3 Savings',
                      title: 'Apex Tier 3 Savings',
                      badge: '12.5% APY Yield',
                      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                      description: 'High-interest capital preservation account with daily compounding, zero ledger fees, and instant NIBSS clearing.',
                      currencyDefault: 'NGN' as CurrencyCode,
                      dailyLimit: 5000000
                    },
                    {
                      id: 'checking',
                      categoryTitle: 'Executive Premier Current',
                      title: 'Executive Premier Current',
                      badge: 'Unlimited Volume',
                      badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
                      description: 'Designed for corporate settlements and high-volume disbursements. Includes cheque issuance and overdraft facility.',
                      currencyDefault: 'NGN' as CurrencyCode,
                      dailyLimit: 25000000
                    },
                    {
                      id: 'multicurrency',
                      categoryTitle: 'Domiciliary Multi-Currency Vault',
                      title: 'Domiciliary FX Reserve Vault',
                      badge: 'FX & SWIFT Clearing',
                      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
                      description: 'Hold, convert, and wire USD, EUR, and GBP with direct correspondent banking routes and zero FX markups.',
                      currencyDefault: 'USD' as CurrencyCode,
                      dailyLimit: 50000
                    },
                    {
                      id: 'investment',
                      categoryTitle: 'Sovereign Investment Escrow',
                      title: 'Sovereign Investment Escrow',
                      badge: 'Venture & Escrow',
                      badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
                      description: 'Segregated escrow ledger for commercial real estate, angel funding, and institutional private equity syndication.',
                      currencyDefault: 'NGN' as CurrencyCode,
                      dailyLimit: 50000000
                    }
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => {
                        setAccountType(option.id as any);
                        setAccountCategoryTitle(option.categoryTitle);
                        setCurrency(option.currencyDefault);
                        setDailyLimit(option.dailyLimit);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        accountType === option.id
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Landmark className={`w-4 h-4 ${accountType === option.id ? 'text-emerald-400' : 'text-neutral-400'}`} />
                          <span className="font-semibold text-xs text-neutral-100">{option.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${option.badgeColor}`}>
                          {option.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-neutral-800/80 pt-2">
                        <span>Daily Limit: {option.currencyDefault === 'USD' ? '$' : '₦'}{option.dailyLimit.toLocaleString()}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          NUBAN Enabled <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Account Customization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Account Nickname
                    </label>
                    <input
                      type="text"
                      value={accountNickname}
                      onChange={(e) => setAccountNickname(e.target.value)}
                      placeholder="e.g. Primary Treasury"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Base Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="NGN">NGN (₦ Nigerian Naira) - NUBAN</option>
                      <option value="USD">USD ($ United States Dollar)</option>
                      <option value="EUR">EUR (€ European Euro)</option>
                      <option value="GBP">GBP (£ British Pound)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Initial Opening Deposit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('set_pin')}
                    className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <span>Generate Nigerian NUBAN</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: GENERATING NUBAN (Live Algorithm Animation) */}
          {currentStep === 'generate_nuban' && (
            <div className="py-8 text-center max-w-md mx-auto space-y-6">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Landmark className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-100">
                  Minting Central Bank of Nigeria NUBAN
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Executing CBN Modulo 10 Checksum with Aureus Bank Clearing Code 090...
                </p>
              </div>

              {/* Progress Bar & Algorithm Steps */}
              <div className="space-y-3">
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 font-mono text-[11px] text-left space-y-1.5 text-neutral-400">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Clearing Institution:</span>
                    <span className="text-emerald-400 font-semibold">Aureus Wealth Bank Ltd</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CBN Bank Code:</span>
                    <span>090</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NIBSS Routing Prefix:</span>
                    <span>090581</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Algorithm Checksum:</span>
                    <span className="text-cyan-400">Modulo-10 Weighted Sum</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: POST-REGISTRATION SUCCESS SCREEN */}
          {currentStep === 'success' && generatedNuban && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Account Successfully Provisioned</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
                  Welcome to Aureus Private Wealth
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your Central Bank of Nigeria compliant 10-digit NUBAN is active and ready for domestic and international settlement.
                </p>
              </div>

              {/* Luxury Digital Certificate / Account Passport */}
              <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Central Bank of Nigeria NUBAN Certificate
                    </span>
                    <div className="text-sm font-bold text-neutral-100 mt-0.5">
                      {generatedNuban.accountCategoryTitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Tier 3 Verified</span>
                  </div>
                </div>

                {/* 10-Digit NUBAN Highlight Box */}
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 mb-6">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>NUBAN Account Number</span>
                    <button
                      onClick={() => handleCopyNuban(generatedNuban.accountNumber)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedNuban ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono">Copy NUBAN</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-neutral-100 flex items-center gap-3">
                    <span>{generatedNuban.accountNumber.slice(0, 4)}</span>
                    <span>{generatedNuban.accountNumber.slice(4, 7)}</span>
                    <span className="text-emerald-400">{generatedNuban.accountNumber.slice(7)}</span>
                  </div>

                  <div className="mt-2 text-[11px] text-neutral-500 font-mono flex items-center gap-4">
                    <span>Bank: Aureus Wealth Bank (090)</span>
                    <span>·</span>
                    <span>Sort Code: 090110</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-neutral-800/40 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Account Holder</span>
                    <span className="text-neutral-200 font-semibold truncate block mt-0.5">
                      {generatedNuban.accountName}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-800/40 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Opening Balance</span>
                    <span className="text-emerald-400 font-semibold block mt-0.5">
                      {currency === 'NGN' ? '₦' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                      {generatedNuban.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-800/40 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Daily Limit</span>
                    <span className="text-neutral-200 font-semibold block mt-0.5">
                      {currency === 'NGN' ? '₦' : '$'}{generatedNuban.dailyTransferLimit.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-800/40 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">Transaction PIN</span>
                    <span className="text-emerald-400 font-semibold block mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active (4-Digit)
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready for Express / Prisma notice */}
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Architecture: Node.js / Express + Prisma + PostgreSQL Ready Model</span>
                </span>
                <span className="text-emerald-400 font-mono">Status: Connected</span>
              </div>

              {/* Finish Button */}
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Launch Executive Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-neutral-600">
        © {new Date().getFullYear()} Aureus Wealth Private Bank. Multi-Account NUBAN Architecture.
      </div>
    </div>
  );
};
