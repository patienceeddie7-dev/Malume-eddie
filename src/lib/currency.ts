import { CompanySettings } from '../types';

export function formatCurrency(
  amount: number | undefined | null,
  symbolOrSettings: string | CompanySettings = 'MWK'
): string {
  const val = amount ?? 0;
  let symbol = 'MWK';

  if (typeof symbolOrSettings === 'string') {
    symbol = symbolOrSettings;
  } else if (symbolOrSettings && symbolOrSettings.currencySymbol) {
    symbol = symbolOrSettings.currencySymbol;
  }

  // Format with commas, 2 decimals if not whole number, or standard formatting
  const formattedNumber = val.toLocaleString(undefined, {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formattedNumber}`;
}
