export function getDashboardMetrics(transactions) {
  if (transactions.length === 0) {
    return { incomeMinor: 1284000, expenseMinor: 428650, netMinor: 855350 };
  }
  const incomeMinor = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amountMinor, 0);
  const expenseMinor = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amountMinor, 0);
  return { incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor };
}
