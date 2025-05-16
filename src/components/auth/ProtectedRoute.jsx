// src/components/auth/ProtectedRoute.jsx (или похожее)
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Путь может отличаться

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth(); // Добавим isLoading из AuthContext

  if (isLoading) {
      // Показываем заглушку, пока идет проверка аутентификации/загрузка пользователя
      return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    // Если не аутентифицирован, перенаправляем на страницу входа
    // Передаем текущий путь, чтобы после логина можно было вернуться
    return <Navigate to="/auth" state={{ from: window.location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Если роль не разрешена, показываем страницу "доступ запрещен" или редирект
    // Можно создать специальную страницу для 403 Forbidden
    console.warn(`User with role ${user?.role} tried to access restricted route. Allowed: ${allowedRoles}`);
    return (
        <div className="p-8 text-center bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Доступ Запрещен</h1>
            <p className="text-gray-400 text-lg">У вас нет прав для просмотра этой страницы.</p>
            <Link to="/" className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600">
                На главную
            </Link>
        </div>
    );
    // Или: return <Navigate to="/unauthorized" replace />;
  }

  // Если все проверки пройдены, рендерим дочерний компонент (или Outlet)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;