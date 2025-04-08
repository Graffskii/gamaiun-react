import React, { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Имитация регистрации (позже можно будет заменить на реальный API)
  const register = useCallback((userData) => {
    // Здесь будет логика регистрации
    // Для примера просто сохраняем пользователя в локальное состояние
    setUser(userData);
    setIsAuthenticated(true);
    
    // Сохраняем в localStorage для persist-авторизации
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Имитация входа
  const login = useCallback((credentials) => {
    // Здесь будет логика входа
    // Для примера просто создаем пользователя
    const userData = {
      email: credentials.email,
      name: credentials.email.split('@')[0]
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    
    // Сохраняем в localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Выход
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  }, []);

  // Проверка авторизации при загрузке приложения
  const checkAuthStatus = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      register,
      login,
      logout,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);