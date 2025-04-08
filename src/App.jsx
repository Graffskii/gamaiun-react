import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AuthPage from './components/auth/AuthPage';
import { useAuth } from './contexts/AuthContext';

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
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;