import React from 'react';

const SourceItem = ({ source, isExpanded, toggleExpand, selectedFiles, onFileSelect }) => {
  return (
    <div className="source-item">
      <div
        className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700 p-2 rounded source-header ${isExpanded ? 'bg-primary' : ''}`}
        onClick={toggleExpand}
      >
        <i className={source.icon}></i>
        <span>{source.name}</span>
        <i 
          className="ri-arrow-down-s-line ml-auto transition-transform" 
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        ></i>
      </div>
      <div className={`pl-6 mt-2 space-y-2 ${isExpanded ? '' : 'hidden'}`}>
        {source.files.map(file => (
          <div
            key={file.id}
            className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700 p-2 rounded source-file select-none ${
              selectedFiles.includes(file.id) ? 'bg-primary' : ''
            }`}
            onClick={(e) => onFileSelect(file.id, e.ctrlKey || e.shiftKey)}
          >
            <i className={file.icon}></i>
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceItem;