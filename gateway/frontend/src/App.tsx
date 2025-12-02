import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginView from './views/LoginView';
import SystemsView from './views/SystemsView';
import AdminUsersView from './views/AdminUsersView';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
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
          <Route path="/" element={<Navigate to="/systems" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
