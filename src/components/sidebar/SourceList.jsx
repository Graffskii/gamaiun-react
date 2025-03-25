import React, { useState } from 'react';
import SourceItem from './SourceItem';

const SourceList = ({ expandedSource, setExpandedSource }) => {
  const sources = [
    {
      id: 'corp-docs',
      name: 'Корпоративные документы',
      icon: 'ri-folder-line',
      files: [
        { id: 'corp-1', name: 'Устав компании.pdf', icon: 'ri-file-text-line' },
        { id: 'corp-2', name: 'Регламент работы.docx', icon: 'ri-file-text-line' },
        { id: 'corp-3', name: 'Должностные инструкции.pdf', icon: 'ri-file-text-line' }
      ]
    },
    {
      id: 'finance',
      name: 'Финансовые отчеты',
      icon: 'ri-file-chart-line',
      files: [
        { id: 'fin-1', name: 'Отчет Q1 2025.xlsx', icon: 'ri-file-excel-line' },
        { id: 'fin-2', name: 'Отчет Q4 2024.xlsx', icon: 'ri-file-excel-line' }
      ]
    },
    {
      id: 'kb',
      name: 'База знаний',
      icon: 'ri-book-line',
      files: [
        { id: 'kb-1', name: 'Руководство пользователя.pdf', icon: 'ri-article-line' },
        { id: 'kb-2', name: 'FAQ.md', icon: 'ri-article-line' }
      ]
    }
  ];

  const [selectedFiles, setSelectedFiles] = useState([]);

  const toggleFileSelection = (fileId, multiSelect) => {
    if (multiSelect) {
      if (selectedFiles.includes(fileId)) {
        setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      } else {
        setSelectedFiles([...selectedFiles, fileId]);
      }
    } else {
      if (selectedFiles.includes(fileId) && selectedFiles.length === 1) {
        setSelectedFiles([]);
      } else {
        setSelectedFiles([fileId]);
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-400 mb-2">Источники данных</div>
      <div className="space-y-2">
        {sources.map(source => (
          <SourceItem
            key={source.id}
            source={source}
            isExpanded={expandedSource === source.id}
            toggleExpand={() => setExpandedSource(expandedSource === source.id ? null : source.id)}
            selectedFiles={selectedFiles}
            onFileSelect={toggleFileSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default SourceList;