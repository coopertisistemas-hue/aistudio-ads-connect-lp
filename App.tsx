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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/lp" element={<LpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
