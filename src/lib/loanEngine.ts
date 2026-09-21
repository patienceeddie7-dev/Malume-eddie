import { InterestType, PenaltyType, RepaymentScheduleItem } from '../types';

export interface CalculationResult {
  principal: number;
  totalInterest: number;
  totalPayable: number;
  monthlyInstallment: number;
  schedule: RepaymentScheduleItem[];
}

/**
 * Official CASH FIRST GROUP Interest Rates Table:
 * 1 Week: 15%
 * 2 Weeks: 25%
 * 3 Weeks: 30%
 * 4 Weeks (1 Month): 40%
 */
export function getCashFirstInterestRate(periodValue: number, periodUnit: 'Months' | 'Weeks' | 'Days'): number {
  if (periodUnit === 'Weeks') {
    if (periodValue <= 1) return 15;
    if (periodValue === 2) return 25;
    if (periodValue === 3) return 30;
    if (periodValue === 4) return 40;
    return Math.min(100, periodValue * 10);
  }
  if (periodUnit === 'Months') {
    if (periodValue <= 1) return 40;
    return periodValue * 35;
  }
  if (periodValue <= 7) return 15;
  if (periodValue <= 14) return 25;
  if (periodValue <= 21) return 30;
  return 40;
}

/**
 * Calculates loan repayments based on interest type and period.
 */
export function calculateLoan(
  principal: number,
  periodValue: number,
  periodUnit: 'Months' | 'Weeks' | 'Days',
  interestRate: number,
  interestType: InterestType,
  startDateStr: string = new Date().toISOString().split('T')[0]
): CalculationResult {
  const numInstallments = Math.max(1, Math.round(periodValue));
  let totalInterest = 0;
  let schedule: RepaymentScheduleItem[] = [];

  const startDate = new Date(startDateStr);

  // Use official Cash First Group tier rate if periodUnit is Weeks or Days
  const effectiveRate = (periodUnit === 'Weeks' || (periodUnit === 'Months' && periodValue === 1))
    ? getCashFirstInterestRate(periodValue, periodUnit)
    : interestRate;

  if (interestType === 'Flat' || periodUnit === 'Weeks') {
    // Total Interest = Principal * (Rate / 100) for weekly fixed rate tiers
    totalInterest = principal * (effectiveRate / 100);
    const totalPayable = principal + totalInterest;
    const installmentAmount = Math.round((totalPayable / numInstallments) * 100) / 100;
    const principalPerInst = Math.round((principal / numInstallments) * 100) / 100;
    const interestPerInst = Math.round((totalInterest / numInstallments) * 100) / 100;

    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(startDate);
      if (periodUnit === 'Months') dueDate.setMonth(dueDate.getMonth() + i);
      else if (periodUnit === 'Weeks') dueDate.setDate(dueDate.getDate() + i * 7);
      else dueDate.setDate(dueDate.getDate() + i);

      schedule.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: i === numInstallments ? Math.round((principal - principalPerInst * (numInstallments - 1)) * 100) / 100 : principalPerInst,
        interest: i === numInstallments ? Math.round((totalInterest - interestPerInst * (numInstallments - 1)) * 100) / 100 : interestPerInst,
        penalty: 0,
        totalDue: installmentAmount,
        paidAmount: 0,
        status: 'Pending',
      });
    }

    return {
      principal,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round((principal + totalInterest) * 100) / 100,
      monthlyInstallment: installmentAmount,
      schedule,
    };
  } else if (interestType === 'Reducing Balance') {
    // Amortization formula
    const r = (interestRate / 100) / 12; // Monthly rate
    const n = numInstallments;
    let pmt = 0;
    if (r > 0) {
      pmt = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      pmt = principal / n;
    }
    pmt = Math.round(pmt * 100) / 100;

    let balance = principal;
    totalInterest = 0;

    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(startDate);
      if (periodUnit === 'Months') dueDate.setMonth(dueDate.getMonth() + i);
      else dueDate.setDate(dueDate.getDate() + i);

      const interestComp = Math.round(balance * r * 100) / 100;
      let principalComp = Math.round((pmt - interestComp) * 100) / 100;
      if (i === numInstallments || principalComp > balance) {
        principalComp = Math.round(balance * 100) / 100;
      }
      const totalInstDue = Math.round((principalComp + interestComp) * 100) / 100;

      balance = Math.max(0, balance - principalComp);
      totalInterest += interestComp;

      schedule.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: principalComp,
        interest: interestComp,
        penalty: 0,
        totalDue: totalInstDue,
        paidAmount: 0,
        status: 'Pending',
      });
    }

    return {
      principal,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round((principal + totalInterest) * 100) / 100,
      monthlyInstallment: pmt,
      schedule,
    };
  } else {
    // Daily or Monthly simple compounding multiplier
    const timeFactor = periodUnit === 'Days' ? periodValue : periodValue * 30;
    const dailyRate = (interestRate / 100) / 30;
    totalInterest = principal * dailyRate * timeFactor;
    const totalPayable = principal + totalInterest;
    const pmt = Math.round((totalPayable / numInstallments) * 100) / 100;

    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(startDate);
      if (periodUnit === 'Months') dueDate.setMonth(dueDate.getMonth() + i);
      else dueDate.setDate(dueDate.getDate() + i);

      schedule.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principal: Math.round((principal / numInstallments) * 100) / 100,
        interest: Math.round((totalInterest / numInstallments) * 100) / 100,
        penalty: 0,
        totalDue: pmt,
        paidAmount: 0,
        status: 'Pending',
      });
    }

    return {
      principal,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round((principal + totalInterest) * 100) / 100,
      monthlyInstallment: pmt,
      schedule,
    };
  }
}

/**
 * Calculates penalty fees given days overdue and penalty config.
 */
export function calculatePenalty(
  daysOverdue: number,
  outstandingPrincipal: number,
  penaltyType: PenaltyType,
  penaltyValue: number,
  gracePeriodDays: number = 2
): number {
  if (daysOverdue <= gracePeriodDays) return 0;
  const activeOverdueDays = daysOverdue - gracePeriodDays;

  switch (penaltyType) {
    case 'Fixed':
      return penaltyValue;
    case 'Percentage':
      return Math.round((outstandingPrincipal * (penaltyValue / 100)) * 100) / 100;
    case 'Daily':
      return Math.round((activeOverdueDays * penaltyValue) * 100) / 100;
    case 'Weekly':
      const weeks = Math.ceil(activeOverdueDays / 7);
      return Math.round((weeks * penaltyValue) * 100) / 100;
    default:
      return 0;
  }
}

/**
 * Evaluates max loan eligibility based on user's financial profile.
 */
export function calculateEligibility(monthlyIncome: number, monthlyExpenses: number): {
  eligibleAmount: number;
  creditScore: number;
  recommendation: string;
} {
  const disposableIncome = Math.max(0, monthlyIncome - monthlyExpenses);
  // Safe debt service ratio (DSR) is 40% of disposable income per month
  const maxMonthlyInstallment = disposableIncome * 0.4;
  // Assuming a standard 12-month loan at 10% interest
  const eligibleAmount = Math.round(maxMonthlyInstallment * 10 * 100) / 100;

  // Credit score heuristic 300-850
  let score = 550;
  if (disposableIncome > 3000) score += 180;
  else if (disposableIncome > 1500) score += 120;
  else if (disposableIncome > 500) score += 60;

  const incomeToExpenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  if (incomeToExpenseRatio < 0.5) score += 100;
  else if (incomeToExpenseRatio < 0.8) score += 40;

  score = Math.min(850, Math.max(300, score));

  let recommendation = 'Standard approval up to limit.';
  if (score >= 750) recommendation = 'Low risk. Instant automated approval eligible.';
  else if (score >= 620) recommendation = 'Moderate risk. Loan officer manual document review required.';
  else recommendation = 'High risk. Guarantor or higher interest required.';

  return {
    eligibleAmount: Math.max(100, Math.min(50000, eligibleAmount)),
    creditScore: score,
    recommendation,
  };
}

/**
 * Calculates days overdue between current date and due date.
 */
export function getDaysOverdue(dueDateStr: string, currentDateStr: string = new Date().toISOString().split('T')[0]): number {
  const due = new Date(dueDateStr).getTime();
  const current = new Date(currentDateStr).getTime();
  const diffDays = Math.floor((current - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
