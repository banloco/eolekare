import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Pages vitrine
import RegionSelector from './pages/RegionSelector';
import BeninPage from './pages/BeninPage';
import EuropePage from './pages/EuropePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import WaitlistPage from './pages/WaitlistPage';

// Pages admin
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import UsersPage from './pages/admin/UsersPage';
import ExpensesPage from './pages/admin/ExpensesPage';

// Mode liste d'attente pré-lancement : masque tout le site (sauf /admin) derrière WaitlistPage.
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Vitrine (masquée derrière la liste d'attente si VITE_MAINTENANCE_MODE=true) ── */}
          <Route path="/"        element={MAINTENANCE_MODE ? <WaitlistPage /> : <RegionSelector />} />
          <Route path="/benin"   element={MAINTENANCE_MODE ? <WaitlistPage /> : <BeninPage />} />
          <Route path="/europe"  element={MAINTENANCE_MODE ? <WaitlistPage /> : <EuropePage />} />
          <Route path="/about"   element={MAINTENANCE_MODE ? <WaitlistPage /> : <AboutPage />} />
          <Route path="/contact" element={MAINTENANCE_MODE ? <WaitlistPage /> : <ContactPage />} />
          <Route path="/legal"   element={MAINTENANCE_MODE ? <WaitlistPage /> : <LegalPage />} />

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
          <Route path="/admin/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="/admin/orders/:id" element={
            <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/expenses" element={
            <ProtectedRoute><ExpensesPage /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute><UsersPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
