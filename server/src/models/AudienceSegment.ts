import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para criterios de segmento
export interface SegmentCriterion {
  field: string;
  operator: string;
  value: any;
}

// Interfaz para segmento de audiencia
export interface IAudienceSegment extends Document {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  criteria: SegmentCriterion[];
  count: number;
  lastUpdated: Date;
  createdAt: Date;
  isSystem: boolean;
}

// Esquema para segmento de audiencia
const AudienceSegmentSchema = new Schema<IAudienceSegment>({
  name: {
    type: String,
    required: [true, 'El nombre del segmento es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'La organización es obligatoria']
  },
  criteria: [{
    field: {
      type: String,
      required: [true, 'El campo es obligatorio']
    },
    operator: {
      type: String,
      required: [true, 'El operador es obligatorio'],
      enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'exists', 'notExists', 'inList', 'notInList', 'between']
    },
    value: {
      type: Schema.Types.Mixed,
      required: function(this: SegmentCriterion) {
        return !['exists', 'notExists'].includes(this.operator);
      }
    }
  }],
  count: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isSystem: {
    type: Boolean,
    default: false
  }
});

// Método para actualizar el contador de contactos
AudienceSegmentSchema.methods.updateCount = async function() {
  // En una implementación real, aquí se ejecutaría una consulta para contar contactos
  // Por ahora, simplemente actualizamos la fecha
  this.lastUpdated = new Date();
  await this.save();
};

// Crear y exportar el modelo
const AudienceSegment = mongoose.model<IAudienceSegment>('AudienceSegment', AudienceSegmentSchema);
export default AudienceSegment;