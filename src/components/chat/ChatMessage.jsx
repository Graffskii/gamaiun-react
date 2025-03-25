import React from 'react';

const ChatMessage = ({ message }) => {
  const { text, items, isUser } = message;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 max-w-3xl ${isUser ? 'ml-auto' : ''}`}>
      {text && <div className="text-sm text-gray-300 mb-2">{text}</div>}
      {items && items.length > 0 && (
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatMessage;