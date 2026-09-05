import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ConfirmPage } from './pages/ConfirmPage';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh bg-slate-50 text-slate-800">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route
              path="/products/:slug/confirm"
              element={<ConfirmPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
