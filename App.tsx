import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LpPage from './pages/LpPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminLeadsPage from './pages/admin/AdminLeadsPage';
import AdminSitesPage from './pages/admin/AdminSitesPage';
import AdminAdsPage from './pages/admin/AdminAdsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminConfigPage from './pages/admin/AdminConfigPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInsightsPage from './pages/admin/AdminInsightsPage';
import AdminPlanosPage from './pages/admin/AdminPlanosPage';
import AdminAssinaturasPage from './pages/admin/AdminAssinaturasPage';
import AdminFaturamentoPage from './pages/admin/AdminFaturamentoPage';
import AdminClientesPage from './pages/admin/AdminClientesPage';
import AdminUsuariosPage from './pages/admin/AdminUsuariosPage';
import AdminPermissoesPage from './pages/admin/AdminPermissoesPage';
import AdminIntegracoesPage from './pages/admin/AdminIntegracoesPage';
import AdminAuditoriaPage from './pages/admin/AdminAuditoriaPage';
import AdminAjudaPage from './pages/admin/AdminAjudaPage';
import AdminContratosPage from './pages/admin/AdminContratosPage';
import AdminMarketingPage from './pages/admin/AdminMarketingPage';
import AdminCriativosPage from './pages/admin/AdminCriativosPage';
import AdminInventarioPage from './pages/admin/AdminInventarioPage';
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
          <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="sites" element={<AdminSitesPage />} />
          <Route path="anuncios" element={<AdminAdsPage />} />
          <Route path="relatorios" element={<AdminReportsPage />} />
          <Route path="configuracoes" element={<AdminConfigPage />} />

          {/* New Placeholder Routes */}
          <Route path="insights" element={<AdminInsightsPage />} />
          <Route path="planos" element={<AdminPlanosPage />} />
          <Route path="assinaturas" element={<AdminAssinaturasPage />} />
          <Route path="faturamento" element={<AdminFaturamentoPage />} />
          <Route path="clientes" element={<AdminClientesPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
          <Route path="permissoes" element={<AdminPermissoesPage />} />
          <Route path="integracoes" element={<AdminIntegracoesPage />} />
          <Route path="auditoria" element={<AdminAuditoriaPage />} />
          <Route path="ajuda" element={<AdminAjudaPage />} />
          <Route path="contratos" element={<AdminContratosPage />} />
          <Route path="marketing" element={<AdminMarketingPage />} />
          <Route path="criativos" element={<AdminCriativosPage />} />
          <Route path="inventario" element={<AdminInventarioPage />} />

          {/* Legacy & Fallback Redirects */}
          <Route path="ads" element={<Navigate to={ROUTES.ADMIN_ADS} replace />} />
          <Route path="reports" element={<Navigate to={ROUTES.ADMIN_REPORTS} replace />} />
          <Route path="config" element={<Navigate to={ROUTES.ADMIN_SETTINGS} replace />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LP} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
