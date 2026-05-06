import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import NewServicePage from './pages/NewServicePage';
import EditServicePage from './pages/EditServicePage';
import CertificatesPage from './pages/CertificatesPage';
import NewCertificatePage from './pages/NewCertificatePage';
import CertificateDetailsPage from './pages/CertificateDetailsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/services" element={<ServicesPage />} />
          </Route>
          <Route element={<Layout subtitle="Add a new microservice" />}>
            <Route path="/services/new" element={<ProtectedRoute requireAdmin><NewServicePage /></ProtectedRoute>} />
          </Route>
          <Route element={<Layout subtitle="Update service information" />}>
            <Route path="/services/:id/edit" element={<ProtectedRoute requireAdmin><EditServicePage /></ProtectedRoute>} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/certificates" element={<CertificatesPage />} />
          </Route>
          <Route element={<Layout subtitle="Generate a new SSL certificate" />}>
            <Route path="/certificates/new" element={<ProtectedRoute requireAdmin><NewCertificatePage /></ProtectedRoute>} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/certificates/:id" element={<CertificateDetailsPage />} />
          </Route>

          {/* 404 */}
          <Route element={<Layout />}>
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-500">La page que vous cherchez n'existe pas.</p>
              </div>
            } />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
