// src/components/drive/DriveItemNode.jsx
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext'; // Путь может отличаться

// Импортируем компонент для рекурсии
import FileTree from './FileTree';

const DriveItemNode = ({ node, level = 0 }) => {
  const { selectedDriveItemIds, toggleDriveItemSelection } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(true); // Папки по умолчанию раскрыты

  const isFolder = node.item_type === 'folder';
  const isSelected = selectedDriveItemIds.has(node.google_id);

  // Определение состояния чекбокса (включая частичное выделение)
  // Это более сложная часть, пока сделаем просто selected/not selected
  // const selectionState = useMemo(() => {
  //   if (!isFolder) return isSelected ? 'checked' : 'unchecked';
  //   // Логика для папки (проверка детей) - СЛОЖНО, пока пропускаем
  //   return isSelected ? 'checked' : 'unchecked';
  // }, [isFolder, isSelected, node.children, selectedDriveItemIds]);
  // const isIndeterminate = selectionState === 'indeterminate';


  const handleToggleExpand = (e) => {
      e.stopPropagation(); // Не триггерить чекбокс
      if (isFolder) {
          setIsExpanded(!isExpanded);
      }
  };

  const handleCheckboxChange = () => {
    toggleDriveItemSelection(node.google_id, node.item_type);
  };

  // Иконка файла/папки
  const Icon = () => {
      if (isFolder) {
          return isExpanded ? <i className="ri-folder-open-line text-blue-400"></i> : <i className="ri-folder-line text-blue-400"></i>;
      }
      // Можно добавить иконки для разных типов файлов на основе node.mime_type или node.icon_link
      if (node.icon_link) {
          return <img src={node.icon_link} alt="file icon" className="w-4 h-4 inline-block object-contain"/>;
      }
      // Дефолтная иконка файла
      return <i className="ri-file-line text-gray-400"></i>;
  };

  return (
    <div style={{ paddingLeft: `${level * 1.25}rem` }} className="text-sm"> {/* Отступ для уровня */}
      <div className="flex items-center py-1 hover:bg-gray-700 rounded group">
        {/* Чекбокс */}
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-primary rounded border-gray-600 bg-gray-800 focus:ring-primary mr-2 cursor-pointer"
          checked={isSelected}
          // ref={el => el && (el.indeterminate = isIndeterminate)} // Для поддержки частичного выбора
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()} // Остановить всплытие, чтобы не сработал expand/collapse
        />

        {/* Иконка и Имя */}
         <div className="flex items-center gap-1.5 cursor-pointer flex-grow overflow-hidden" onClick={handleToggleExpand} title={node.name}>
            {/* Иконка папки/файла */}
            <span className="flex-shrink-0 w-4 text-center">
                <Icon />
            </span>
             {/* Имя файла/папки */}
            <span className="truncate text-gray-300 group-hover:text-white">
                {node.name}
            </span>
        </div>

         {/* Ссылка на просмотр (опционально) */}
         {node.web_view_link && (
             <a
                href={node.web_view_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Остановить всплытие
                className="ml-2 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Открыть на Google Диске"
             >
                <i className="ri-external-link-line"></i>
             </a>
         )}

      </div>

      {/* Рендеринг дочерних элементов (если папка раскрыта) */}
      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <FileTree items={node.children} level={level + 1} />
      )}
    </div>
  );
};

export default DriveItemNode;