import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Message, Conversation, Contact } from '../../types/chat';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon,
  DocumentTextIcon,
  PhoneIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import WhatsAppTemplateSelector from './WhatsAppTemplateSelector';
import whatsappService from '../../services/whatsapp/whatsappService';

interface ChatInterfaceProps {
  conversation: Conversation;
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string, templateId?: string) => void;
  onAttachFile?: (file: File) => void;
  onEndChat?: () => void;
  onTransferChat?: () => void;
  onToggleAI?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  contact,
  messages,
  onSendMessage,
  onAttachFile,
  onEndChat,
  onTransferChat,
  onToggleAI
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Efecto para desplazarse al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAttachFile) {
      onAttachFile(files[0]);
      // Restablecer el input para permitir subir el mismo archivo nuevamente
      e.target.value = '';
    }
  };
  
  const handleTemplateSelect = (templateId: string, variables: Record<string, string>) => {
    onSendMessage('', templateId);
    setIsTemplatePickerOpen(false);
  };
  
  // Calcula "desde hace cuánto tiempo" se recibió el último mensaje
  const getLastSeenText = () => {
    if (!contact.lastSeen) return 'No disponible';
    
    const lastSeen = new Date(contact.lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMin = Math.round(diffMs / 60000);
    
    if (diffMin < 60) {
      return `hace ${diffMin} minutos`;
    } else if (diffMin < 1440) {
      const hours = Math.floor(diffMin / 60);
      return `hace ${hours} horas`;
    } else {
      const days = Math.floor(diffMin / 1440);
      return `hace ${days} días`;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Encabezado del chat */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {contact.photo ? (
                <img 
                  src={contact.photo} 
                  alt={contact.name} 
                  className="h-10 w-10 rounded-full object-cover" 
                />
              ) : (
                <span className="text-gray-500 font-medium">
                  {contact.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {conversation.channel === 'whatsapp' && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-900 mr-2">{contact.name}</div>
              {conversation.isAiHandled && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  IA
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {conversation.channel === 'whatsapp' && (
                <>
                  <span className="flex items-center">
                    {contact.isWhatsAppVerified ? 'En línea' : getLastSeenText()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className={`${conversation.isAiHandled ? 'text-purple-500' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={onToggleAI}
            title={conversation.isAiHandled ? 'Desactivar asistencia de IA' : 'Activar asistencia de IA'}
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600" onClick={onTransferChat}>
            <DocumentTextIcon className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Cuerpo del chat con mensajes */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              direction={message.direction}
              status={message.status}
              senderName={message.senderName}
              isBot={message.isBot}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Selector de plantillas de WhatsApp */}
      {isTemplatePickerOpen && (
        <div className="p-3 border-t border-gray-200">
          <WhatsAppTemplateSelector
            onSelect={handleTemplateSelect}
            onCancel={() => setIsTemplatePickerOpen(false)}
            contact={contact}
          />
        </div>
      )}
      
      {/* Pie del chat con entrada de mensaje */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 mr-2"
            onClick={handleAttachClick}
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {conversation.channel === 'whatsapp' && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 mr-2"
              onClick={() => setIsTemplatePickerOpen(!isTemplatePickerOpen)}
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 mr-2"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <textarea
              rows={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={`Escribe un mensaje${conversation.channel === 'whatsapp' ? ' de WhatsApp' : ''}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            type="button"
            className={`ml-2 p-2 rounded-full focus:outline-none ${newMessage.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        {conversation.channel === 'whatsapp' && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.036c.101-.108.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.288.131.332.202.043.72.043.433-.101.824z"/>
              </svg>
              {contact.isWhatsAppVerified ? 
                'Ventana de 24 horas activa' : 
                'Solo puedes enviar mensajes de plantilla fuera de la ventana de 24 horas'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;