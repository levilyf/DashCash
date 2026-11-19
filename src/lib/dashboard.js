export function getDashboardMetrics(transactions) {
  const incomeMinor = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amountMinor, 0);
  const expenseMinor = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amountMinor, 0);
  return { incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor };
}
