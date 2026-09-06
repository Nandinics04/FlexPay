const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inr.format(amount);
}

export function discountPercent(mrp: number, sellingPrice: number) {
  if (!mrp || mrp <= sellingPrice) {
    return 0;
  }
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}
