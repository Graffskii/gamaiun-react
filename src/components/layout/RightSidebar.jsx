import React from 'react';
import UserProfile from '../sidebar/UserProfile'; // Убедись, что путь верный
import { useAppContext } from '../../contexts/AppContext'; // Для toggleSupportModal
import { useAuth } from '../../contexts/AuthContext'; // Для logout

const RightSidebar = () => {
  const { toggleSupportModal } = useAppContext();
  const { logout } = useAuth(); // Получаем функцию logout

  const handleLogout = () => {
    // Можно добавить подтверждение перед выходом, если нужно
    // if (window.confirm('Вы уверены, что хотите выйти?')) {
    //   logout();
    // }
    logout(); // Вызываем logout из AuthContext
  };

  return (
    // Используем flex flex-col для удобного размещения кнопки выхода внизу
    <div className="w-64 bg-[#1E293B] border-l border-gray-700 flex flex-col h-full">
      {/* Основной контент сайдбара */}
      <div className="p-4 flex-grow overflow-y-auto"> {/* flex-grow + overflow для прокрутки, если контента много */}
        <UserProfile />
        {/* Блок со статистикой и прочим (оставляем как есть) */}
        <div className="space-y-6"> {/* Немного увеличил отступ */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Статистика</div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-semibold text-white">1,234</div>
              <div className="text-sm text-gray-400">Всего запросов</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Активные источники</div>
             <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-xl font-semibold text-white">5</div>
                {/* <div className="text-sm text-gray-400">Источники</div> */}
            </div>
          </div>
          {/* Блок Активность можно оставить или убрать */}
          {/* <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Активность</div>
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div> */}
        </div>
      </div>

      {/* Нижняя часть с кнопками */}
      <div className="p-4 border-t border-gray-700 mt-auto"> {/* mt-auto прижмет этот блок к низу */}
        {/* Кнопка Поддержка */}
        <button
          onClick={toggleSupportModal}
          className="w-full bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 mb-3" // Добавил mb-3
        >
          <i className="ri-customer-service-line"></i>
          <span>Поддержка</span>
        </button>

        {/* Кнопка Выйти */}
        <button
          onClick={handleLogout}
          className="w-full bg-gray-600 hover:bg-red-700 text-white rounded-button py-2 px-4 flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <i className="ri-logout-box-r-line"></i>
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;