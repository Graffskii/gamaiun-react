// src/components/admin/DriveSyncPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DriveSyncPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'/'error', message: '...' }
  const { token } = useAuth();

  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setIsLoadingCompanies(true);
    setSyncStatus(null);
    try {
      const response = await fetch('/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(String(data[0].id)); // Выбираем первую по умолчанию
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setSyncStatus({ type: 'error', message: 'Не удалось загрузить список компаний: ' + err.message });
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [token, selectedCompanyId]); // Добавил selectedCompanyId, чтобы не сбрасывать выбор при обновлении

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSync = async () => {
    if (!selectedCompanyId || !token) {
      setSyncStatus({ type: 'error', message: 'Пожалуйста, выберите компанию для синхронизации.' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: parseInt(selectedCompanyId, 10) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Synchronization failed: ${response.statusText}`);
      }
      setSyncStatus({ type: 'success', message: `Синхронизация для компании ID ${selectedCompanyId} завершена. ${data.details?.count || 0} элементов обработано, ${data.details?.deleted || 0} удалено.` });
      // Можно добавить обновление дерева файлов в AppContext, если нужно видеть результат сразу
      // appContext.fetchDriveItems(); // Потребует передачи appContext или вызова через него
    } catch (err) {
      console.error("Error during sync:", err);
      setSyncStatus({ type: 'error', message: 'Ошибка синхронизации: ' + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Синхронизация Google Drive</h2>
      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="companySelect" className="block text-sm font-medium text-gray-300 mb-1">
            Выберите компанию для синхронизации:
          </label>
          {isLoadingCompanies ? (
            <p className="text-gray-400">Загрузка компаний...</p>
          ) : companies.length > 0 ? (
            <select
              id="companySelect"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              disabled={isSyncing || companies.length === 0}
              className="w-full md:w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {companies.map(company => (
                <option key={company.id} value={String(company.id)}>
                  {company.name} (ID: {company.id}) - Папка Drive: {company.google_drive_root_folder_id || 'Не указана'}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-400 italic">Нет доступных компаний. Создайте компанию с указанным ID папки Drive.</p>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing || !selectedCompanyId || isLoadingCompanies || companies.find(c => c.id === parseInt(selectedCompanyId))?.google_drive_root_folder_id === null}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <><i className="ri-loader-4-line animate-spin mr-2"></i>Синхронизация...</>
          ) : (
            <><i className="ri-refresh-line mr-2"></i>Запустить синхронизацию</>
          )}
        </button>
        {companies.length > 0 && selectedCompanyId && companies.find(c => c.id === parseInt(selectedCompanyId))?.google_drive_root_folder_id === null && !isLoadingCompanies && (
             <p className="text-xs text-yellow-400 mt-2">
                Для выбранной компании не указан ID корневой папки Google Drive. Синхронизация невозможна.
             </p>
         )}


        {syncStatus && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            syncStatus.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
          }`}>
            {syncStatus.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveSyncPage;