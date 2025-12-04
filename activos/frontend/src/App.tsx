import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import MainLayout from '@components/MainLayout';
import AssetsView from '@views/AssetsView';
import MovementView from '@views/MovementView';
import MaintenanceView from '@views/MaintenanceView';
import ReportsView from '@views/ReportsView';
import IntegrationsView from '@views/IntegrationsView';
import UsersView from '@views/UsersView';
import RolesView from '@views/RolesView';
import DashboardView from '@views/DashboardView';
// import LicensesView from '@views/LicensesView';
import VendorsView from '@views/VendorsView';
import NotificationsView from '@views/NotificationsView';
import ReportBuilderView from '@views/ReportBuilderView';
import ConfigurationView from '@views/ConfigurationView';
import LoginView from '@views/LoginView';

function App() {
  const { token } = useAuth();

  // Sin token, mostrar login
  if (!token) {
    return <LoginView />;
  }

  // Con token, mostrar aplicación
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/assets" replace />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/assets" element={<AssetsView />} />
        <Route path="/movements" element={<MovementView />} />
        <Route path="/maintenance" element={<MaintenanceView />} />
        <Route path="/reports" element={<ReportsView />} />
        <Route path="/integrations" element={<IntegrationsView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/roles" element={<RolesView />} />
        {/* <Route path="/licenses" element={<LicensesView />} /> */}
        <Route path="/vendors" element={<VendorsView />} />
        <Route path="/notifications" element={<NotificationsView />} />
        <Route path="/report-builder" element={<ReportBuilderView />} />
        <Route path="/configuration" element={<ConfigurationView />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
