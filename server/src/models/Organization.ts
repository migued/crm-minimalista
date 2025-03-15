import mongoose, { Document, Schema } from 'mongoose';

export enum IndustryType {
  EDUCATION = 'education',
  REAL_ESTATE = 'real_estate',
  GENERAL = 'general'
}

export interface IOrganization extends Document {
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

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    industry: { 
      type: String, 
      enum: Object.values(IndustryType),
      default: IndustryType.GENERAL,
      required: true 
    },
    logoUrl: { 
      type: String 
    },
    primaryColor: { 
      type: String, 
      default: '#3B82F6' // Azul por defecto
    },
    secondaryColor: { 
      type: String, 
      default: '#10B981' // Verde por defecto
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    settings: {
      whatsappIntegration: { type: Boolean, default: false },
      emailCampaigns: { type: Boolean, default: false },
      aiChatbots: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);