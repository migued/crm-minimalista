// Tipos compartidos entre cliente y servidor

// Enums
export enum IndustryType {
  EDUCATION = 'education',
  REAL_ESTATE = 'real_estate',
  GENERAL = 'general'
}

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  SUPERVISOR = 'supervisor'
}

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

export enum AgentType {
  CHATBOT = 'chatbot',
  CLASSIFIER = 'classifier',
  SUMMARIZER = 'summarizer',
  TRANSLATOR = 'translator'
}

export enum TemplateCategory {
  WELCOME = 'welcome',
  FOLLOW_UP = 'follow_up',
  ABANDONED_CART = 'abandoned_cart',
  APPOINTMENT = 'appointment',
  PAYMENT = 'payment',
  SUPPORT = 'support',
  OTHER = 'other'
}

// Interfaces
export interface Organization {
  id: string;
  name: string;
  industry: IndustryType;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: {
    whatsappIntegration: boolean;
    emailCampaigns: boolean;
    aiChatbots: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canManagePipelines: boolean;
    canManageCampaigns: boolean;
    canManageWhatsApp: boolean;
    canManageContacts: boolean;
  };
}

export interface CustomField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsappId?: string;
  organizationId: string;
  tags: string[];
  assignedTo?: string;
  pipelineStage?: string;
  customFields: CustomField[];
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  source?: string;
  isActive: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
  isArchived: boolean;
  pipelineId: string;
  organizationId: string;
  automations: PipelineAutomation[];
}

export interface PipelineAutomation {
  triggerType: 'enter_stage' | 'exit_stage' | 'time_in_stage';
  timeDelay?: number;
  actions: PipelineAction[];
  isActive: boolean;
}

export interface PipelineAction {
  type: 'send_email' | 'send_whatsapp' | 'assign_user' | 'add_tag' | 'move_stage';
  templateId?: string;
  userId?: string;
  targetStageId?: string;
  tagName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: MessageDirection;
  channel: MessageChannel;
  status: MessageStatus;
  senderId: string | 'system' | 'bot';
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

export interface Conversation {
  id: string;
  contactId: string;
  organizationId: string;
  assignedTo?: string;
  channel: MessageChannel;
  lastMessageAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  isAiHandled: boolean;
  aiAgentId?: string;
  threadId?: string;
  messages?: Message[];
  contact?: Contact;
}

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  organizationId: string;
  systemPrompt: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  model: string;
  temperature: number;
  maxTokens: number;
  triggerConditions?: {
    keywords: string[];
    timeRanges?: string[];
    channels: string[];
    contactTags?: string[];
  };
  handoffConditions?: {
    sentimentThreshold?: number;
    specificPhrases?: string[];
    afterNMessages?: number;
    onUserRequest: boolean;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  channel: MessageChannel;
  category: TemplateCategory;
  organizationId: string;
  createdBy: string;
  isApproved: boolean;
  approvedBy?: string;
  variables?: string[];
  isActive: boolean;
  whatsappTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Tipos para autenticación
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterOrganizationData {
  organizationName: string;
  industry: IndustryType;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}