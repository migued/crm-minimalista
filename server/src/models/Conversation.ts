import mongoose, { Document, Schema } from 'mongoose';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

export enum MessageChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  WEB_CHAT = 'web_chat',
  SMS = 'sms'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending'
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  content: string;
  direction: MessageDirection;
  channel: MessageChannel;
  status: MessageStatus;
  senderId: mongoose.Types.ObjectId | 'system' | 'bot';
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  attachments?: {
    url: string;
    type: string;
    name: string;
    size?: number;
  }[];
  metadata?: Record<string, any>;
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  channel: MessageChannel;
  lastMessageAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  isAiHandled: boolean;
  aiAgentId?: mongoose.Types.ObjectId;
  threadId?: string; // Para referencias a hilos externos (ej. WhatsApp)
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Conversation', 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    direction: { 
      type: String, 
      enum: Object.values(MessageDirection),
      required: true 
    },
    channel: { 
      type: String, 
      enum: Object.values(MessageChannel),
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(MessageStatus),
      default: MessageStatus.PENDING 
    },
    senderId: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    deliveredAt: { 
      type: Date 
    },
    readAt: { 
      type: Date 
    },
    attachments: [{
      url: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number }
    }],
    metadata: { 
      type: Schema.Types.Mixed 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const ConversationSchema = new Schema<IConversation>(
  {
    contactId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Contact', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    channel: { 
      type: String, 
      enum: Object.values(MessageChannel),
      required: true 
    },
    lastMessageAt: { 
      type: Date, 
      default: Date.now 
    },
    isResolved: { 
      type: Boolean, 
      default: false 
    },
    resolvedAt: { 
      type: Date 
    },
    lastMessage: { 
      type: String 
    },
    isAiHandled: { 
      type: Boolean, 
      default: false 
    },
    aiAgentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'AIAgent' 
    },
    threadId: { 
      type: String 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsquedas rápidas
MessageSchema.index({ conversationId: 1, createdAt: -1 });
ConversationSchema.index({ contactId: 1 });
ConversationSchema.index({ organizationId: 1 });
ConversationSchema.index({ assignedTo: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ isResolved: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);