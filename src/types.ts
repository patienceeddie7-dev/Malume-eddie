export type UserRole = 'Customer' | 'Super Admin' | 'Manager' | 'Loan Officer' | 'Cashier' | 'Auditor';

export type KYCStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
export type CustomerAccountStatus = 'Active' | 'Suspended' | 'Blacklisted';

export interface Customer {
  id: string;
  firebaseUid?: string;
  username?: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  kycStatus: KYCStatus;
  accountStatus: CustomerAccountStatus;
  avatarUrl?: string;
  nationalIdDocUrl?: string;
  selfieUrl?: string;
  incomeProofUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface StaffUser {
  id: string;
  firebaseUid?: string;
  username?: string;
  password?: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  branch?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userType: 'customer' | 'staff';
  role?: UserRole;
  avatarUrl?: string;
  customerData?: Customer;
  staffData?: StaffUser;
}

export type InterestType = 'Flat' | 'Reducing Balance' | 'Daily' | 'Weekly' | 'Monthly';
export type PenaltyType = 'Fixed' | 'Percentage' | 'Daily' | 'Weekly';

export type LoanApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed' | 'Cancelled';

export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  periodValue: number; // e.g. 6 (months/weeks/days)
  periodUnit: 'Months' | 'Weeks' | 'Days';
  interestType: InterestType;
  interestRate: number; // percentage
  monthlyInstallment: number;
  totalInterest: number;
  totalPayable: number;
  purpose: string;
  signatureUrl: string;
  clientPhotoUrl: string; // Compulsory client face photo
  collateralName: string; // Compulsory collateral item name
  collateralPhotoUrl: string; // Compulsory collateral photo
  status: LoanApplicationStatus;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  disbursedAt?: string;
  rejectedReason?: string;
  riskScore?: number; // 0 - 100
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export type LoanStatus = 'Active' | 'Paid Off' | 'Overdue' | 'Defaulted';

export interface RepaymentScheduleItem {
  installmentNo: number;
  dueDate: string;
  principal: number;
  interest: number;
  penalty: number;
  totalDue: number;
  paidAmount: number;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
}

export interface Loan {
  id: string;
  applicationId: string;
  customerId: string;
  customerName: string;
  principal: number;
  balance: number;
  totalPaid: number;
  totalInterest: number;
  totalPayable: number;
  interestType: InterestType;
  interestRate: number;
  penaltyType: PenaltyType;
  penaltyValue: number;
  status: LoanStatus;
  startDate: string;
  dueDate: string;
  nextPaymentDate: string;
  schedule: RepaymentScheduleItem[];
  penaltiesAccrued: number;
  daysOverdue: number;
  signatureUrl: string;
  clientPhotoUrl?: string;
  collateralName?: string;
  collateralPhotoUrl?: string;
}

export type PaymentMethod = 'M-Pesa' | 'Bank Transfer' | 'Card' | 'Cash';

export interface RepaymentRecord {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  phoneNumber?: string;
  date: string;
  recordedBy: string;
  receiptUrl?: string;
  notes?: string;
}

export interface MessagingTemplates {
  applicationReceived: string;
  loanApproved: string;
  loanRejected: string;
  loanDisbursed: string;
  repaymentDue: string;
  repaymentReceived: string;
  loanOverdue: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  socialFacebook: string;
  socialTwitter: string;
  socialWhatsApp: string;
  // Loan Config
  currencySymbol: string;
  currencyCode: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  defaultInterestRate: number;
  defaultInterestType: InterestType;
  // Penalty Config
  defaultPenaltyType: PenaltyType;
  defaultPenaltyValue: number; // e.g. $15 fixed or 5%
  gracePeriodDays: number;
  // System Config
  businessHours: string;
  enable2FA: boolean;
  enableSMSAlerts: boolean;
  messagingTemplates: MessagingTemplates;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  recipientId: string; // 'all_staff', customerId, or staffId
  title: string;
  message: string;
  channel: 'SMS' | 'Email' | 'Push' | 'WhatsApp';
  date: string;
  read: boolean;
  type: 'application' | 'approval' | 'repayment' | 'overdue' | 'system';
}
