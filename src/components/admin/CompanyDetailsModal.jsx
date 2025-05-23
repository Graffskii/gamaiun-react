// src/components/admin/CompanyDetailsModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CompanyDetailsModal = ({ isOpen, onClose, companyId }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchCompanyDetails = useCallback(async () => {
    if (!isOpen || !companyId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/companies/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch company details: ${response.statusText}`);
      }
      const data = await response.json();
      setCompanyDetails(data);
    } catch (err) {
      console.error("Error fetching company details:", err);
      setError(err.message);
      setCompanyDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, companyId, token]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]); // Зависимость от самой функции, которая зависит от isOpen, companyId, token

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative border border-gray-700 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl z-10">×</button>

        {isLoading && <div className="text-center text-white py-10">Загрузка деталей компании...</div>}
        {error && <div className="text-center text-red-400 py-10">Ошибка: {error}</div>}

        {companyDetails && !isLoading && !error && (
          <>
            <h2 className="text-xl font-semibold text-white mb-1">
              {companyDetails.name} (ID: {companyDetails.id})
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              ID папки Drive: {companyDetails.google_drive_root_folder_id || <span className="italic">не указан</span>}
            </p>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {/* Пользователи компании */}
              <div>
                <h3 className="text-md font-semibold text-gray-200 mb-2 border-b border-gray-700 pb-1">Пользователи ({companyDetails.users?.length || 0})</h3>
                {companyDetails.users && companyDetails.users.length > 0 ? (
                  <ul className="list-disc list-inside pl-1 space-y-1 text-sm text-gray-300">
                    {companyDetails.users.map(user => (
                      <li key={user.id}>
                        {user.name} ({user.email}) - <span className="font-mono text-xs">{user.role}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">В этой компании нет пользователей.</p>
                )}
              </div>

              {/* Корневые файлы/папки компании */}
              <div>
                <h3 className="text-md font-semibold text-gray-200 mb-2 border-b border-gray-700 pb-1">Корневые элементы Диска ({companyDetails.driveItems?.length || 0})</h3>
                {companyDetails.driveItems && companyDetails.driveItems.length > 0 ? (
                  <ul className="list-disc list-inside pl-1 space-y-1 text-sm text-gray-300">
                    {companyDetails.driveItems.map(item => (
                      <li key={item.id} className="flex items-center">
                        <i className={`mr-2 ${item.item_type === 'folder' ? 'ri-folder-line text-blue-400' : 'ri-file-line text-gray-400'}`}></i>
                        {item.name}
                        <span className="text-xs text-gray-500 ml-2">
                          (ID источника: {item.original_source_id || 'N/A'}, Обновлено: {new Date(item.updated_at).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">Корневые элементы для этой компании не найдены/не синхронизированы.</p>
                )}
              </div>
            </div>
            <div className="pt-4 mt-auto border-t border-gray-700 flex justify-end">
                <button
                    onClick={onClose}
                    className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition duration-150"
                >
                    Закрыть
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsModal;