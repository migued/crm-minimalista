import React from 'react';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string | Date;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  isTemplate?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  isTyping?: boolean;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  direction,
  timestamp,
  status = 'sent',
  isTemplate = false,
  mediaUrl,
  mediaType,
  isTyping = false,
  senderName
}) => {
  // Formato de hora
  const formatTime = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determinar el color de fondo según dirección y tipo
  const getBgColor = () => {
    if (direction === 'outbound') {
      return isTemplate 
        ? 'bg-blue-100 border border-blue-200' 
        : 'bg-blue-500 text-white';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Renderizar contenido multimedia
  const renderMedia = () => {
    if (!mediaUrl) return null;

    switch (mediaType) {
      case 'image':
        return (
          <div className="mb-2 rounded overflow-hidden">
            <img 
              src={mediaUrl} 
              alt="Imagen adjunta" 
              className="max-w-full h-auto max-h-60 rounded" 
            />
          </div>
        );
      case 'video':
        return (
          <div className="mb-2 rounded overflow-hidden">
            <video 
              src={mediaUrl} 
              controls 
              className="max-w-full h-auto max-h-60 rounded" 
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mb-2">
            <audio src={mediaUrl} controls className="max-w-full" />
          </div>
        );
      case 'document':
        return (
          <div className="mb-2 p-2 bg-white rounded border border-gray-200 flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <a 
              href={mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm truncate max-w-xs"
            >
              Ver documento
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar indicador de estado
  const renderStatus = () => {
    if (direction === 'inbound') return null;

    let statusIcon;
    let statusColor = 'text-gray-400';

    switch (status) {
      case 'sent':
        statusIcon = (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
        break;
      case 'delivered':
        statusIcon = (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        );
        statusColor = 'text-gray-500';
        break;
      case 'read':
        statusIcon = (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        );
        statusColor = 'text-blue-500';
        break;
      case 'failed':
        statusIcon = (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
        statusColor = 'text-red-500';
        break;
      case 'pending':
        statusIcon = (
          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
        break;
      default:
        statusIcon = null;
    }

    return (
      <span className={`${statusColor} ml-1`}>
        {statusIcon}
      </span>
    );
  };

  return (
    <div className={`max-w-xs lg:max-w-md xl:max-w-lg mb-3 ${direction === 'outbound' ? 'ml-auto' : 'mr-auto'}`}>
      {/* Nombre del remitente (solo para mensajes entrantes) */}
      {direction === 'inbound' && senderName && (
        <div className="text-xs text-gray-500 mb-1 ml-2">{senderName}</div>
      )}
      
      {/* Indicador de escribiendo */}
      {isTyping ? (
        <div className={`p-3 rounded-lg ${getBgColor()}`}>
          <div className="flex space-x-1 items-center">
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      ) : (
        <div className={`p-3 rounded-lg ${getBgColor()}`}>
          {/* Contenido multimedia */}
          {renderMedia()}
          
          {/* Contenido del mensaje */}
          <div className="whitespace-pre-wrap break-words">{content}</div>
          
          {/* Hora y estado */}
          <div className={`text-xs mt-1 flex justify-end items-center ${direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(timestamp)}
            {renderStatus()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;