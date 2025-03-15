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
export interface EmailCampaign {
  id?: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  subject: string;
  content: string;
  templateId?: string;
  segmentId: string;
  segmentName?: string;
  schedule?: CampaignSchedule;
  organizationId: string;
  createdAt?: Date;
  updatedAt?: Date;
  sentAt?: Date;
  stats?: CampaignStats;
  aiGenerated?: boolean;
  aiAgentId?: string;
}

// Interfaz para plantilla de email
export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  content: string;
  thumbnailUrl?: string;
  category: string;
  organizationId?: string;
  isGlobal: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para criterios de segmento
export interface SegmentCriterion {
  field: string;
  operator: string;
  value: any;
}

// Interfaz para segmento de audiencia
export interface AudienceSegment {
  id?: string;
  name: string;
  description: string;
  organizationId: string;
  criteria: SegmentCriterion[];
  count: number;
  lastUpdated?: Date;
  createdAt?: Date;
  isSystem: boolean;
}