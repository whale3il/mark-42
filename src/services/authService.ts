import {
  AuthUser,
  UserRegistrationPayload,
  PinSetupPayload,
  AccountCreationPayload,
  GeneratedNubanAccount
} from '../types/auth';
import { generateNigerianNuban, SUPPORTED_NIGERIAN_CLEARING_BANKS } from '../utils/nubanGenerator';
import { USER_PROFILE, INITIAL_ACCOUNTS } from '../data/mockData';
import { BankAccount } from '../types/banking';

const STORAGE_KEY_USER = 'aureus_auth_user';
const STORAGE_KEY_ACCOUNTS = 'aureus_user_accounts';

/**
 * Service client contract for Authentication and Account Provisioning.
 * Prepared for plug-and-play connection to Express + Prisma backend.
 */
export class AuthService {
  /**
   * Retrieves currently logged in user from local storage or returns null.
   */
  static getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Returns demo user profile for fast 1-click preview.
   */
  static getDemoUser(): AuthUser {
    return {
      id: 'usr-demo-alexander',
      firstName: 'Alexander',
      lastName: 'Wright',
      name: USER_PROFILE.name,
      email: USER_PROFILE.email,
      phone: USER_PROFILE.phone,
      title: USER_PROFILE.title,
      clientTier: USER_PROFILE.clientTier,
      kycLevel: 'Tier 3 (BVN & ID Verified)',
      hasTransactionPin: true,
      pinMasked: '••••',
      primaryAccountNumber: '8940 3120 4821',
      accountNumberMasked: USER_PROFILE.accountNumberMasked,
      memberSince: USER_PROFILE.memberSince,
      avatarUrl: USER_PROFILE.avatarUrl,
      relationshipManager: USER_PROFILE.relationshipManager
    };
  }

  /**
   * Authenticate user with Email/Account Number and Password.
   * Connects to POST /api/auth/login in production backend.
   */
  static async login(identifier: string, _password: string): Promise<AuthUser> {
    // In production: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
    const existing = this.getCurrentUser();
    if (existing && (existing.email.toLowerCase() === identifier.toLowerCase() || existing.primaryAccountNumber.replace(/\s+/g, '') === identifier.replace(/\s+/g, ''))) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(existing));
      return existing;
    }

    // Default to demo user
    const demo = this.getDemoUser();
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demo));
    return demo;
  }

  /**
   * Registers a new user account.
   * Connects to POST /api/auth/register in production backend.
   */
  static async registerUser(payload: UserRegistrationPayload): Promise<AuthUser> {
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      name: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      clientTier: 'Aureus Sovereign Private Client',
      kycLevel: payload.bvnConsent ? 'Tier 3 (BVN & ID Verified)' : 'Tier 2',
      hasTransactionPin: false,
      primaryAccountNumber: '',
      accountNumberMasked: '•••• pending',
      memberSince: new Date().getFullYear().toString(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      relationshipManager: {
        name: 'Chinedu Adeleke',
        title: 'VP, Sovereign Wealth & Private Banking',
        email: 'c.adeleke@aureusbank.ng',
        phone: '+234 1 890 0041',
        office: '42 Marina, Lagos Financial District'
      }
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    return newUser;
  }

  /**
   * Set secure 4-digit transaction PIN.
   * Connects to POST /api/auth/set-pin in production backend.
   */
  static async setTransactionPin(userId: string, payload: PinSetupPayload): Promise<boolean> {
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.hasTransactionPin = true;
      current.pinMasked = '••••';
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(current));
    }
    return true;
  }

  /**
   * Generates a CBN-compliant Nigerian NUBAN account.
   * Connects to POST /api/accounts/create in production backend.
   */
  static async provisionNubanAccount(
    user: AuthUser,
    accountPayload: AccountCreationPayload
  ): Promise<{ nubanAccount: GeneratedNubanAccount; bankAccount: BankAccount }> {
    const bank = SUPPORTED_NIGERIAN_CLEARING_BANKS[0]; // Aureus Bank 090
    const { nuban, formatted } = generateNigerianNuban(bank.code);

    const nubanAccount: GeneratedNubanAccount = {
      accountNumber: nuban,
      accountName: `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`,
      bankName: bank.name,
      cbnBankCode: bank.code,
      nibssRoutingCode: bank.nipCode,
      accountType: accountPayload.accountType,
      accountCategoryTitle: accountPayload.accountCategoryTitle,
      currency: accountPayload.currency,
      openingBalance: accountPayload.initialDeposit,
      dailyTransferLimit: accountPayload.dailyTransferLimit,
      status: 'active',
      issuedAt: new Date().toISOString()
    };

    // Construct app-wide BankAccount
    const bankAccount: BankAccount = {
      id: `acc-nuban-${Date.now()}`,
      name: `${accountPayload.accountCategoryTitle} (${formatted})`,
      type: accountPayload.accountType,
      accountNumber: formatted,
      routingNumber: bank.sortCode,
      balance: accountPayload.initialDeposit,
      availableBalance: accountPayload.initialDeposit,
      currency: accountPayload.currency,
      interestRate: accountPayload.accountType === 'savings' ? 12.5 : undefined,
      colorTheme: 'emerald'
    };

    // Update user primary account
    user.primaryAccountNumber = formatted;
    user.accountNumberMasked = `•••• ${nuban.slice(-4)}`;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    // Save account to stored list
    const currentAccounts = this.getUserStoredAccounts();
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify([bankAccount, ...currentAccounts]));

    return { nubanAccount, bankAccount };
  }

  /**
   * Retrieves accounts stored for user or defaults to initial mock accounts.
   */
  static getUserStoredAccounts(): BankAccount[] {
    if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
    const stored = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!stored) return INITIAL_ACCOUNTS;
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  }

  /**
   * Logs out user and clears active session token.
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }
}
