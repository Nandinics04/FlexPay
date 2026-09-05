export function calculateMonthlyAmount(
  sellingPrice: number,
  interestRate: number,
  tenureMonths: number,
): number {
  const totalPayable =
    sellingPrice * (1 + (interestRate / 100) * (tenureMonths / 12));
  return Math.round(totalPayable / tenureMonths);
}
