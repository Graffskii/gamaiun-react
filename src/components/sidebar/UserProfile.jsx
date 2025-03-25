import React from 'react';

const UserProfile = () => {
  const user = {
    name: 'Александр Петров',
    role: 'Аналитик',
    avatar: null // У нас нет аватара, будем использовать иконку
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        <i className="ri-user-line text-xl"></i>
      </div>
      <div>
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-gray-400">{user.role}</div>
      </div>
    </div>
  );
};

export default UserProfile;