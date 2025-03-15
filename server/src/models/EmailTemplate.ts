import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para plantilla de email
export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  content: string;
  thumbnailUrl?: string;
  category: string;
  organizationId: mongoose.Types.ObjectId;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para plantilla de email
const EmailTemplateSchema = new Schema<IEmailTemplate>({
  name: {
    type: String,
    required: [true, 'El nombre de la plantilla es obligatorio'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'El asunto del email es obligatorio'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'El contenido del email es obligatorio']
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'La categoría de la plantilla es obligatoria'],
    enum: ['newsletter', 'promotional', 'announcement', 'follow_up', 'survey', 'education', 'real_estate', 'general'],
    default: 'general'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: function(this: IEmailTemplate) {
      return !this.isGlobal;
    }
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Crear y exportar el modelo
const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
export default EmailTemplate;