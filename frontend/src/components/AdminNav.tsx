import { NavLink, useLocation } from 'react-router-dom';

export function AdminNav() {
  const { pathname } = useLocation();
  const productsActive =
    pathname === '/admin' || pathname.startsWith('/admin/products');
  const usersActive = pathname.startsWith('/admin/users');

  return (
    <nav className="mb-6 flex gap-2">
      <NavLink
        to="/admin"
        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
          productsActive
            ? 'bg-teal-600 text-white'
            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Products
      </NavLink>
      <NavLink
        to="/admin/users"
        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
          usersActive
            ? 'bg-teal-600 text-white'
            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        Users
      </NavLink>
    </nav>
  );
}
