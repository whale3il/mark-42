import { CurrencyCode } from './banking';

export type KycTier = 'Tier 1' | 'Tier 2' | 'Tier 3 (BVN & ID Verified)';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  title?: string;
  clientTier: string;
  kycLevel: KycTier;
  hasTransactionPin: boolean;
  pinMasked?: string;
  primaryAccountNumber: string;
  accountNumberMasked: string;
  memberSince: string;
  avatarUrl: string;
  relationshipManager: {
    name: string;
    title: string;
    email: string;
    phone: string;
    office: string;
  };
}

export type AuthMode = 'login' | 'signup';

export type SignUpStep =
  | 'user_info'
  | 'set_pin'
  | 'choose_account'
  | 'generate_nuban'
  | 'success';

export interface UserRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  stateProvince: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
  bvnConsent: boolean;
}

export interface PinSetupPayload {
  pin: string;
  confirmPin: string;
  biometricEnabled: boolean;
}

export interface AccountCreationPayload {
  accountType: 'savings' | 'checking' | 'multicurrency' | 'investment';
  accountCategoryTitle: string;
  currency: CurrencyCode;
  accountNickname: string;
  initialDeposit: number;
  dailyTransferLimit: number;
}

export interface GeneratedNubanAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  cbnBankCode: string;
  nibssRoutingCode: string;
  accountType: 'savings' | 'checking' | 'multicurrency' | 'investment';
  accountCategoryTitle: string;
  currency: CurrencyCode;
  openingBalance: number;
  dailyTransferLimit: number;
  status: 'active' | 'pending';
  issuedAt: string;
}
