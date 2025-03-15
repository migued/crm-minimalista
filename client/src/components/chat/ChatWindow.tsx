import React, { useState, useRef, useEffect } from 'react';
import { Message, Contact, Conversation } from '../../types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import WhatsAppTemplateSelector from './WhatsAppTemplateSelector';
import { 
  PhoneIcon, 
  ArrowPathIcon, 
  UserIcon, 
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ChatWindowProps {
  contact: Contact;
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, templateId?: string, components?: any[]) => void;
  onAttachFile?: (file: File) => void;
  onEndChat?: () => void;
  onTransferChat?: () => void;
  onAssignChat?: () => void;
  onResolveChat?: () => void;
  loadingMessage?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  conversation,
  messages,
  onSendMessage,
  onAttachFile,
  onEndChat,
  onTransferChat,
  onAssignChat,
  onResolveChat,
  loadingMessage = false
}) => {
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Calcular si está en la ventana de 24 horas
  const isInActiveWindow = () => {
    if (!contact.lastSeen) return false;
    
    const lastSeen = new Date(contact.lastSeen);
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    
    return diffHours < 24;
  };
  
  // Efecto para desplazarse al final de los mensajes cuando se añaden nuevos
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Manejar el envío de mensajes
  const handleSendMessage = (content: string) => {
    onSendMessage(content);
  };
  
  // Manejar el envío de plantillas
  const handleSendTemplate = (templateId: string, variables: Record<string, string>) => {
    // Preparar los componentes para la API de WhatsApp
    const components = Object.entries(variables).map(([key, value]) => ({
      type: 'text',
      text: value
    }));
    
    onSendMessage('', templateId, components);
    setIsTemplatePickerOpen(false);
  };

  // Renderizar el panel de información del contacto
  const renderContactInfo = () => {
    if (!showInfo) return null;
    
    return (
      <div className="p-4 bg-white shadow-lg rounded-lg absolute right-0 top-16 w-80 z-10 border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Información de contacto</h3>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setShowInfo(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Nombre</h4>
            <p className="text-sm text-gray-900">{contact.name}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Teléfono</h4>
            <p className="text-sm text-gray-900">{contact.phone}</p>
          </div>
          
          {contact.email && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Email</h4>
              <p className="text-sm text-gray-900">{contact.email}</p>
            </div>
          )}
          
          {contact.notes && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase">Notas</h4>
              <p className="text-sm text-gray-900">{contact.notes}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Estado WhatsApp</h4>
            <div className="flex items-center mt-1 text-sm">
              {contact.isWhatsAppVerified ? (
                <>
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-green-600">Verificado</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 bg-gray-300 rounded-full mr-2"></span>
                  <span className="text-gray-500">No verificado</span>
                </>
              )}
            </div>
          </div>
          
          {conversation.isAiHandled && (
            <div className="mt-2">
              <div className="text-xs font-medium text-purple-600 bg-purple-50 p-2 rounded flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25v0a2.25 2.25 0 002.25-2.25v-1.5m-10.5-6.826a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h0a2.25 2.25 0 002.25-2.25V4.81c0-1.24 1.01-2.25 2.25-2.25h0a2.25 2.25 0 012.25 2.25v7.06M9 12.75v.75m0 0v.75m0-.75h.75m-.75 0h-.75" />
                </svg>
                Conversación gestionada por IA
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button className="w-full py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
            Ver perfil completo
          </button>
        </div>
      </div>
    );
  };

  // Formatear "desde hace cuánto tiempo" se recibió el último mensaje
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
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
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
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            title="Llamar"
          >
            <PhoneIcon className="h-5 w-5" />
          </button>
          
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            title="Asignar"
            onClick={onAssignChat}
          >
            <UserIcon className="h-5 w-5" />
          </button>
          
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            title="Resolver"
            onClick={onResolveChat}
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          
          <button 
            className={`p-1 rounded-full hover:bg-gray-100 ${showInfo ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
            title="Información"
            onClick={() => setShowInfo(!showInfo)}
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>
        
        {renderContactInfo()}
      </div>
      
      {/* Cuerpo de mensajes */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin mensajes</h3>
              <p className="text-gray-500 text-sm">
                No hay mensajes en esta conversación. ¡Escribe algo para comenzar!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                content={message.content}
                direction={message.direction}
                timestamp={message.timestamp}
                status={message.status}
                senderName={message.isBot ? 'Asistente Virtual' : message.senderName}
                mediaUrl={message.attachments && message.attachments.length > 0 ? message.attachments[0].url : undefined}
                mediaType={message.attachments && message.attachments.length > 0 ? message.attachments[0].type : undefined}
              />
            ))}
            
            {/* Indicador de escritura */}
            {loadingMessage && (
              <MessageBubble
                content=""
                direction="outbound"
                timestamp={new Date()}
                isTyping={true}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Selector de plantilla de WhatsApp */}
      {isTemplatePickerOpen && (
        <div className="p-3 border-t border-gray-200">
          <WhatsAppTemplateSelector
            onSelect={handleSendTemplate}
            onCancel={() => setIsTemplatePickerOpen(false)}
            contact={contact}
          />
        </div>
      )}
      
      {/* Input de mensaje */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendTemplate={() => setIsTemplatePickerOpen(true)}
        onAttachFile={onAttachFile}
        isWhatsApp={conversation.channel === 'whatsapp'}
        isWindowActive={conversation.channel === 'whatsapp' ? isInActiveWindow() : true}
        isLoading={loadingMessage}
        disabled={conversation.isResolved}
        placeholder={conversation.isResolved ? 'Conversación resuelta' : 'Escribe un mensaje...'}
      />
    </div>
  );
};

export default ChatWindow;