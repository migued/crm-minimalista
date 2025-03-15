import mongoose, { Document, Schema } from 'mongoose';

export interface IPipelineStage extends Document {
  name: string;
  description?: string;
  order: number;
  color: string;
  isArchived: boolean;
  pipelineId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  automations: {
    triggerType: 'enter_stage' | 'exit_stage' | 'time_in_stage';
    timeDelay?: number; // En horas, para triggerType 'time_in_stage'
    actions: {
      type: 'send_email' | 'send_whatsapp' | 'assign_user' | 'add_tag' | 'move_stage';
      templateId?: mongoose.Types.ObjectId; // Para acciones de tipo send_email/whatsapp
      userId?: mongoose.Types.ObjectId; // Para acciones de tipo assign_user
      targetStageId?: mongoose.Types.ObjectId; // Para acciones de tipo move_stage
      tagName?: string; // Para acciones de tipo add_tag
    }[];
    isActive: boolean;
  }[];
}

export interface IPipeline extends Document {
  name: string;
  description?: string;
  organizationId: mongoose.Types.ObjectId;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineStageSchema = new Schema<IPipelineStage>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String 
    },
    order: { 
      type: Number, 
      required: true 
    },
    color: { 
      type: String, 
      default: '#3B82F6' // Azul por defecto
    },
    isArchived: { 
      type: Boolean, 
      default: false 
    },
    pipelineId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Pipeline', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    automations: [{
      triggerType: { 
        type: String, 
        enum: ['enter_stage', 'exit_stage', 'time_in_stage'],
        required: true 
      },
      timeDelay: { 
        type: Number // En horas
      },
      actions: [{
        type: { 
          type: String, 
          enum: ['send_email', 'send_whatsapp', 'assign_user', 'add_tag', 'move_stage'],
          required: true 
        },
        templateId: { 
          type: Schema.Types.ObjectId, 
          ref: 'MessageTemplate' 
        },
        userId: { 
          type: Schema.Types.ObjectId, 
          ref: 'User' 
        },
        targetStageId: { 
          type: Schema.Types.ObjectId, 
          ref: 'PipelineStage' 
        },
        tagName: { 
          type: String 
        }
      }],
      isActive: { 
        type: Boolean, 
        default: true 
      }
    }]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const PipelineSchema = new Schema<IPipeline>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    isDefault: { 
      type: Boolean, 
      default: false 
    },
    isArchived: { 
      type: Boolean, 
      default: false 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsquedas rápidas
PipelineStageSchema.index({ pipelineId: 1 });
PipelineStageSchema.index({ organizationId: 1 });
PipelineSchema.index({ organizationId: 1 });

export const PipelineStage = mongoose.model<IPipelineStage>('PipelineStage', PipelineStageSchema);
export const Pipeline = mongoose.model<IPipeline>('Pipeline', PipelineSchema);