export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
