import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
            1F
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            1Fi
          </span>
        </Link>
        <p className="text-sm text-slate-500">Shop smartphones on EMI</p>
      </div>
    </header>
  );
}
