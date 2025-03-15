import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[]; // Para campos de tipo select
}

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsappId?: string;
  organizationId: mongoose.Types.ObjectId;
  tags: string[];
  assignedTo?: mongoose.Types.ObjectId;
  pipelineStage?: mongoose.Types.ObjectId;
  customFields: ICustomField[];
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  source?: string;
  isActive: boolean;
}

const ContactSchema = new Schema<IContact>(
  {
    firstName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      trim: true, 
      lowercase: true 
    },
    phone: { 
      type: String 
    },
    whatsappId: { 
      type: String 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    tags: [{ 
      type: String 
    }],
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    pipelineStage: { 
      type: Schema.Types.ObjectId, 
      ref: 'PipelineStage' 
    },
    customFields: [{
      key: { type: String, required: true },
      label: { type: String, required: true },
      value: { type: Schema.Types.Mixed },
      type: { 
        type: String, 
        enum: ['text', 'number', 'date', 'boolean', 'select'],
        default: 'text'
      },
      options: [{ type: String }]
    }],
    lastContactedAt: { 
      type: Date 
    },
    source: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsquedas rápidas
ContactSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phone: 'text' });
ContactSchema.index({ organizationId: 1 });
ContactSchema.index({ tags: 1 });
ContactSchema.index({ assignedTo: 1 });
ContactSchema.index({ pipelineStage: 1 });

export default mongoose.model<IContact>('Contact', ContactSchema);