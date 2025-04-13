import React from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Импортируем useAuth

const UserProfile = () => {
  // Получаем пользователя из AuthContext
  const { user } = useAuth();

  // Если пользователь еще не загружен (или не аутентифицирован), можно показать заглушку или ничего
  if (!user) {
    return (
      <div className="flex items-center gap-3 mb-6 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
        <div>
          <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
    // Или return null;
  }

  // Используем реальные данные пользователя
  const userName = user.name || 'Пользователь'; // Используем имя или заглушку
  const userDetail = user.company || user.email || 'Компания не указана'; // Показываем компанию или email

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Иконка пользователя */}
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        {/* Можно добавить первую букву имени */}
        {/* <span className="text-xl font-semibold">{userName.charAt(0).toUpperCase()}</span> */}
         <i className="ri-user-line text-xl"></i>
      </div>
      {/* Имя и детали */}
      <div className="overflow-hidden"> {/* Добавляем overflow для обрезки длинных строк */}
        <div className="font-medium text-white truncate" title={userName}>{userName}</div>
        <div className="text-sm text-gray-400 truncate" title={userDetail}>{userDetail}</div>
      </div>
    </div>
  );
};

export default UserProfile;