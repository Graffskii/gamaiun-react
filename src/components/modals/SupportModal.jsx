import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const SupportModal = () => {
  const { toggleSupportModal } = useContext(AppContext);
  const [category, setCategory] = useState('technical');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    console.log('Отправка обращения в поддержку:', { category, description });
    // Здесь будет логика отправки обращения
    toggleSupportModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1E293B] rounded-lg w-[500px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Обращение в поддержку</h3>
          <button onClick={toggleSupportModal} className="text-gray-400 hover:text-white">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4"
            >
              <option value="technical">Техническая проблема</option>
              <option value="question">Вопрос по работе сервиса</option>
              <option value="improvement">Предложение по улучшению</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 h-32"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={toggleSupportModal}
              className="text-gray-400 hover:text-white border border-gray-700 rounded-button py-2 px-4"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary hover:bg-blue-600 text-white rounded-button py-2 px-4"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;