import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LpPage from './pages/LpPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { ROUTES } from './config/constants';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LP} replace />} />
        <Route path={ROUTES.LP} element={<LpPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.TERMS} element={<TermsPage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="sites" element={<AdminPlaceholderPage />} />
          <Route path="anuncios" element={<AdminPlaceholderPage />} />
          <Route path="relatorios" element={<AdminPlaceholderPage />} />
          <Route path="configuracoes" element={<AdminPlaceholderPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LP} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
