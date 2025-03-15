import mongoose, { Document, Schema } from 'mongoose';
import { MessageChannel } from './Conversation';

export enum TemplateCategory {
  WELCOME = 'welcome',
  FOLLOW_UP = 'follow_up',
  ABANDONED_CART = 'abandoned_cart',
  APPOINTMENT = 'appointment',
  PAYMENT = 'payment',
  SUPPORT = 'support',
  OTHER = 'other'
}

export interface IMessageTemplate extends Document {
  name: string;
  description?: string;
  content: string;
  channel: MessageChannel;
  category: TemplateCategory;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  variables?: string[];
  isActive: boolean;
  whatsappTemplateId?: string; // Para plantillas aprobadas por WhatsApp
  createdAt: Date;
  updatedAt: Date;
}

const MessageTemplateSchema = new Schema<IMessageTemplate>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String 
    },
    content: { 
      type: String, 
      required: true 
    },
    channel: { 
      type: String, 
      enum: Object.values(MessageChannel),
      required: true 
    },
    category: { 
      type: String, 
      enum: Object.values(TemplateCategory),
      default: TemplateCategory.OTHER,
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    isApproved: { 
      type: Boolean, 
      default: false 
    },
    approvedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    variables: [{ 
      type: String 
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    whatsappTemplateId: { 
      type: String 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Extraer variables de la plantilla antes de guardar (formato {{variable}})
MessageTemplateSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const variableRegex = /{{([^{}]+)}}/g;
    const matches = [...this.content.matchAll(variableRegex)];
    
    // Extraer los nombres de las variables
    this.variables = matches
      .map(match => match[1].trim())
      .filter((value, index, self) => self.indexOf(value) === index); // Remover duplicados
  }
  next();
});

// Índices para búsquedas rápidas
MessageTemplateSchema.index({ organizationId: 1 });
MessageTemplateSchema.index({ channel: 1 });
MessageTemplateSchema.index({ category: 1 });
MessageTemplateSchema.index({ name: 'text', description: 'text', content: 'text' });

export default mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema);