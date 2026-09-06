import {
  maxRedeemablePoints,
  pointsEarned,
  redeemDiscount,
} from './points.util';

describe('points by order value', () => {
  it('gives 500–1000 points around ₹10,000', () => {
    expect(pointsEarned(5_000)).toBe(500);
    expect(pointsEarned(10_000)).toBe(750);
    expect(pointsEarned(14_999)).toBe(1000);
  });

  it('gives 3000–5000 points from ₹1,00,000 and caps above ₹2,00,000', () => {
    expect(pointsEarned(100_000)).toBe(3000);
    expect(pointsEarned(150_000)).toBe(4000);
    expect(pointsEarned(200_000)).toBe(5000);
    expect(pointsEarned(500_000)).toBe(5000);
  });

  it('caps redeem to the same range as the order', () => {
    expect(maxRedeemablePoints(80_000, 10_000)).toBe(750);
    expect(maxRedeemablePoints(80_000, 120_000)).toBe(3400);
    expect(maxRedeemablePoints(200, 10_000)).toBe(200);
  });

  it('keeps 1 point = ₹0.20', () => {
    expect(redeemDiscount(1000)).toBe(200);
  });
});
