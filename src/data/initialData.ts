import { CompanySettings, Customer, Loan, LoanApplication, RepaymentRecord, StaffUser, SystemNotification, AuditLog } from '../types';

export const initialCompanySettings: CompanySettings = {
  companyName: 'CASH FIRST GROUP',
  tagline: 'Fast, Secure & Confidential Application. Collateral Based Loan.',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><rect width="500" height="500" fill="white" rx="60"/><g transform="translate(50, 10)"><path d="M 200 40 A 160 160 0 0 1 360 200" fill="none" stroke="%2315803d" stroke-width="24" stroke-linecap="round"/><path d="M 360 200 A 160 160 0 0 1 100 320" fill="none" stroke="%230f2b5c" stroke-width="24" stroke-linecap="round"/><path d="M 120 310 C 160 360 240 370 280 330 C 310 300 280 280 240 280 L 180 290 Z" fill="%230f2b5c"/><rect x="150" y="220" width="18" height="40" rx="4" fill="%2315803d"/><rect x="180" y="190" width="18" height="70" rx="4" fill="%2315803d"/><path d="M 210 240 C 210 180 260 170 290 180 C 310 188 320 200 310 220 L 285 220 C 290 205 280 195 265 195 C 240 195 235 215 235 240 C 235 265 245 285 270 285 L 315 240 L 315 220 L 260 220" fill="none" stroke="%230f2b5c" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M 270 200 L 320 200 M 270 230 L 310 230" stroke="%2315803d" stroke-width="16" stroke-linecap="round"/><path d="M 150 250 L 280 140 M 280 140 L 235 140 M 280 140 L 280 185" fill="none" stroke="%23ca8a04" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></g><text x="250" y="395" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="46"><tspan fill="%230f2b5c">CASH </tspan><tspan fill="%2315803d">FIRST</tspan></text><text x="250" y="435" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="28" fill="%23ca8a04" letter-spacing="12">GROUP</text></svg>',
  primaryColor: '#0f2b5c',
  secondaryColor: '#15803d',
  phone: '+265 994 169 563 / +265 885 377 451',
  email: 'support@cashfirstgroup.mw',
  address: 'Lilongwe Branch (New Shire) & Mzuzu Branch (Dunduzu), Malawi',
  website: 'https://cashfirstgroup.mw',
  socialFacebook: 'https://facebook.com/cashfirstgroup',
  socialTwitter: 'https://twitter.com/cashfirstgroup',
  socialWhatsApp: '+265 994 169 563',
  currencySymbol: 'MWK',
  currencyCode: 'MWK',
  minLoanAmount: 20000,
  maxLoanAmount: 2000000,
  defaultInterestRate: 25,
  defaultInterestType: 'Flat',
  defaultPenaltyType: 'Fixed',
  defaultPenaltyValue: 5000,
  gracePeriodDays: 2,
  businessHours: 'Mon - Fri: 8:00 AM - 5:00 PM CAT (24/7 Online)',
  enable2FA: true,
  enableSMSAlerts: true,
  messagingTemplates: {
    applicationReceived: 'CASH FIRST GROUP: Your loan application #{loanId} for MWK {amount} has been received and is under review.',
    loanApproved: 'CASH FIRST GROUP: Congratulations {customerName}! Your loan application #{loanId} for MWK {amount} has been APPROVED.',
    loanRejected: 'CASH FIRST GROUP: We regret to inform you that your loan application #{loanId} was declined. Reason: {reason}.',
    loanDisbursed: 'CASH FIRST GROUP: MWK {amount} has been successfully disbursed for Loan #{loanId}.',
    repaymentDue: 'CASH FIRST GROUP: Payment reminder of MWK {dueAmount} for Loan #{loanId} due on {dueDate}.',
    repaymentReceived: 'CASH FIRST GROUP: Payment of MWK {paidAmount} received for Loan #{loanId}. Balance: MWK {balance}.',
    loanOverdue: 'CASH FIRST GROUP: ALERT! Your Loan #{loanId} is {daysOverdue} days overdue. Balance: MWK {balance}. Please settle immediately.',
  },
};

export const initialStaffUsers: StaffUser[] = [];
export const initialCustomers: Customer[] = [];
export const initialLoanApplications: LoanApplication[] = [];
export const initialLoans: Loan[] = [];
export const initialRepayments: RepaymentRecord[] = [];
export const initialNotifications: SystemNotification[] = [];
export const initialAuditLogs: AuditLog[] = [];
