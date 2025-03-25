import React, { useContext } from 'react';
import UserProfile from '../sidebar/UserProfile';
import { AppContext } from '../../contexts/AppContext';

const RightSidebar = () => {
  const { toggleSupportModal } = useContext(AppContext);

  return (
    <div className="w-64 bg-[#1E293B] border-l border-gray-700 relative">
      <div className="p-4">
        <UserProfile />
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Статистика использования</div>
            <div>
              <div className="text-2xl font-semibold">1,234</div>
              <div className="text-sm text-gray-400">Всего запросов</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Активные источники</div>
            <div className="text-2xl font-semibold">5</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Активность</div>
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <button
          onClick={toggleSupportModal}
          className="bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4 flex items-center gap-2"
        >
          <i className="ri-customer-service-line"></i>
          <span>Поддержка</span>
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;