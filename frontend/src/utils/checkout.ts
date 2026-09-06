import type { ProductDetail } from '../types';
import { calculateMonthlyAmount } from './emi';

export const MAX_QTY = 10;

export function parseQty(value: string | null) {
  const quantity = Number.parseInt(value ?? '1', 10);
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }
  return Math.min(MAX_QTY, quantity);
}

export function checkoutSummary(
  product: ProductDetail,
  color: string | null,
  storage: string | null,
  planId: string | null,
  qty: string | null = '1',
) {
  const variant =
    product.variants.find(
      (item) => item.color === color && item.storage === storage,
    ) ?? product.variants[0];
  const planRule = product.emiPlans.find((item) => item.id === planId);
  if (!variant || !planRule) {
    return null;
  }
  const quantity = parseQty(qty);
  const lineTotal = variant.sellingPrice * quantity;
  return {
    variant,
    quantity,
    lineTotal,
    plan: {
      ...planRule,
      cashbackAmount: (planRule.cashbackAmount ?? 0) * quantity,
      monthlyAmount: calculateMonthlyAmount(
        lineTotal,
        planRule.interestRate,
        planRule.tenureMonths,
      ),
    },
  };
}

export function checkoutQuery(
  color: string,
  storage: string,
  plan: string,
  quantity = 1,
) {
  return `color=${encodeURIComponent(color)}&storage=${encodeURIComponent(storage)}&plan=${encodeURIComponent(plan)}&qty=${quantity}`;
}
