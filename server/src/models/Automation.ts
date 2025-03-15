import mongoose, { Document, Schema } from 'mongoose';

// Tipos de eventos que pueden desencadenar una automatización
export enum TriggerEventType {
  NEW_CONTACT = 'new_contact',                 // Cuando se crea un nuevo contacto
  CONTACT_UPDATED = 'contact_updated',         // Cuando se actualiza un contacto
  NEW_MESSAGE = 'new_message',                 // Cuando se recibe un nuevo mensaje
  PIPELINE_STAGE_CHANGED = 'pipeline_changed', // Cuando un contacto cambia de etapa en el pipeline
  FORM_SUBMITTED = 'form_submitted',           // Cuando se envía un formulario
  TAG_ADDED = 'tag_added',                     // Cuando se añade una etiqueta a un contacto
  TAG_REMOVED = 'tag_removed',                 // Cuando se elimina una etiqueta de un contacto
  SCHEDULED = 'scheduled',                     // Evento programado (ej. cada día a las 9 AM)
  CUSTOM = 'custom'                            // Evento personalizado
}

// Tipos de acciones que puede realizar una automatización
export enum ActionType {
  SEND_MESSAGE = 'send_message',           // Enviar un mensaje (WhatsApp, Email, SMS)
  ASSIGN_AGENT = 'assign_agent',           // Asignar un agente a un contacto
  UPDATE_CONTACT = 'update_contact',       // Actualizar información de contacto
  ADD_TAG = 'add_tag',                     // Añadir etiqueta
  REMOVE_TAG = 'remove_tag',               // Eliminar etiqueta
  MOVE_PIPELINE = 'move_pipeline',         // Mover a una etapa del pipeline
  WAIT = 'wait',                           // Esperar X tiempo antes de la siguiente acción
  CONDITIONAL = 'conditional',             // Ejecutar acciones basadas en condiciones
  RUN_AI_AGENT = 'run_ai_agent',           // Ejecutar un agente de IA
  WEBHOOK = 'webhook',                     // Llamar a un webhook externo
  CUSTOM_FUNCTION = 'custom_function'      // Ejecutar una función personalizada
}

// Definición del trigger
export interface ITrigger extends Document {
  type: TriggerEventType;
  conditions?: {
    field?: string;
    operator?: string;
    value?: any;
    channel?: string[];
    tags?: string[];
  };
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    startDate?: Date;
    endDate?: Date;
  };
}

// Definición de la acción
export interface IAction extends Document {
  type: ActionType;
  name: string;
  order: number;
  config: {
    [key: string]: any;
  };
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
}

// Definición de la automatización
export interface IAutomation extends Document {
  name: string;
  description?: string;
  organizationId: mongoose.Types.ObjectId;
  isActive: boolean;
  trigger: ITrigger;
  actions: IAction[];
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
}

// Esquema para el trigger
const TriggerSchema = new Schema<ITrigger>(
  {
    type: {
      type: String,
      enum: Object.values(TriggerEventType),
      required: true
    },
    conditions: {
      field: { type: String },
      operator: { type: String },
      value: { type: Schema.Types.Mixed },
      channel: [{ type: String }],
      tags: [{ type: String }]
    },
    schedule: {
      frequency: { 
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly']
      },
      time: { type: String },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
      dayOfMonth: { type: Number, min: 1, max: 31 },
      startDate: { type: Date },
      endDate: { type: Date }
    }
  }
);

// Esquema para la acción
const ActionSchema = new Schema<IAction>(
  {
    type: {
      type: String,
      enum: Object.values(ActionType),
      required: true
    },
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    config: {
      type: Schema.Types.Mixed,
      required: true
    },
    conditions: [{
      field: { type: String },
      operator: { type: String },
      value: { type: Schema.Types.Mixed }
    }]
  }
);

// Esquema principal de Automatización
const AutomationSchema = new Schema<IAutomation>(
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
    isActive: {
      type: Boolean,
      default: true
    },
    trigger: {
      type: TriggerSchema,
      required: true
    },
    actions: {
      type: [ActionSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'Al menos una acción es requerida']
    },
    lastExecutedAt: {
      type: Date
    },
    totalExecutions: {
      type: Number,
      default: 0
    },
    successfulExecutions: {
      type: Number,
      default: 0
    },
    failedExecutions: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsqueda eficiente
AutomationSchema.index({ organizationId: 1 });
AutomationSchema.index({ isActive: 1 });
AutomationSchema.index({ 'trigger.type': 1 });
AutomationSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IAutomation>('Automation', AutomationSchema);