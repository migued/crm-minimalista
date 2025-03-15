import mongoose, { Document, Schema } from 'mongoose';

// Enums para tipos y estados de campaña
export enum CampaignType {
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  ANNOUNCEMENT = 'announcement',
  FOLLOW_UP = 'follow_up',
  AUTOMATED = 'automated',
  SURVEY = 'survey'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

// Interfaz para programación de campaña
export interface CampaignSchedule {
  sendDate: Date;
  sendTime?: string;
  timezone?: string;
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurringInterval?: number;
  endDate?: Date;
}

// Interfaz para estadísticas de campaña
export interface CampaignStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}

// Interfaz para campaña de email
export interface IEmailCampaign extends Document {
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  subject: string;
  content: string;
  templateId?: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  segmentName?: string;
  schedule?: CampaignSchedule;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  stats?: CampaignStats;
  aiGenerated?: boolean;
  aiAgentId?: mongoose.Types.ObjectId;
}

// Esquema para campaña de email
const EmailCampaignSchema = new Schema<IEmailCampaign>({
  name: {
    type: String,
    required: [true, 'El nombre de la campaña es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(CampaignType),
    default: CampaignType.NEWSLETTER
  },
  status: {
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT
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
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  segmentId: {
    type: Schema.Types.ObjectId,
    ref: 'AudienceSegment',
    required: [true, 'El segmento de audiencia es obligatorio']
  },
  segmentName: {
    type: String
  },
  schedule: {
    sendDate: Date,
    sendTime: String,
    timezone: {
      type: String,
      default: 'America/Mexico_City'
    },
    recurringType: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    recurringInterval: {
      type: Number,
      default: 1
    },
    endDate: Date
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'La organización es obligatoria']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  stats: {
    totalSent: Number,
    delivered: Number,
    opened: Number,
    clicked: Number,
    bounced: Number,
    unsubscribed: Number,
    openRate: Number,
    clickRate: Number
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'AIAgent'
  }
});

// Crear y exportar el modelo
export const EmailCampaign = mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);
export default EmailCampaign;