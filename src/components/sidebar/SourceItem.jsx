import React from 'react';

const SourceItem = ({ source, isExpanded, toggleExpand, selectedFiles, onFileSelect }) => {
  // Функция для обработки клика по файлу с поддержкой мультивыбора
  const handleFileClick = (file, event) => {
    // Проверяем нажатие Ctrl или Shift
    onFileSelect(file.id, true);
  };

  return (
    <div className="source-item">
      {/* Заголовок источника */}
      <div
        className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700 p-2 rounded source-header ${
          isExpanded ? 'bg-primary' : ''
        }`}
        onClick={toggleExpand}
      >
        <i className={source.icon}></i>
        <span>{source.name}</span>
        <i 
          className="ri-arrow-down-s-line ml-auto transition-transform" 
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        ></i>
      </div>

      {/* Список файлов */}
      <div className={`pl-6 mt-2 space-y-2 ${isExpanded ? '' : 'hidden'}`}>
        {source.files.map(file => (
          <div
            key={file.id}
            className={`
              flex items-center gap-2 text-sm cursor-pointer 
              hover:bg-gray-700 p-2 rounded source-file 
              select-none transition-colors duration-200
              ${selectedFiles.includes(file.id) 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-700'
              }
            `}
            onClick={(e) => handleFileClick(file, e)}
          >
            <i className={file.icon}></i>
            <span>{file.name}</span>
            {selectedFiles.includes(file.id) && (
              <i className="ri-check-line ml-auto text-white"></i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceItem;