import React from 'react';
import { Conversation } from '../../types/chat';
import { 
  CheckCircleIcon, 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  // Formatear fecha
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Hoy, mostrar hora
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Ayer
      return 'Ayer';
    } else if (diffDays < 7) {
      // Día de la semana
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Fecha completa
      return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  // Obtener ícono del canal
  const getChannelIcon = () => {
    switch (conversation.channel) {
      case 'whatsapp':
        return (
          <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.036c.101-.108.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.288.131.332.202.043.72.043.433-.101.824z"/>
            </svg>
          </div>
        );
      case 'email':
        return <EnvelopeIcon className="h-4 w-4 text-blue-500" />;
      case 'web_chat':
        return <ChatBubbleLeftRightIcon className="h-4 w-4 text-purple-500" />;
      case 'sms':
        return <PhoneIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Truncar texto
  const truncateText = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div 
      className={`p-3 border-b cursor-pointer transition-colors duration-150 ${
        isSelected 
          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        {/* Avatar */}
        <div className="relative mr-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {conversation.contactPhoto ? (
              <img 
                src={conversation.contactPhoto} 
                alt={conversation.contactName} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <span className="text-gray-500 font-medium">
                {conversation.contactName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full">
            {getChannelIcon()}
          </div>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {conversation.contactName}
            </h4>
            <span className="text-xs text-gray-500">
              {formatDate(conversation.lastMessageAt)}
            </span>
          </div>
          
          <div className="flex items-center mt-1">
            {conversation.isResolved && (
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
            )}
            <p className="text-xs text-gray-500 truncate">
              {truncateText(conversation.lastMessage || '', 40)}
            </p>
          </div>
          
          {/* Tags y contador de no leídos */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-wrap gap-1">
              {conversation.tags && conversation.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              
              {conversation.isAiHandled && (
                <span className="inline-block text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                  AI
                </span>
              )}
            </div>
            
            {conversation.unreadCount > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;