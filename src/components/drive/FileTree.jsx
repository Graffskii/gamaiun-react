// src/components/drive/FileTree.jsx
import React from 'react';
import DriveItemNode from './DriveItemNode'; // Путь может отличаться

const FileTree = ({ items, level = 0 }) => {
    if (!items || items.length === 0) {
        return null; // Не рендерить ничего, если нет элементов
    }

  return (
    <div>
      {items.map((item) => (
        <DriveItemNode key={item.google_id} node={item} level={level} />
      ))}
    </div>
  );
};

export default FileTree;