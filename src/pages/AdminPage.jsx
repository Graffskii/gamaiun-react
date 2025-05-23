// src/pages/AdminPage.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; // Outlet для вложенных маршрутов
import { useAuth } from '../contexts/AuthContext'; // Путь может отличаться

const AdminPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Теоретически, ProtectedRoute уже должен это сделать, но дополнительная проверка не помешает
  if (user?.role !== 'ADMIN') {
    // Можно показать сообщение или редиректнуть, но лучше это делать на уровне роутера
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Доступ запрещен</h1>
        <p className="text-gray-400">Эта страница доступна только администраторам.</p>
      </div>
    );
  }

  const getLinkClass = (path) => {
      return location.pathname === path
        ? "bg-primary text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-xl font-semibold">Панель Администратора</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Боковое меню админки */}
        <nav className="w-64 bg-gray-800 p-4 space-y-2 border-r border-gray-700 flex-shrink-0">
          <Link
            to="/admin/users"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${getLinkClass('/admin/users')}`}
          >
            <i className="ri-group-line mr-2"></i>Пользователи
          </Link>
          <Link
            to="/admin/companies"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${getLinkClass('/admin/companies')}`}
          >
            <i className="ri-building-line mr-2"></i>Компании
          </Link>
          {/*<Link
            to="/admin/drive-sync"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${getLinkClass('/admin/drive-sync')}`}
          >
            <i className="ri-refresh-line mr-2"></i>Синхронизация Диска
          </Link>*/}
          {/* Другие ссылки админки */}
        </nav>
        {/* Основной контент админки */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* Здесь будут рендериться вложенные компоненты (UserList, CompanyList и т.д.) */}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;