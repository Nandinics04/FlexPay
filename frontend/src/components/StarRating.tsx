const STAR_PATH =
  'M12 2.5l2.6 6.2 6.7.6-5.1 4.4 1.5 6.5L12 16.8 6.3 20.2l1.5-6.5-5.1-4.4 6.7-.6L12 2.5z';

function StarIcon({
  className,
  fill,
}: {
  className: string;
  fill: 'empty' | 'half' | 'full';
}) {
  return (
    <span className={`relative block ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="block h-full w-full text-slate-300"
        fill="currentColor"
      >
        <path d={STAR_PATH} />
      </svg>
      {fill !== 'empty' ? (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden text-amber-400"
          style={{ width: fill === 'half' ? '50%' : '100%' }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`block ${className}`}
            fill="currentColor"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

function fillFor(value: number, star: number): 'empty' | 'half' | 'full' {
  if (value >= star) {
    return 'full';
  }
  if (value >= star - 0.5) {
    return 'half';
  }
  return 'empty';
}

export function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}) {
  const starClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={onChange ? 'radiogroup' : 'img'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <StarIcon className={starClass} fill={fillFor(value, star)} />
        );

        if (!onChange) {
          return <span key={star}>{icon}</span>;
        }

        return (
          <span key={star} className="relative inline-flex">
            {icon}
            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/2"
              aria-label={`${star - 0.5} stars`}
              onClick={() => onChange(star - 0.5)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/2"
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              onClick={() => onChange(star)}
            />
          </span>
        );
      })}
    </div>
  );
}
