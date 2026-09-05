import { ProductImage } from './ProductImage';

export function ColorProductShot({
  imageUrl,
  color,
  alt,
  compact = false,
}: {
  imageUrl: string;
  color: string;
  alt: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-slate-200 bg-white ${
        compact
          ? 'h-24 w-24 rounded-xl p-1'
          : 'min-h-[280px] rounded-3xl p-6 sm:min-h-[360px]'
      }`}
    >
      <ProductImage
        key={imageUrl}
        src={imageUrl}
        alt={alt}
        className={
          compact
            ? 'h-20 w-full object-contain'
            : 'max-h-[380px] w-full object-contain'
        }
      />
      {compact ? null : (
        <span className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
          {color}
        </span>
      )}
    </div>
  );
}
