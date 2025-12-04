import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginView from './views/LoginView';
import SystemsView from './views/SystemsView';
import AdminUsersView from './views/AdminUsersView';
import AdminRolesView from './views/AdminRolesView';
import AdminPermissionsView from './views/AdminPermissionsView';
import InventoryView from './views/InventoryView';
import QuickStockUpdateView from './views/QuickStockUpdateView';
import ReorderAlertsView from './views/ReorderAlertsView';
import PurchaseOrdersView from './views/PurchaseOrdersView';
import PurchaseOrderFormView from './views/PurchaseOrderFormView';
import ConfigurationView from './views/ConfigurationView';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route
              path="/systems"
              element={
                <PrivateRoute>
                  <SystemsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AdminUsersView />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <PrivateRoute>
                  <AdminRolesView />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <PrivateRoute>
                  <AdminPermissionsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <InventoryView />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/quick-update"
              element={
                <PrivateRoute>
                  <QuickStockUpdateView />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/reorder-alerts"
              element={
                <PrivateRoute>
                  <ReorderAlertsView />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/purchase-orders"
              element={
                <PrivateRoute>
                  <PurchaseOrdersView />
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/purchase-orders/new"
              element={
                <PrivateRoute>
                  <PurchaseOrderFormView />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/configuration"
              element={
                <PrivateRoute>
                  <ConfigurationView />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/systems" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
