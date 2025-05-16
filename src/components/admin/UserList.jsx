// src/components/admin/UserList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Для apiFetch (если вынесен) или напрямую fetch
import { useAuth } from '../../contexts/AuthContext'; // Для токена
import UserEditModal from './UserEditModal'; // Импортируем модальное окно

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // Получаем токен

    // --- Состояния для модального окна ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Пользователь, которого редактируем
    // ------------------------------------

  // Для вызова apiFetch можно использовать его из AppContext, если он там есть и экспортирован,
  // либо определить его локально/импортировать из утилит.
  // Предположим, что apiFetch определен глобально или в утилитах,
  // либо его нужно будет передать/импортировать из AppContext.
  // Для простоты примера используем fetch напрямую здесь.

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', { // Используем относительный путь
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(response)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // TODO: Добавить функции для открытия модалки редактирования/обработки PUT запроса
  // --- Открытие модального окна для редактирования ---
  const handleEditUserClick = (user) => {
    setEditingUser(user); // Устанавливаем пользователя для редактирования
    setIsModalOpen(true);   // Открываем модалку
    setError(null); // Сбрасываем общие ошибки списка при открытии модалки
  };

  // --- Закрытие модального окна ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null); // Сбрасываем редактируемого пользователя
  };

  // --- Обработка обновления пользователя (вызывается из модалки) ---
  const handleUserUpdate = useCallback(async (userId, updateData) => {
    if (!token) throw new Error("Not authenticated");
    setError(null); // Сбрасываем предыдущую ошибку

    console.log(`Updating user ${userId} with data:`, updateData);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json(); // Пытаемся получить тело в любом случае

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to update user: ${response.statusText}`);
      }

      // Обновляем список пользователей:
      // Вариант 1: Перезапросить всех пользователей (проще, но может быть медленнее)
      // await fetchUsers();

      // Вариант 2: Обновить пользователя в локальном состоянии (быстрее)
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, ...responseData.user } : u))
        // Предполагаем, что бэкенд возвращает обновленного пользователя в responseData.user
      );

      console.log('User updated successfully:', responseData.user);
      // Закрытие модалки произойдет в UserEditModal при успехе onUserUpdate

    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message); // Устанавливаем ошибку, чтобы ее можно было показать
      throw err; // Перебрасываем ошибку, чтобы модальное окно могло ее обработать
    }
  }, [token, fetchUsers]); // fetchUsers если используется для обновления

  if (isLoading) {
    return <div className="text-center p-4">Загрузка пользователей...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Ошибка: {error}</div>;
  }

  if (users.length === 0) {
    return <div className="text-center p-4 text-gray-400">Пользователи не найдены.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Управление пользователями</h2>
      {/* Отображение общей ошибки списка, если есть */}
      {error && !isModalOpen && <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">{error}</div>}
      <div className="bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Имя</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Роль</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Компания</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Заявка (Компания)</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                {/* ... (td для ID, Имя, Email, Роль, Компания, Заявка как раньше) ... */}
                 <td className="px-5 py-4 text-sm">{user.id}</td>
                    <td className="px-5 py-4 text-sm">{user.name}</td>
                    <td className="px-5 py-4 text-sm">{user.email}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-600 text-red-100' :
                        user.role === 'VERIFIED_USER' ? 'bg-green-600 text-green-100' :
                        'bg-yellow-600 text-yellow-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">{user.companyDetails?.name || <span className="text-gray-500">N/A</span>}</td>
                    <td className="px-5 py-4 text-sm">{user.company_name_request || <span className="text-gray-500">-</span>}</td>

                <td className="px-5 py-4 text-sm">
                  {/* --- Кнопка Редактировать --- */}
                  <button
                    onClick={() => handleEditUserClick(user)} // Вызываем обработчик
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                    title="Редактировать пользователя"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  {/* ... (кнопка удаления, если нужна) ... */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Модальное окно редактирования --- */}
      {editingUser && ( // Показываем модалку, только если есть editingUser
        <UserEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userToEdit={editingUser}
          onUserUpdate={handleUserUpdate} // Передаем колбэк для обновления
        />
      )}
    </div>
  );
};

export default UserList;