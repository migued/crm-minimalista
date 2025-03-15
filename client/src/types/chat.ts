// Tipos para el módulo de chat/WhatsApp

export type MessageDirection = 'inbound' | 'outbound';
export type MessageChannel = 'whatsapp' | 'email' | 'web_chat' | 'sms';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: MessageDirection;
  channel: MessageChannel;
  status: MessageStatus;
  senderId: string | 'system' | 'bot';
  senderName?: string;
  timestamp: string | Date;
  attachments?: Attachment[];
  isBot?: boolean;
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  size?: number;
  thumbnail?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhoto?: string;
  channel: MessageChannel;
  lastMessage?: string;
  lastMessageAt: string | Date;
  unreadCount: number;
  isResolved: boolean;
  assignedTo?: string;
  tags?: string[];
  isAiHandled?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  whatsappId?: string;
  lastSeen?: string | Date;
  isWhatsAppVerified: boolean;
  notes?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  components: WhatsAppTemplateComponent[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  text?: string;
  parameters?: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: {
    link: string;
  };
  document?: {
    link: string;
  };
  video?: {
    link: string;
  };
}