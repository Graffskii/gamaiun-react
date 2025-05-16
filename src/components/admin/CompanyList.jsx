// src/components/admin/CompanyList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CompanyEditModal from './CompanyEditModal'; // Создадим его следующим

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // null для новой, объект для редактирования

  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch companies: ${response.statusText}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // --- Обработчики для модального окна ---
  const handleOpenCreateModal = () => {
    setEditingCompany(null); // null означает создание новой компании
    setIsModalOpen(true);
    setError(null);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  // --- Обработка создания/обновления компании (вызывается из модалки) ---
  const handleCompanySave = useCallback(async (companyData) => {
    if (!token) throw new Error("Not authenticated");
    setError(null);
    const isEditing = !!editingCompany; // Определяем, редактируем или создаем
    const url = isEditing ? `http://localhost:5000/api/admin/companies/${editingCompany.id}` : 'http://localhost:5000/api/admin/companies';
    const method = isEditing ? 'PUT' : 'POST';

    console.log(`${method} company at ${url} with data:`, companyData);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isEditing ? 'update' : 'create'} company`);
      }

      // Обновляем список компаний
      await fetchCompanies(); // Простой способ - перезапросить
      // Альтернатива: локально обновить/добавить в setCompanies

      console.log(`Company ${isEditing ? 'updated' : 'created'} successfully:`, responseData);
      // Закрытие модалки произойдет в CompanyEditModal при успехе

    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} company:`, err);
      setError(err.message); // Устанавливаем ошибку, чтобы ее можно было показать
      throw err; // Перебрасываем, чтобы модалка могла ее обработать
    }
  }, [token, editingCompany, fetchCompanies]);


  // --- Обработка удаления компании ---
  const handleDeleteCompany = useCallback(async (companyId, companyName) => {
    if (!token) return;
    if (!window.confirm(`Вы уверены, что хотите удалить компанию "${companyName}"? Все связанные файлы также будут удалены.`)) {
        return;
    }
    setError(null);
    setIsLoading(true); // Можно использовать isLoading или добавить isDeletingCompany

    try {
        const response = await fetch(`http://localhost:5000/api/admin/companies/${companyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`},
        });

        if (!response.ok) {
            // DELETE может вернуть 204 без тела, или ошибку с телом
            let errorMessage = `Failed to delete company: ${response.statusText}`;
            if (response.status !== 204) {
                const errData = await response.json().catch(() => ({}));
                errorMessage = errData.message || errorMessage;
            }
            throw new Error(errorMessage);
        }
        // Если статус 204, то удаление успешно
        console.log(`Company ${companyId} deleted successfully.`);
        await fetchCompanies(); // Обновляем список

    } catch (err) {
        console.error("Error deleting company:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, [token, fetchCompanies]);


  if (isLoading && companies.length === 0) return <div className="text-center p-4">Загрузка компаний...</div>;
  if (error && !isModalOpen) return <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">Ошибка: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Управление компаниями</h2>
        <button
          onClick={handleOpenCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <i className="ri-add-line mr-2"></i>Добавить компанию
        </button>
      </div>

      {companies.length === 0 && !isLoading && (
        <div className="text-center p-4 text-gray-400">Компании не найдены.</div>
      )}

      {companies.length > 0 && (
        <div className="bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Название</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID Папки Drive</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-5 py-4 text-sm">{company.id}</td>
                  <td className="px-5 py-4 text-sm">{company.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 truncate" title={company.google_drive_root_folder_id || ''}>
                    {company.google_drive_root_folder_id || '-'}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="text-indigo-400 hover:text-indigo-300 mr-3"
                      title="Редактировать компанию"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      className="text-red-400 hover:text-red-300"
                      title="Удалить компанию"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                    {/* TODO: Кнопка для просмотра деталей компании (пользователи, файлы) */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CompanyEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          companyToEdit={editingCompany} // Может быть null для создания
          onCompanySave={handleCompanySave}
        />
      )}
    </div>
  );
};

export default CompanyList;