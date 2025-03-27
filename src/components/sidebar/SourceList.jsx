import React, { useState } from 'react';
import SourceItem from './SourceItem';
import { useAppContext } from '../../contexts/AppContext';

const SourceList = () => {
  const { sources, selectedFiles, updateSelectedFiles } = useAppContext();
  const [expandedSources, setExpandedSources] = useState([]);

  const toggleSourceExpand = (sourceId) => {
    setExpandedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleFileSelection = (fileId) => {
    const newSelectedFiles = selectedFiles.includes(fileId)
      ? selectedFiles.filter(id => id !== fileId)
      : [...selectedFiles, fileId];

    updateSelectedFiles(newSelectedFiles);
  };

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-400 mb-2">
        Источники данных 
      </div>
      <div className="space-y-2">
        {sources.map(source => (
          <SourceItem
            key={source.id}
            source={source}
            isExpanded={expandedSources.includes(source.id)}
            toggleExpand={() => toggleSourceExpand(source.id)}
            selectedFiles={selectedFiles}
            onFileSelect={toggleFileSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default SourceList;