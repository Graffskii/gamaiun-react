import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AuthPage from './components/auth/AuthPage';
import { useAuth } from './contexts/AuthContext';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserList from './components/admin/UserList'; // Создадим его ниже
import CompanyList from './components/admin/CompanyList'; // Путь к CompanyList

// Компонент для защищенных маршрутов
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   checkAuthStatus();
  // }, [checkAuthStatus]);

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route 
              path="/auth" 
              element={<AuthPage />} 
            />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              } 
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              {/* Вложенные маршруты для админки */}
              <Route index element={<Navigate to="users" replace />} /> {/* Редирект с /admin на /admin/users */}
              <Route path="users" element={<UserList />} />
              <Route path="companies" element={<CompanyList />} />
              {/*<Route path="drive-sync" element={<DriveSyncPage />} />*/}
              {/* Другие вложенные маршруты админки */}
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;