import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Получаем базовый URL API из переменных окружения
const API_BASE_URL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Состояние для токена, инициализируем из localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // Состояние для данных пользователя, инициализируем из localStorage *только* если есть токен
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    // Загружаем пользователя, только если есть и токен, и данные пользователя
    return storedToken && storedUser ? JSON.parse(storedUser) : null;
  });
  // Статус аутентификации зависит от наличия токена в состоянии
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  // Состояние для ошибок аутентификации
  const [authError, setAuthError] = useState(null);
  // Состояние загрузки (полезно для UI)
  const [isLoading, setIsLoading] = useState(false);

  // --- Вспомогательная функция для обработки ответа API ---
  const handleApiResponse = async (response) => {
    const data = await response.json(); // Пытаемся парсить JSON в любом случае

    if (!response.ok) {
      // Если статус не 2xx, выбрасываем ошибку с сообщением от бэкенда
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data; // Возвращаем успешные данные { token, user }
  };

  // --- Регистрация ---
  const register = useCallback(async (userData) => {
    // userData ожидается как { name, email, password, company }
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await handleApiResponse(response); // Используем хелпер

      // Успешная регистрация (и логин)
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Сохраняем и пользователя

    } catch (error) {
      console.error("Registration failed:", error);
      setAuthError(error.message || 'Failed to register');
      // Очищаем состояние в случае ошибки регистрации, чтобы не было путаницы
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Важно: Перебрасываем ошибку, чтобы компонент AuthPage мог ее поймать
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Вход ---
  const login = useCallback(async (credentials) => {
    // credentials ожидается как { email, password }
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await handleApiResponse(response); // Используем хелпер

      // Успешный вход
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Сохраняем пользователя

    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(error.message || 'Failed to login');
       // Очищаем состояние в случае ошибки логина
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
       // Перебрасываем ошибку
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Выход ---
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null); // Сбрасываем ошибки при выходе
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Здесь можно добавить вызов API /api/auth/logout, если он нужен бэкенду
    // (например, для добавления токена в черный список)
  }, []);

  // Проверка статуса больше не нужна как отдельная функция,
  // т.к. начальное состояние инициализируется из localStorage.
  // const checkAuthStatus = useCallback(() => { ... }, []);

  // Следим за изменениями токена в localStorage (например, если вход/выход произошел в другой вкладке)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        const newToken = event.newValue;
        setToken(newToken);
        setIsAuthenticated(!!newToken);
        if (!newToken) {
          // Если токен удален из другой вкладки, разлогиниваем и здесь
          setUser(null);
          localStorage.removeItem('user');
          setAuthError(null);
        } else {
          // Если токен появился, пытаемся загрузить пользователя (если он есть)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
             setUser(JSON.parse(storedUser));
          } else {
              // TODO: Опционально - сделать запрос к /api/users/me для получения актуальных данных
              // пока оставляем пользователя null, если его нет в localStorage
              setUser(null);
          }
        }
      }
      if (event.key === 'user' && token) { // Обновляем юзера, если он изменился, а токен есть
         setUser(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]); // Перезапускаем эффект, если токен меняется программно в этой вкладке


  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token, // Токен может быть полезен для добавления в заголовки API запросов в других частях приложения
      isLoading,
      authError,
      register,
      login,
      logout,
      // checkAuthStatus больше не экспортируем
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);