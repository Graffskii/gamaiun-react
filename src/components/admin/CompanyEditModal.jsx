// src/components/admin/CompanyEditModal.jsx
import React, { useState, useEffect } from 'react';

const CompanyEditModal = ({ isOpen, onClose, companyToEdit, onCompanySave }) => {
  const [name, setName] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyToEdit) {
      setName(companyToEdit.name || '');
      setDriveFolderId(companyToEdit.google_drive_root_folder_id || '');
    } else { // Для создания новой компании
      setName('');
      setDriveFolderId('');
    }
    setError(null); // Сбрасываем ошибки при открытии/смене компании
  }, [companyToEdit, isOpen]); // Добавили isOpen для сброса при повторном открытии

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Название компании обязательно.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await onCompanySave({
        name: name.trim(),
        google_drive_root_folder_id: driveFolderId.trim() || null, // Отправляем null, если пусто
      });
      onClose(); // Закрываем при успехе
    } catch (err) {
      console.error("Error saving company from modal:", err);
      setError(err.message || 'Не удалось сохранить компанию.');
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
        <h2 className="text-xl font-semibold text-white mb-6">
          {companyToEdit ? 'Редактировать компанию' : 'Создать новую компанию'}
        </h2>

        {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">Название компании *</label>
            <input
              type="text"
              id="companyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="driveFolderId" className="block text-sm font-medium text-gray-300 mb-1">ID корневой папки Google Drive (опционально)</label>
            <input
              type="text"
              id="driveFolderId"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              disabled={isSubmitting}
              placeholder="Например, 1a2B3c4D5e6F7g8H9i0JkLmNoPqRsTuV"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
             <p className="text-xs text-gray-500 mt-1">Используется для синхронизации файлов с Google Drive.</p>
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
              disabled={isSubmitting || !name.trim()}
              className={`py-2 px-5 rounded-md transition duration-150 flex items-center justify-center ${
                 isSubmitting || !name.trim()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? <><i className="ri-loader-4-line animate-spin mr-2"></i>Сохранение...</> : (companyToEdit ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;