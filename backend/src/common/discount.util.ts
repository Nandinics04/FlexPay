export function discountPercent(mrp: number, sellingPrice: number) {
  if (!mrp || mrp <= sellingPrice) {
    return 0;
  }
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}
