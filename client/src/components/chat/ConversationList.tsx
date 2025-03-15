import React from 'react';
import { Conversation } from '../../types/chat';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import Badge from '../ui/Badge';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onSearch?: (query: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onSearch
}) => {
  const formatTime = (date: Date | string) => {
    const messageDate = date instanceof Date ? date : new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: es });
    } else if (isYesterday(messageDate)) {
      return 'Ayer';
    } else {
      return format(messageDate, 'dd/MM/yy', { locale: es });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.036c.101-.108.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.288.131.332.202.043.72.043.433-.101.824z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'web_chat':
        return (
          <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
    }
  };

  const truncateText = (text: string, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de búsqueda */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Buscar conversaciones..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {conversations.map(conversation => (
            <li 
              key={conversation.id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedConversationId === conversation.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center p-3 relative">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {conversation.contactPhoto ? (
                      <img 
                        src={conversation.contactPhoto} 
                        alt={conversation.contactName} 
                        className="h-10 w-10 rounded-full object-cover" 
                      />
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {conversation.contactName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
                
                {/* Información de la conversación */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.contactName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="mr-1">
                      {getChannelIcon(conversation.channel)}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {truncateText(conversation.lastMessage || '')}
                    </p>
                  </div>
                  
                  {/* Tags y estado */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex space-x-1">
                      {conversation.isAiHandled && (
                        <Badge text="Bot" variant="purple" size="sm" />
                      )}
                      {conversation.tags?.slice(0, 2).map(tag => (
                        <Badge key={tag} text={tag} variant="gray" size="sm" />
                      ))}
                    </div>
                    {conversation.isResolved && (
                      <span className="h-2 w-2 rounded-full bg-green-500" title="Resuelto"></span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConversationList;