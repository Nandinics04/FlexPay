export function DiscountBadge({ percent }: { percent: number }) {
  if (percent <= 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
      {percent}% off
    </span>
  );
}
