// Tipos para automatizaciones

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
  CUSTOM_FUNCTION = 'custom_function',     // Ejecutar una función personalizada
  CREATE_TASK = 'create_task',             // Crear una tarea para un agente o equipo
  SEND_EMAIL_CAMPAIGN = 'send_email_campaign', // Enviar una campaña de email
  SCHEDULE_MEETING = 'schedule_meeting',   // Programar una reunión 
  CREATE_DEAL = 'create_deal',             // Crear una oportunidad/negocio
  UPDATE_DEAL = 'update_deal',             // Actualizar una oportunidad/negocio
  GENERATE_DOCUMENT = 'generate_document', // Generar un documento (PDF, contrato, etc.)
  LOG_ACTIVITY = 'log_activity',           // Registrar una actividad en el historial
  SCORE_LEAD = 'score_lead',               // Puntuar un lead según criterios
  SEGMENT_CONTACT = 'segment_contact',     // Añadir/quitar contacto de segmento
  ENRICH_CONTACT = 'enrich_contact'        // Enriquecer datos de contacto con fuentes externas
}

// Operadores de condición disponibles
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists'
}

// Interfaces

// Definición de condición de trigger
export interface TriggerCondition {
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  channel?: string[];
  tags?: string[];
}

// Definición de una programación
export interface TriggerSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  startDate?: Date;
  endDate?: Date;
}

// Definición de trigger
export interface Trigger {
  type: TriggerEventType;
  conditions?: TriggerCondition;
  schedule?: TriggerSchedule;
}

// Definición de una condición para una acción
export interface ActionCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

// Definición de una acción
export interface Action {
  id: string;
  type: ActionType;
  name: string;
  order: number;
  config: {
    [key: string]: any;
  };
  conditions?: ActionCondition[];
}

// Definición de un paso de workflow
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  actions: Action[];
  nextStepId?: string;
  isEndStep?: boolean;
}

// Tipos de conectores de flujo para el modo visual
export enum WorkflowConnectionType {
  SEQUENCE = 'sequence',      // Secuencia lineal al siguiente paso
  BRANCH = 'branch',          // Bifurcación basada en condiciones
  PARALLEL = 'parallel',      // Ejecutar pasos en paralelo
  LOOP = 'loop',              // Repetir un paso hasta cumplir condición
  WAIT_UNTIL = 'wait_until'   // Esperar hasta cumplir condición
}

// Definición de un conector de flujo
export interface WorkflowConnection {
  id: string;
  type: WorkflowConnectionType;
  sourceStepId: string;
  targetStepId: string;
  conditions?: ActionCondition[];
  config?: {
    [key: string]: any;
  };
}

// Definición completa de una automatización
export interface Automation {
  id?: string;
  name: string;
  description?: string;
  organizationId: string;
  isActive: boolean;
  trigger: Trigger;
  actions: Action[];                  // Acciones para compatibilidad con versión básica
  workflowEnabled?: boolean;          // Si está habilitado el modo workflow avanzado
  workflowSteps?: WorkflowStep[];     // Pasos del workflow
  workflowConnections?: WorkflowConnection[]; // Conexiones del workflow
  initialStepId?: string;             // ID del primer paso del workflow
  createdAt?: Date;
  updatedAt?: Date;
  lastExecutedAt?: Date;
  totalExecutions?: number;
  successfulExecutions?: number;
  failedExecutions?: number;
}