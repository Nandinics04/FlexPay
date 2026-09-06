export const POINT_VALUE_INR = 0.2;

type PointSlab = {
  minAmount: number;
  maxAmount: number;
  minPoints: number;
  maxPoints: number;
};

/** Order-value slabs: ~₹10k earns 500–1000, ₹1L+ earns 3000–5000 (hard cap). */
const POINT_SLABS: PointSlab[] = [
  { minAmount: 0, maxAmount: 4_999, minPoints: 0, maxPoints: 400 },
  { minAmount: 5_000, maxAmount: 14_999, minPoints: 500, maxPoints: 1_000 },
  { minAmount: 15_000, maxAmount: 49_999, minPoints: 1_000, maxPoints: 2_000 },
  { minAmount: 50_000, maxAmount: 99_999, minPoints: 2_000, maxPoints: 3_000 },
  { minAmount: 100_000, maxAmount: 200_000, minPoints: 3_000, maxPoints: 5_000 },
];

export function pointsForAmount(amount: number) {
  const value = Math.max(0, amount);
  if (value <= 0) {
    return 0;
  }
  if (value >= 200_000) {
    return 5_000;
  }

  const slab =
    POINT_SLABS.find(
      (item) => value >= item.minAmount && value <= item.maxAmount,
    ) ?? POINT_SLABS[0];
  const span = slab.maxAmount - slab.minAmount;
  const progress = span <= 0 ? 1 : (value - slab.minAmount) / span;
  return Math.round(slab.minPoints + progress * (slab.maxPoints - slab.minPoints));
}

export function pointsEarned(amount: number) {
  return pointsForAmount(amount);
}

export function redeemDiscount(points: number) {
  return Math.round(points * POINT_VALUE_INR);
}

export function maxRedeemablePoints(balance: number, sellingPrice: number) {
  const rangeCap = pointsForAmount(sellingPrice);
  const maxByPrice = Math.floor(sellingPrice / POINT_VALUE_INR);
  return Math.max(0, Math.min(balance, rangeCap, maxByPrice));
}
