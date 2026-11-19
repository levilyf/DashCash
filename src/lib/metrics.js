const ZERO_TOTALS = () => ({ incomeMinor: 0, expenseMinor: 0, netMinor: 0 });

export function parseAmountToMinorUnits(value, fractionDigits = 2) {
  const text = String(value).trim();
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0 || fractionDigits > 6) {
    throw new RangeError('Currency fraction digits must be between 0 and 6.');
  }
  const pattern = fractionDigits === 0
    ? /^(?:0|[1-9]\d*)$/
    : new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d{1,${fractionDigits}})?$`);
  if (!pattern.test(text)) throw new TypeError('Enter a positive amount with valid precision.');
  const [whole, fraction = ''] = text.split('.');
  const factor = 10 ** fractionDigits;
  const minor = Number(whole) * factor + Number((fraction + '0'.repeat(fractionDigits)).slice(0, fractionDigits) || 0);
  if (!Number.isSafeInteger(minor) || minor <= 0) throw new RangeError('Amount must be a positive safe integer in minor units.');
  return minor;
}

export function calculatePeriodTotals(transactions, startDate, endDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || startDate > endDate) {
    throw new TypeError('Provide a valid inclusive date range.');
  }
  const totals = ZERO_TOTALS();
  for (const transaction of transactions) {
    if (transaction.date < startDate || transaction.date > endDate) continue;
    if (!Number.isSafeInteger(transaction.amountMinor) || transaction.amountMinor <= 0) {
      throw new TypeError('Transaction amounts must be positive integer minor units.');
    }
    if (transaction.type === 'income') totals.incomeMinor += transaction.amountMinor;
    else if (transaction.type === 'expense') totals.expenseMinor += transaction.amountMinor;
    else throw new TypeError('Transaction type must be income or expense.');
  }
  totals.netMinor = totals.incomeMinor - totals.expenseMinor;
  return totals;
}
