import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LpPage from './pages/LpPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';
import AdminAdsPage from './pages/admin/AdminAdsPage';
import AdminSitesPage from './pages/admin/AdminSitesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
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
          <Route path="anuncios" element={<AdminAdsPage />} />
          <Route path="sites" element={<AdminSitesPage />} />
          <Route path="configuracoes" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LP} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
