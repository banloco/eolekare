import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import CallbackPage from './pages/auth/CallbackPage';

// Pages vitrine
import RegionSelector from './pages/RegionSelector';
import BeninPage from './pages/BeninPage';
import EuropePage from './pages/EuropePage';

// Pages admin
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CustomerAuthProvider>
          <Routes>
            {/* ── Vitrine ── */}
            <Route path="/" element={<RegionSelector />} />
            <Route path="/benin" element={<BeninPage />} />
            <Route path="/europe" element={<EuropePage />} />

            {/* ── Admin ── */}
            <Route path="/admin" element={<LoginPage />} />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute><ProductsPage /></ProtectedRoute>
            } />
            <Route path="/admin/products/new" element={
              <ProtectedRoute><ProductFormPage /></ProtectedRoute>
            } />
            <Route path="/admin/products/:id" element={
              <ProtectedRoute><ProductFormPage /></ProtectedRoute>
            } />

            {/* ── Auth Callback ── */}
            <Route path="/auth/callback" element={<CallbackPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}