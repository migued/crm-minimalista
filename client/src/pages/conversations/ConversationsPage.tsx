import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { 
  PlusIcon, 
  AdjustmentsVerticalIcon, 
  ArrowPathIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import ConversationList from '../../components/chat/ConversationList';
import ChatInterface from '../../components/chat/ChatInterface';
import { Conversation, Message, Contact } from '../../types/chat';
import whatsappService from '../../services/whatsapp/whatsappService';

// Datos simulados
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    contactId: 'contact1',
    contactName: 'Juan Pérez',
    channel: 'whatsapp',
    lastMessage: 'Gracias por la información, lo revisaré.',
    lastMessageAt: '2023-04-20T15:30:00',
    unreadCount: 0,
    isResolved: false,
    assignedTo: 'user1',
    tags: ['Cliente', 'VIP']
  },
  {
    id: 'conv2',
    contactId: 'contact2',
    contactName: 'María Rodríguez',
    channel: 'email',
    lastMessage: 'Por favor envíeme más detalles sobre el producto.',
    lastMessageAt: '2023-04-20T14:15:00',
    unreadCount: 3,
    isResolved: false,
    assignedTo: 'user1'
  },
  {
    id: 'conv3',
    contactId: 'contact3',
    contactName: 'Roberto García',
    contactPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
    channel: 'whatsapp',
    lastMessage: 'Quiero agendar una cita para ver la propiedad.',
    lastMessageAt: '2023-04-20T11:20:00',
    unreadCount: 1,
    isResolved: false,
    isAiHandled: true,
    assignedTo: 'user1',
    tags: ['Prospecto']
  },
  {
    id: 'conv4',
    contactId: 'contact4',
    contactName: 'Laura Martínez',
    channel: 'web_chat',
    lastMessage: 'He visto su anuncio y estoy interesada.',
    lastMessageAt: '2023-04-19T16:45:00',
    unreadCount: 0,
    isResolved: true,
    assignedTo: 'user2',
    tags: ['Nuevo']
  },
  {
    id: 'conv5',
    contactId: 'contact5',
    contactName: 'Pedro Sánchez',
    contactPhoto: 'https://randomuser.me/api/portraits/men/42.jpg',
    channel: 'whatsapp',
    lastMessage: '¿A qué hora abren mañana?',
    lastMessageAt: '2023-04-19T09:30:00',
    unreadCount: 0,
    isResolved: false,
    assignedTo: 'user1'
  }
];

const MOCK_CONTACTS: Record<string, Contact> = {
  'contact1': {
    id: 'contact1',
    name: 'Juan Pérez',
    phone: '+5215512345678',
    email: 'juan.perez@ejemplo.com',
    isWhatsAppVerified: true,
    lastSeen: '2023-04-20T15:35:00'
  },
  'contact2': {
    id: 'contact2',
    name: 'María Rodríguez',
    phone: '+5215587654321',
    email: 'maria.rodriguez@ejemplo.com',
    isWhatsAppVerified: false
  },
  'contact3': {
    id: 'contact3',
    name: 'Roberto García',
    phone: '+5215523456789',
    email: 'roberto.garcia@ejemplo.com',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    isWhatsAppVerified: true,
    lastSeen: '2023-04-20T11:25:00'
  },
  'contact4': {
    id: 'contact4',
    name: 'Laura Martínez',
    phone: '+5215534567890',
    email: 'laura.martinez@ejemplo.com',
    isWhatsAppVerified: false
  },
  'contact5': {
    id: 'contact5',
    name: 'Pedro Sánchez',
    phone: '+5215545678901',
    email: 'pedro.sanchez@ejemplo.com',
    photo: 'https://randomuser.me/api/portraits/men/42.jpg',
    isWhatsAppVerified: true,
    lastSeen: '2023-04-19T16:40:00'
  }
};

// Mensajes simulados para las conversaciones
const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv1': [
    {
      id: 'msg1_1',
      conversationId: 'conv1',
      content: 'Hola, me gustaría información sobre sus servicios.',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact1',
      senderName: 'Juan Pérez',
      timestamp: '2023-04-20T14:30:00'
    },
    {
      id: 'msg1_2',
      conversationId: 'conv1',
      content: 'Claro, con gusto. ¿Qué tipo de servicio está buscando específicamente?',
      direction: 'outbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'user1',
      timestamp: '2023-04-20T14:35:00'
    },
    {
      id: 'msg1_3',
      conversationId: 'conv1',
      content: 'Estoy interesado en el paquete premium que vi en su página web.',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact1',
      senderName: 'Juan Pérez',
      timestamp: '2023-04-20T14:40:00'
    },
    {
      id: 'msg1_4',
      conversationId: 'conv1',
      content: 'Perfecto. Le envío el PDF con todos los detalles del paquete premium. Incluye todas las características y precios actualizados.',
      direction: 'outbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'user1',
      timestamp: '2023-04-20T14:45:00'
    },
    {
      id: 'msg1_5',
      conversationId: 'conv1',
      content: 'Gracias por la información, lo revisaré.',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact1',
      senderName: 'Juan Pérez',
      timestamp: '2023-04-20T15:30:00'
    }
  ],
  'conv2': [
    {
      id: 'msg2_1',
      conversationId: 'conv2',
      content: 'Buenas tardes, vi su anuncio sobre los servicios de asesoría.',
      direction: 'inbound',
      channel: 'email',
      status: 'read',
      senderId: 'contact2',
      senderName: 'María Rodríguez',
      timestamp: '2023-04-20T13:15:00'
    },
    {
      id: 'msg2_2',
      conversationId: 'conv2',
      content: 'Buenas tardes María, gracias por contactarnos. Tenemos varios servicios de asesoría disponibles. ¿En qué área específica está interesada?',
      direction: 'outbound',
      channel: 'email',
      status: 'delivered',
      senderId: 'user1',
      timestamp: '2023-04-20T13:30:00'
    },
    {
      id: 'msg2_3',
      conversationId: 'conv2',
      content: 'Estoy interesada en la asesoría financiera para mi pequeña empresa. ¿Qué opciones tienen?',
      direction: 'inbound',
      channel: 'email',
      status: 'read',
      senderId: 'contact2',
      senderName: 'María Rodríguez',
      timestamp: '2023-04-20T14:00:00'
    },
    {
      id: 'msg2_4',
      conversationId: 'conv2',
      content: 'Por favor envíeme más detalles sobre el producto.',
      direction: 'inbound',
      channel: 'email',
      status: 'read',
      senderId: 'contact2',
      senderName: 'María Rodríguez',
      timestamp: '2023-04-20T14:15:00'
    }
  ],
  'conv3': [
    {
      id: 'msg3_1',
      conversationId: 'conv3',
      content: 'Hola, estoy interesado en la propiedad que tienen en venta en la calle Principal #123.',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact3',
      senderName: 'Roberto García',
      timestamp: '2023-04-20T10:30:00'
    },
    {
      id: 'msg3_2',
      conversationId: 'conv3',
      content: 'Hola Roberto, gracias por tu interés. Esa propiedad está disponible para visitas. ¿Te gustaría agendar una cita para verla?',
      direction: 'outbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'bot',
      senderName: 'Asistente Virtual',
      isBot: true,
      timestamp: '2023-04-20T10:32:00'
    },
    {
      id: 'msg3_3',
      conversationId: 'conv3',
      content: 'Sí, me interesa verla lo antes posible. ¿Cuándo sería posible?',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact3',
      senderName: 'Roberto García',
      timestamp: '2023-04-20T10:45:00'
    },
    {
      id: 'msg3_4',
      conversationId: 'conv3',
      content: 'Tenemos disponibilidad para mañana a las 10:00 AM o pasado mañana a las 3:00 PM. ¿Alguna de estas opciones te funciona?',
      direction: 'outbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'bot',
      senderName: 'Asistente Virtual',
      isBot: true,
      timestamp: '2023-04-20T10:50:00'
    },
    {
      id: 'msg3_5',
      conversationId: 'conv3',
      content: 'Quiero agendar una cita para ver la propiedad.',
      direction: 'inbound',
      channel: 'whatsapp',
      status: 'read',
      senderId: 'contact3',
      senderName: 'Roberto García',
      timestamp: '2023-04-20T11:20:00'
    }
  ]
};

const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'resolved', 'unresolved'
  
  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      const messages = MOCK_MESSAGES[selectedConversation.id] || [];
      setCurrentMessages(messages);
      
      // Establecer el contacto actual
      const contact = MOCK_CONTACTS[selectedConversation.contactId];
      setCurrentContact(contact);
      
      // Marcar como leído si hay mensajes no leídos
      if (selectedConversation.unreadCount > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    }
  }, [selectedConversation]);
  
  const handleSendMessage = async (content: string, templateId?: string) => {
    if (!selectedConversation || !currentContact) return;
    
    try {
      // Simular envío de mensaje
      const newMessageId = `msg_${Date.now()}`;
      
      // Crear nuevo mensaje local
      const newMessage: Message = {
        id: newMessageId,
        conversationId: selectedConversation.id,
        content: content || 'Mensaje de plantilla enviado',
        direction: 'outbound',
        channel: selectedConversation.channel,
        status: 'pending',
        senderId: 'user1',
        timestamp: new Date(),
      };
      
      // Actualizar la UI inmediatamente
      setCurrentMessages(prev => [...prev, newMessage]);
      
      // Si es un mensaje de plantilla, usar el servicio de WhatsApp
      if (templateId) {
        await whatsappService.sendMessage({
          contactId: currentContact.id,
          message: '',
          templateId
        });
      } else {
        // Envío de mensaje normal
        // Aquí iría la lógica para enviar el mensaje al canal correspondiente
      }
      
      // Actualizar el estado del mensaje a enviado después de un tiempo
      setTimeout(() => {
        setCurrentMessages(prev => 
          prev.map(msg => 
            msg.id === newMessageId ? { ...msg, status: 'sent' } : msg
          )
        );
        
        // Actualizar la conversación con el último mensaje
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id ? { 
              ...conv, 
              lastMessage: content || 'Mensaje de plantilla enviado',
              lastMessageAt: new Date()
            } : conv
          )
        );
      }, 1000);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Actualizar el estado del mensaje a fallido
      setCurrentMessages(prev => 
        prev.map(msg => 
          msg.id === `msg_${Date.now()}` ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    // Aquí iría la lógica para filtrar las conversaciones
  };
  
  const handleSearchConversations = (query: string) => {
    if (!query.trim()) {
      // Si la búsqueda está vacía, mostrar todas las conversaciones
      setConversations(MOCK_CONVERSATIONS);
      return;
    }
    
    // Filtrar conversaciones por nombre de contacto o último mensaje
    const filtered = MOCK_CONVERSATIONS.filter(
      conv => 
        conv.contactName.toLowerCase().includes(query.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query.toLowerCase()))
    );
    
    setConversations(filtered);
  };
  
  const handleSyncContacts = async () => {
    try {
      const result = await whatsappService.syncContacts();
      alert(`Sincronización completada. ${result.synced} contactos sincronizados, ${result.failed} fallidos.`);
    } catch (error) {
      console.error('Error al sincronizar contactos:', error);
      alert('Error al sincronizar contactos con WhatsApp');
    }
  };
  
  const handleAttachFile = (file: File) => {
    console.log('Archivo adjunto:', file);
    // Aquí iría la lógica para adjuntar archivos
  };
  
  const handleTransferChat = () => {
    console.log('Transferir chat a otro agente');
    // Aquí iría la lógica para transferir el chat
  };
  
  const handleCreateChat = () => {
    console.log('Crear nueva conversación');
    // Aquí iría la lógica para crear una nueva conversación
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader 
        title="Conversaciones" 
        subtitle="Gestiona tus conversaciones de WhatsApp, Email y Chat"
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleSyncContacts}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Sincronizar Contactos
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => handleFilterChange(filter === 'all' ? 'unread' : 'all')}
            >
              <AdjustmentsVerticalIcon className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'Mostrar No Leídos' : 'Mostrar Todos'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateChat}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Conversación
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Panel izquierdo con lista de conversaciones */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="border-b p-3 bg-gray-50">
            <div className="flex space-x-2">
              <button 
                className={`flex-1 py-2 rounded-md text-center text-sm font-medium ${
                  filter !== 'resolved' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleFilterChange('all')}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
                Activas
              </button>
              <button 
                className={`flex-1 py-2 rounded-md text-center text-sm font-medium ${
                  filter === 'resolved' ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleFilterChange('resolved')}
              >
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Resueltas
              </button>
            </div>
          </div>
          <ConversationList 
            conversations={conversations}
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={setSelectedConversation}
            onSearch={handleSearchConversations}
          />
        </div>
        
        {/* Panel derecho con la interfaz de chat */}
        <div className="lg:col-span-2 h-full">
          {selectedConversation && currentContact ? (
            <ChatInterface 
              conversation={selectedConversation}
              contact={currentContact}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onAttachFile={handleAttachFile}
              onTransferChat={handleTransferChat}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg shadow">
              <div className="text-center p-6">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ninguna conversación seleccionada</h3>
                <p className="text-gray-500">
                  Selecciona una conversación de la lista para ver sus mensajes o inicia una nueva conversación.
                </p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCreateChat}
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Nueva Conversación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;