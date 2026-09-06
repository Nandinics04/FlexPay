import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './auth/AdminRoute';
import { AuthProvider } from './auth/AuthContext';
import { NotificationProvider } from './auth/NotificationContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ShopperRoute } from './auth/ShopperRoute';
import { WishlistProvider } from './auth/WishlistContext';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { AdminPage } from './pages/AdminPage';
import { AdminProductPage } from './pages/AdminProductPage';
import { AdminUserPage } from './pages/AdminUserPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { CheckoutDetailsPage } from './pages/CheckoutDetailsPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProductPage } from './pages/ProductPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignupPage } from './pages/SignupPage';
import { WishlistPage } from './pages/WishlistPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <div className="min-h-svh overflow-x-hidden bg-slate-50 text-slate-800">
              <Header />
              <main className="mx-auto min-w-0 max-w-6xl px-4 py-8">
                <Toast />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ShopperRoute>
                        <HomePage />
                      </ShopperRoute>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/new"
                    element={
                      <AdminRoute>
                        <AdminProductPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/:slug"
                    element={
                      <AdminRoute>
                        <AdminProductPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsersPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/new"
                    element={
                      <AdminRoute>
                        <AdminUserPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id"
                    element={
                      <AdminRoute>
                        <AdminUserPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/products/:slug"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <ProductPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/products/:slug/confirm"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <ConfirmPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/products/:slug/details"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <CheckoutDetailsPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                  <Route
                    path="/products/:slug/pay"
                    element={
                      <ShopperRoute>
                        <ProtectedRoute>
                          <PaymentPage />
                        </ProtectedRoute>
                      </ShopperRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
