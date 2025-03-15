import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  PencilIcon, 
  TagIcon, 
  ClockIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  StarIcon,
  UsersIcon,
  MagnifyingGlassCircleIcon
} from '@heroicons/react/24/outline';
import { Action, ActionType } from './types';

interface AutomationActionCardProps {
  action: Action;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const AutomationActionCard: React.FC<AutomationActionCardProps> = ({
  action,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);

  // Obtener icono según el tipo de acción
  const getActionIcon = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return <PaperAirplaneIcon className="h-5 w-5" />;
      case ActionType.ASSIGN_AGENT:
        return <UserIcon className="h-5 w-5" />;
      case ActionType.UPDATE_CONTACT:
        return <PencilIcon className="h-5 w-5" />;
      case ActionType.ADD_TAG:
      case ActionType.REMOVE_TAG:
        return <TagIcon className="h-5 w-5" />;
      case ActionType.MOVE_PIPELINE:
        return <ArrowPathIcon className="h-5 w-5" />;
      case ActionType.WAIT:
        return <ClockIcon className="h-5 w-5" />;
      case ActionType.RUN_AI_AGENT:
        return <SparklesIcon className="h-5 w-5" />;
      case ActionType.WEBHOOK:
        return <GlobeAltIcon className="h-5 w-5" />;
      case ActionType.CREATE_TASK:
        return <CheckCircleIcon className="h-5 w-5" />;
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return <EnvelopeIcon className="h-5 w-5" />;
      case ActionType.SCHEDULE_MEETING:
        return <CalendarDaysIcon className="h-5 w-5" />;
      case ActionType.CREATE_DEAL:
      case ActionType.UPDATE_DEAL:
        return <BanknotesIcon className="h-5 w-5" />;
      case ActionType.GENERATE_DOCUMENT:
        return <DocumentTextIcon className="h-5 w-5" />;
      case ActionType.LOG_ACTIVITY:
        return <ClipboardDocumentIcon className="h-5 w-5" />;
      case ActionType.SCORE_LEAD:
        return <StarIcon className="h-5 w-5" />;
      case ActionType.SEGMENT_CONTACT:
        return <UsersIcon className="h-5 w-5" />;
      case ActionType.ENRICH_CONTACT:
        return <MagnifyingGlassCircleIcon className="h-5 w-5" />;
      default:
        return <PencilIcon className="h-5 w-5" />;
    }
  };

  // Obtener el color de fondo según el tipo de acción
  const getBackgroundColor = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return 'bg-blue-50 border-blue-200';
      case ActionType.ASSIGN_AGENT:
        return 'bg-purple-50 border-purple-200';
      case ActionType.UPDATE_CONTACT:
        return 'bg-green-50 border-green-200';
      case ActionType.ADD_TAG:
        return 'bg-yellow-50 border-yellow-200';
      case ActionType.REMOVE_TAG:
        return 'bg-orange-50 border-orange-200';
      case ActionType.MOVE_PIPELINE:
        return 'bg-indigo-50 border-indigo-200';
      case ActionType.WAIT:
        return 'bg-gray-50 border-gray-200';
      case ActionType.RUN_AI_AGENT:
        return 'bg-pink-50 border-pink-200';
      case ActionType.WEBHOOK:
        return 'bg-cyan-50 border-cyan-200';
      case ActionType.CREATE_TASK:
        return 'bg-emerald-50 border-emerald-200';
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return 'bg-sky-50 border-sky-200';
      case ActionType.SCHEDULE_MEETING:
        return 'bg-violet-50 border-violet-200';
      case ActionType.CREATE_DEAL:
      case ActionType.UPDATE_DEAL:
        return 'bg-amber-50 border-amber-200';
      case ActionType.GENERATE_DOCUMENT:
        return 'bg-teal-50 border-teal-200';
      case ActionType.LOG_ACTIVITY:
        return 'bg-slate-50 border-slate-200';
      case ActionType.SCORE_LEAD:
        return 'bg-rose-50 border-rose-200';
      case ActionType.SEGMENT_CONTACT:
        return 'bg-lime-50 border-lime-200';
      case ActionType.ENRICH_CONTACT:
        return 'bg-fuchsia-50 border-fuchsia-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Obtener el color del icono según el tipo de acción
  const getIconColor = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return 'text-blue-500';
      case ActionType.ASSIGN_AGENT:
        return 'text-purple-500';
      case ActionType.UPDATE_CONTACT:
        return 'text-green-500';
      case ActionType.ADD_TAG:
        return 'text-yellow-500';
      case ActionType.REMOVE_TAG:
        return 'text-orange-500';
      case ActionType.MOVE_PIPELINE:
        return 'text-indigo-500';
      case ActionType.WAIT:
        return 'text-gray-500';
      case ActionType.RUN_AI_AGENT:
        return 'text-pink-500';
      case ActionType.WEBHOOK:
        return 'text-cyan-500';
      case ActionType.CREATE_TASK:
        return 'text-emerald-500';
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return 'text-sky-500';
      case ActionType.SCHEDULE_MEETING:
        return 'text-violet-500';
      case ActionType.CREATE_DEAL:
      case ActionType.UPDATE_DEAL:
        return 'text-amber-500';
      case ActionType.GENERATE_DOCUMENT:
        return 'text-teal-500';
      case ActionType.LOG_ACTIVITY:
        return 'text-slate-500';
      case ActionType.SCORE_LEAD:
        return 'text-rose-500';
      case ActionType.SEGMENT_CONTACT:
        return 'text-lime-500';
      case ActionType.ENRICH_CONTACT:
        return 'text-fuchsia-500';
      default:
        return 'text-gray-500';
    }
  };

  // Obtener nombre legible del tipo de acción
  const getActionTypeName = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return 'Enviar Mensaje';
      case ActionType.ASSIGN_AGENT:
        return 'Asignar Agente';
      case ActionType.UPDATE_CONTACT:
        return 'Actualizar Contacto';
      case ActionType.ADD_TAG:
        return 'Añadir Etiqueta';
      case ActionType.REMOVE_TAG:
        return 'Eliminar Etiqueta';
      case ActionType.MOVE_PIPELINE:
        return 'Mover en Pipeline';
      case ActionType.WAIT:
        return 'Esperar';
      case ActionType.CONDITIONAL:
        return 'Condición';
      case ActionType.RUN_AI_AGENT:
        return 'Ejecutar Agente IA';
      case ActionType.WEBHOOK:
        return 'Llamar Webhook';
      case ActionType.CUSTOM_FUNCTION:
        return 'Función Personalizada';
      case ActionType.CREATE_TASK:
        return 'Crear Tarea';
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return 'Enviar Campaña Email';
      case ActionType.SCHEDULE_MEETING:
        return 'Programar Reunión';
      case ActionType.CREATE_DEAL:
        return 'Crear Oportunidad';
      case ActionType.UPDATE_DEAL:
        return 'Actualizar Oportunidad';
      case ActionType.GENERATE_DOCUMENT:
        return 'Generar Documento';
      case ActionType.LOG_ACTIVITY:
        return 'Registrar Actividad';
      case ActionType.SCORE_LEAD:
        return 'Puntuar Lead';
      case ActionType.SEGMENT_CONTACT:
        return 'Segmentar Contacto';
      case ActionType.ENRICH_CONTACT:
        return 'Enriquecer Contacto';
      default:
        return 'Acción';
    }
  };

  // Renderizar resumen de la configuración
  const renderConfigSummary = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Canal:</span>{' '}
              {action.config.channel === 'whatsapp' ? 'WhatsApp' : 
               action.config.channel === 'email' ? 'Email' : 
               action.config.channel === 'sms' ? 'SMS' : action.config.channel}
            </p>
            {action.config.messageType === 'template' && action.config.templateId ? (
              <p><span className="font-medium">Plantilla:</span> {action.config.templateId}</p>
            ) : (
              <p className="line-clamp-1"><span className="font-medium">Mensaje:</span> {action.config.content}</p>
            )}
          </div>
        );
      
      case ActionType.ASSIGN_AGENT:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Agente:</span> {action.config.agentName || action.config.agentId}</p>
          </div>
        );
      
      case ActionType.UPDATE_CONTACT:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Campos:</span>{' '}
              {action.config.fields ? Object.keys(action.config.fields).join(', ') : 'No especificados'}
            </p>
          </div>
        );
      
      case ActionType.ADD_TAG:
      case ActionType.REMOVE_TAG:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Etiquetas:</span>{' '}
              {action.config.tags ? action.config.tags.join(', ') : 'No especificadas'}
            </p>
          </div>
        );
      
      case ActionType.MOVE_PIPELINE:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Pipeline:</span> {action.config.pipelineName || action.config.pipelineId}
            </p>
            <p>
              <span className="font-medium">Etapa:</span> {action.config.stageName || action.config.stageId}
            </p>
          </div>
        );
      
      case ActionType.WAIT:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Duración:</span> {action.config.duration}{' '}
              {action.config.unit === 'seconds' ? 'segundos' : 
               action.config.unit === 'minutes' ? 'minutos' : 
               action.config.unit === 'hours' ? 'horas' : 
               action.config.unit === 'days' ? 'días' : action.config.unit}
            </p>
          </div>
        );
      
      case ActionType.RUN_AI_AGENT:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Agente IA:</span> {action.config.agentName || action.config.agentId}</p>
          </div>
        );
      
      case ActionType.WEBHOOK:
        return (
          <div className="text-sm text-gray-600">
            <p className="line-clamp-1">
              <span className="font-medium">URL:</span> {action.config.url}
            </p>
            <p>
              <span className="font-medium">Método:</span> {action.config.method || 'POST'}
            </p>
          </div>
        );
        
      case ActionType.CREATE_TASK:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Título:</span> {action.config.title}</p>
            {action.config.assignedTo && (
              <p><span className="font-medium">Asignada a:</span> {action.config.assignedToName || action.config.assignedTo}</p>
            )}
            {action.config.dueDate && (
              <p><span className="font-medium">Fecha límite:</span> {action.config.dueDate}</p>
            )}
          </div>
        );
        
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Campaña:</span> {action.config.campaignName || action.config.campaignId}</p>
            {action.config.segmentId && (
              <p><span className="font-medium">Segmento:</span> {action.config.segmentName || action.config.segmentId}</p>
            )}
          </div>
        );
        
      case ActionType.SCHEDULE_MEETING:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Título:</span> {action.config.title}</p>
            <p><span className="font-medium">Duración:</span> {action.config.duration} minutos</p>
            {action.config.participants && (
              <p><span className="font-medium">Participantes:</span> {action.config.participants.length}</p>
            )}
          </div>
        );
        
      case ActionType.CREATE_DEAL:
      case ActionType.UPDATE_DEAL:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Título:</span> {action.config.title}</p>
            {action.config.value && (
              <p><span className="font-medium">Valor:</span> ${parseFloat(action.config.value).toLocaleString()}</p>
            )}
            {action.config.pipelineStage && (
              <p><span className="font-medium">Etapa:</span> {action.config.pipelineStageName || action.config.pipelineStage}</p>
            )}
          </div>
        );
        
      case ActionType.GENERATE_DOCUMENT:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Tipo:</span> {action.config.documentType}</p>
            {action.config.template && (
              <p><span className="font-medium">Plantilla:</span> {action.config.templateName || action.config.template}</p>
            )}
            {action.config.format && (
              <p><span className="font-medium">Formato:</span> {action.config.format.toUpperCase()}</p>
            )}
          </div>
        );
        
      case ActionType.LOG_ACTIVITY:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Tipo:</span> {action.config.activityType}</p>
            <p className="line-clamp-1"><span className="font-medium">Descripción:</span> {action.config.description}</p>
          </div>
        );
        
      case ActionType.SCORE_LEAD:
        return (
          <div className="text-sm text-gray-600">
            {action.config.scoreType === 'absolute' ? (
              <p><span className="font-medium">Puntuación:</span> {action.config.score} puntos</p>
            ) : (
              <p>
                <span className="font-medium">Ajuste:</span> {action.config.score > 0 ? '+' : ''}{action.config.score} puntos
              </p>
            )}
            {action.config.reason && (
              <p><span className="font-medium">Razón:</span> {action.config.reason}</p>
            )}
          </div>
        );
        
      case ActionType.SEGMENT_CONTACT:
        return (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Operación:</span> {action.config.operation === 'add' ? 'Añadir a' : 'Quitar de'} segmento
            </p>
            <p><span className="font-medium">Segmento:</span> {action.config.segmentName || action.config.segmentId}</p>
          </div>
        );
        
      case ActionType.ENRICH_CONTACT:
        return (
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Fuente:</span> {action.config.source}</p>
            {action.config.attributes && (
              <p>
                <span className="font-medium">Atributos:</span>{' '}
                {action.config.attributes.join(', ')}
              </p>
            )}
          </div>
        );
      
      default:
        return <div className="text-sm text-gray-600">Configuración no disponible</div>;
    }
  };

  return (
    <div className={`relative mb-6 last:mb-2`}>
      {/* Línea de conexión */}
      {!isFirst && (
        <div className="absolute top-0 left-6 h-4 w-0.5 -mt-4 bg-gray-300"></div>
      )}
      {!isLast && (
        <div className="absolute bottom-0 left-6 h-4 w-0.5 -mb-4 bg-gray-300"></div>
      )}
      
      {/* Tarjeta de acción */}
      <div className={`rounded-lg border ${getBackgroundColor()} overflow-hidden`}>
        <div className="p-4">
          {/* Cabecera con número, tipo e iconos */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-white ${getIconColor()}`}>
                {getActionIcon()}
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">Paso {index + 1}</span>
                  <span className="ml-2 text-sm text-gray-500">|</span>
                  <span className="ml-2 text-sm text-gray-700">{getActionTypeName()}</span>
                </div>
                <p className="text-sm text-gray-500">{action.name}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded-full hover:bg-white/50 text-gray-500"
              >
                {expanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Resumen de la configuración */}
          {renderConfigSummary()}
          
          {/* Detalles expandidos */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Condiciones */}
              {action.conditions && action.conditions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Condiciones:</p>
                  <ul className="text-xs text-gray-600 pl-4 space-y-1 list-disc">
                    {action.conditions.map((condition, idx) => (
                      <li key={idx}>
                        {condition.field} {condition.operator} {condition.value ? String(condition.value) : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isFirst}
                    className={`text-xs ${isFirst ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isLast}
                    className={`text-xs ${isLast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Bajar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationActionCard;