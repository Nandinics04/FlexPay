import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const onLogout = () => {
    logout();
    navigate(isAdmin ? '/login' : '/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
            1F
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            1Fi
          </span>
        </Link>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {loading ? null : user ? (
            isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="rounded-full px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Products
                </Link>
                <Link
                  to="/admin/users"
                  className="rounded-full px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Users
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <span className="hidden rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 sm:inline">
                  ₹{user.cashbackBalance ?? 0} CB
                </span>
                <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 sm:inline">
                  {user.creditPoints ?? 0} pts
                </span>
                <Link
                  to="/orders"
                  className="rounded-full px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="hidden rounded-full px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 sm:inline"
                >
                  Wishlist
                </Link>
                <Link
                  to="/profile"
                  aria-label="Profile"
                  className="rounded-full px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            )
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-teal-600 px-3 py-1.5 font-medium text-white hover:bg-teal-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
