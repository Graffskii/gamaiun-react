// src/components/admin/UserEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Для токена

const UserEditModal = ({ isOpen, onClose, userToEdit, onUserUpdate }) => {
  const [formData, setFormData] = useState({ role: '', companyId: '' });
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Загрузка списка компаний при первом открытии модального окна
  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setIsLoadingCompanies(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError('Не удалось загрузить список компаний: ' + err.message);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && companies.length === 0) { // Загружаем, если открыто и еще не загружены
      fetchCompanies();
    }
  }, [isOpen, companies.length, fetchCompanies]);

  // Заполнение формы данными пользователя при его изменении
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        role: userToEdit.role || '',
        companyId: userToEdit.company_id === null || userToEdit.company_id === undefined ? '' : String(userToEdit.company_id), // Приводим к строке для select, '' если null
      });
      setError(null); // Сбрасываем ошибки при открытии для нового пользователя
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    setIsSubmitting(true);
    setError(null);

    const payload = {
      role: formData.role,
      // Отправляем companyId как число или null
      companyId: formData.companyId ? parseInt(formData.companyId, 10) : null,
    };

    try {
      await onUserUpdate(userToEdit.id, payload); // Вызываем колбэк, переданный из UserList
      onClose(); // Закрываем модалку при успехе
    } catch (err) {
      console.error("Error updating user from modal:", err);
      setError(err.message || 'Не удалось обновить пользователя.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-gray-700">
        <button onClick={onClose} disabled={isSubmitting} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">×</button>
        <h2 className="text-xl font-semibold text-white mb-4">Редактировать пользователя: {userToEdit?.name}</h2>

        {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Роль</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="USER">USER (Ожидает проверки)</option>
              <option value="VERIFIED_USER">VERIFIED_USER (Проверенный)</option>
              <option value="ADMIN">ADMIN (Администратор)</option>
            </select>
          </div>

          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-300 mb-1">Компания</label>
            {isLoadingCompanies ? (
              <p className="text-gray-400">Загрузка компаний...</p>
            ) : (
              <select
                id="companyId"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                disabled={isSubmitting || companies.length === 0}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Не назначена --</option>
                {companies.map(company => (
                  <option key={company.id} value={String(company.id)}>{company.name} (ID: {company.id})</option>
                ))}
              </select>
            )}
             {companies.length === 0 && !isLoadingCompanies && <p className="text-xs text-gray-500 mt-1">Компании не найдены. Создайте их сначала.</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition duration-150"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingCompanies}
              className={`py-2 px-5 rounded-md transition duration-150 flex items-center justify-center ${
                isSubmitting || isLoadingCompanies
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Сохранение...</> : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;