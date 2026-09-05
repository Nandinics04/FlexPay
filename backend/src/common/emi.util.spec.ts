import { calculateMonthlyAmount } from './emi.util';

describe('calculateMonthlyAmount', () => {
  it('splits a 0% plan evenly', () => {
    expect(calculateMonthlyAmount(120000, 0, 3)).toBe(40000);
  });

  it('adds simple interest for a 12-month 10.5% plan', () => {
    expect(calculateMonthlyAmount(134900, 10.5, 12)).toBe(12422);
  });
});
