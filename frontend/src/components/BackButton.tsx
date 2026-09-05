import { useNavigate } from 'react-router-dom';

export function BackButton({ to }: { to: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"
      aria-label="Go back"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ←
      </span>
      Back
    </button>
  );
}
