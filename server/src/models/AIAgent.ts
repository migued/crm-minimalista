import mongoose, { Document, Schema } from 'mongoose';

export enum AgentType {
  CHATBOT = 'chatbot',
  CLASSIFIER = 'classifier',
  SUMMARIZER = 'summarizer',
  TRANSLATOR = 'translator'
}

export interface IAgentTemplate {
  name: string;
  systemPrompt: string;
  description: string;
  industry: string;
}

export interface IAIAgent extends Document {
  name: string;
  type: AgentType;
  organizationId: mongoose.Types.ObjectId;
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
  trainingData?: {
    conversations: mongoose.Types.ObjectId[];
    documents: mongoose.Types.ObjectId[];
    lastTrainedAt?: Date;
  };
}

const AIAgentSchema = new Schema<IAIAgent>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    type: { 
      type: String, 
      enum: Object.values(AgentType),
      default: AgentType.CHATBOT,
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    systemPrompt: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    model: { 
      type: String, 
      default: 'gpt-4o', 
      required: true 
    },
    temperature: { 
      type: Number, 
      default: 0.7, 
      min: 0, 
      max: 2 
    },
    maxTokens: { 
      type: Number, 
      default: 1024 
    },
    triggerConditions: {
      keywords: [{ type: String }],
      timeRanges: [{ type: String }],
      channels: [{ type: String }],
      contactTags: [{ type: String }]
    },
    handoffConditions: {
      sentimentThreshold: { type: Number },
      specificPhrases: [{ type: String }],
      afterNMessages: { type: Number },
      onUserRequest: { type: Boolean, default: true }
    },
    trainingData: {
      conversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
      documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
      lastTrainedAt: { type: Date }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Colección de plantillas predefinidas para chatbots por industria
const AgentTemplateSchema = new Schema<IAgentTemplate>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    systemPrompt: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    industry: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsquedas rápidas
AIAgentSchema.index({ organizationId: 1 });
AIAgentSchema.index({ name: 'text', description: 'text' });
AIAgentSchema.index({ isActive: 1 });
AgentTemplateSchema.index({ industry: 1 });
AgentTemplateSchema.index({ name: 'text', description: 'text' });

export const AIAgent = mongoose.model<IAIAgent>('AIAgent', AIAgentSchema);
export const AgentTemplate = mongoose.model<IAgentTemplate>('AgentTemplate', AgentTemplateSchema);