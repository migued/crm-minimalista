import React from 'react';
import { MessageDirection } from '../../types/chat';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatMessageProps {
  content: string;
  timestamp: Date | string;
  direction: MessageDirection;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  senderName?: string;
  isBot?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  timestamp,
  direction,
  status = 'sent',
  senderName,
  isBot = false
}) => {
  // Formatea la fecha del mensaje
  const formatTime = (date: Date | string) => {
    const messageDate = date instanceof Date ? date : new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: es });
    } else if (isYesterday(messageDate)) {
      return `Ayer ${format(messageDate, 'HH:mm', { locale: es })}`;
    } else {
      return format(messageDate, 'dd MMM, HH:mm', { locale: es });
    }
  };

  // Estilo del mensaje basado en la dirección
  const messageClass = direction === 'inbound' 
    ? 'bg-gray-100 border border-gray-200' 
    : 'bg-blue-100 border border-blue-200';
  
  // Alineación del mensaje basada en la dirección
  const alignmentClass = direction === 'inbound' ? 'self-start mr-16' : 'self-end ml-16';
  
  // Estado del mensaje (solo para mensajes salientes)
  const getStatusIcon = () => {
    if (direction !== 'outbound') return null;
    
    switch (status) {
      case 'sent':
        return <span className="text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-gray-500">✓✓</span>;
      case 'read':
        return <span className="text-blue-500">✓✓</span>;
      case 'failed':
        return <span className="text-red-500">✕</span>;
      case 'pending':
        return <span className="text-gray-300">⏱</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-3/4 rounded-lg py-2 px-3 mb-2 ${messageClass} ${alignmentClass}`}>
      {/* Nombre del remitente (solo para mensajes entrantes) */}
      {direction === 'inbound' && senderName && (
        <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
          {senderName}
          {isBot && (
            <span className="ml-1 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              Bot
            </span>
          )}
        </div>
      )}
      
      {/* Contenido del mensaje */}
      <div className="text-sm break-words whitespace-pre-wrap">
        {content}
      </div>
      
      {/* Hora y estado */}
      <div className="text-xs text-gray-500 text-right mt-1 flex justify-end items-center">
        <span>{formatTime(timestamp)}</span>
        <span className="ml-1">{getStatusIcon()}</span>
      </div>
    </div>
  );
};

export default ChatMessage;