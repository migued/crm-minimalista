import React, { useState, useEffect } from 'react';
import { ActionType, Action, ConditionOperator } from './types';

interface ActionConfigProps {
  action: Action;
  onChange: (updatedAction: Action) => void;
  availableAgents?: { id: string; name: string }[];
  availableAIAgents?: { id: string; name: string }[];
  availablePipelines?: { id: string; name: string; stages: { id: string; name: string }[] }[];
  availableTemplates?: { id: string; name: string; description: string }[];
}

const ActionConfig: React.FC<ActionConfigProps> = ({
  action,
  onChange,
  availableAgents = [],
  availableAIAgents = [],
  availablePipelines = [],
  availableTemplates = []
}) => {
  // Datos de ejemplo cuando no se proporcionan
  const mockAgents = [
    { id: 'agent1', name: 'Carlos García' },
    { id: 'agent2', name: 'María Rodríguez' },
    { id: 'agent3', name: 'Juan López' }
  ];

  const mockAIAgents = [
    { id: 'ai1', name: 'Asistente de Ventas' },
    { id: 'ai2', name: 'Clasificador de Mensajes' },
    { id: 'ai3', name: 'Resumidor de Conversaciones' }
  ];

  const mockPipelines = [
    {
      id: 'pipeline1',
      name: 'Pipeline de Ventas',
      stages: [
        { id: 'stage1', name: 'Lead' },
        { id: 'stage2', name: 'Calificado' },
        { id: 'stage3', name: 'Propuesta' },
        { id: 'stage4', name: 'Negociación' },
        { id: 'stage5', name: 'Cerrado Ganado' },
        { id: 'stage6', name: 'Cerrado Perdido' }
      ]
    },
    {
      id: 'pipeline2',
      name: 'Pipeline de Soporte',
      stages: [
        { id: 'stage1', name: 'Nuevo Ticket' },
        { id: 'stage2', name: 'En Progreso' },
        { id: 'stage3', name: 'Pendiente Cliente' },
        { id: 'stage4', name: 'Resuelto' },
        { id: 'stage5', name: 'Cerrado' }
      ]
    }
  ];

  const mockTemplates = [
    { id: 'template1', name: 'Bienvenida', description: 'Mensaje de bienvenida para nuevos contactos' },
    { id: 'template2', name: 'Confirmación de Cita', description: 'Confirma una cita programada' },
    { id: 'template3', name: 'Seguimiento', description: 'Mensaje de seguimiento post-conversación' }
  ];

  // Usar datos proporcionados o mock
  const agents = availableAgents.length > 0 ? availableAgents : mockAgents;
  const aiAgents = availableAIAgents.length > 0 ? availableAIAgents : mockAIAgents;
  const pipelines = availablePipelines.length > 0 ? availablePipelines : mockPipelines;
  const templates = availableTemplates.length > 0 ? availableTemplates : mockTemplates;

  // Estado para las etapas del pipeline seleccionado
  const [selectedPipelineStages, setSelectedPipelineStages] = useState<{ id: string; name: string }[]>([]);

  // Actualizar etapas cuando cambia el pipeline seleccionado
  useEffect(() => {
    if (action.type === ActionType.MOVE_PIPELINE && action.config.pipelineId) {
      const pipeline = pipelines.find(p => p.id === action.config.pipelineId);
      if (pipeline) {
        setSelectedPipelineStages(pipeline.stages);
      }
    }
  }, [action.config.pipelineId, pipelines]);

  // Manejar cambios en el tipo de acción
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ActionType;
    
    // Configuración por defecto según el tipo
    let defaultConfig: Record<string, any> = {};
    
    switch (newType) {
      case ActionType.SEND_MESSAGE:
        defaultConfig = {
          channel: 'whatsapp',
          messageType: 'text',
          content: ''
        };
        break;
      case ActionType.ASSIGN_AGENT:
        defaultConfig = {
          agentId: agents.length > 0 ? agents[0].id : ''
        };
        break;
      case ActionType.UPDATE_CONTACT:
        defaultConfig = {
          fields: {}
        };
        break;
      case ActionType.ADD_TAG:
      case ActionType.REMOVE_TAG:
        defaultConfig = {
          tags: []
        };
        break;
      case ActionType.MOVE_PIPELINE:
        defaultConfig = {
          pipelineId: pipelines.length > 0 ? pipelines[0].id : '',
          stageId: pipelines.length > 0 && pipelines[0].stages.length > 0 ? pipelines[0].stages[0].id : ''
        };
        setSelectedPipelineStages(pipelines.length > 0 ? pipelines[0].stages : []);
        break;
      case ActionType.WAIT:
        defaultConfig = {
          duration: 5,
          unit: 'minutes'
        };
        break;
      case ActionType.RUN_AI_AGENT:
        defaultConfig = {
          agentId: aiAgents.length > 0 ? aiAgents[0].id : ''
        };
        break;
      case ActionType.WEBHOOK:
        defaultConfig = {
          url: '',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        break;
      case ActionType.CREATE_TASK:
        defaultConfig = {
          title: '',
          description: '',
          priority: 'medium',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
          assignedTo: agents.length > 0 ? agents[0].id : ''
        };
        break;
      case ActionType.SEND_EMAIL_CAMPAIGN:
        defaultConfig = {
          campaignId: '',
          campaignName: '',
          segmentId: '',
          segmentName: ''
        };
        break;
      case ActionType.SCHEDULE_MEETING:
        defaultConfig = {
          title: '',
          description: '',
          startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
          startTime: '09:00',
          duration: 30,
          participants: []
        };
        break;
      case ActionType.CREATE_DEAL:
        defaultConfig = {
          title: '',
          value: 0,
          pipelineId: pipelines.length > 0 ? pipelines[0].id : '',
          pipelineStage: pipelines.length > 0 && pipelines[0].stages.length > 0 ? pipelines[0].stages[0].id : '',
          expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] // 30 días
        };
        break;
      case ActionType.UPDATE_DEAL:
        defaultConfig = {
          dealId: '',
          title: '',
          value: '',
          pipelineStage: '',
          expectedCloseDate: ''
        };
        break;
      case ActionType.GENERATE_DOCUMENT:
        defaultConfig = {
          documentType: 'proposal',
          template: '',
          format: 'pdf',
          sendToContact: true
        };
        break;
      case ActionType.LOG_ACTIVITY:
        defaultConfig = {
          activityType: 'call',
          description: '',
          outcome: 'completed'
        };
        break;
      case ActionType.SCORE_LEAD:
        defaultConfig = {
          scoreType: 'increment',
          score: 10,
          reason: ''
        };
        break;
      case ActionType.SEGMENT_CONTACT:
        defaultConfig = {
          operation: 'add',
          segmentId: '',
          segmentName: ''
        };
        break;
      case ActionType.ENRICH_CONTACT:
        defaultConfig = {
          source: 'internal',
          attributes: ['company', 'position', 'industry', 'website']
        };
        break;
      case ActionType.CUSTOM_FUNCTION:
        defaultConfig = {
          functionName: '',
          parameters: {}
        };
        break;
    }
    
    onChange({
      ...action,
      type: newType,
      config: defaultConfig
    });
  };

  // Manejar cambios en campos de config
  const handleConfigChange = (field: string, value: any) => {
    onChange({
      ...action,
      config: {
        ...action.config,
        [field]: value
      }
    });
  };

  // Manejar cambios en el nombre de la acción
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...action,
      name: e.target.value
    });
  };

  // Renderizar configuración según el tipo de acción
  const renderActionTypeConfig = () => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal
              </label>
              <select
                value={action.config.channel || 'whatsapp'}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            {action.config.channel === 'whatsapp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de mensaje
                </label>
                <select
                  value={action.config.messageType || 'text'}
                  onChange={(e) => handleConfigChange('messageType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="text">Texto simple</option>
                  <option value="template">Plantilla</option>
                </select>
              </div>
            )}

            {action.config.channel === 'whatsapp' && action.config.messageType === 'template' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plantilla de WhatsApp
                </label>
                <select
                  value={action.config.templateId || ''}
                  onChange={(e) => handleConfigChange('templateId', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar plantilla</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Estas plantillas deben estar aprobadas en tu cuenta de WhatsApp Business
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido del mensaje
                </label>
                <textarea
                  value={action.config.content || ''}
                  onChange={(e) => handleConfigChange('content', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Escribe el mensaje que se enviará..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Puedes usar variables como {"{contact.name}"}, {"{contact.email}"}
                </p>
              </div>
            )}
          </div>
        );

      case ActionType.ASSIGN_AGENT:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agente
            </label>
            <select
              value={action.config.agentId || ''}
              onChange={(e) => handleConfigChange('agentId', e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar agente</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              El contacto o conversación será asignado a este agente
            </p>
          </div>
        );

      case ActionType.UPDATE_CONTACT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campos a actualizar
              </label>
              <div className="space-y-2">
                {/* Campo Nombre */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={action.config.fields && 'name' in action.config.fields}
                    onChange={(e) => {
                      const fields = { ...action.config.fields };
                      if (e.target.checked) {
                        fields.name = '';
                      } else {
                        delete fields.name;
                      }
                      handleConfigChange('fields', fields);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Nombre</span>
                  {action.config.fields && 'name' in action.config.fields && (
                    <input
                      type="text"
                      value={action.config.fields.name || ''}
                      onChange={(e) => {
                        const fields = { ...action.config.fields, name: e.target.value };
                        handleConfigChange('fields', fields);
                      }}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nuevo valor o variable {{variable}}"
                    />
                  )}
                </div>

                {/* Campo Email */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={action.config.fields && 'email' in action.config.fields}
                    onChange={(e) => {
                      const fields = { ...action.config.fields };
                      if (e.target.checked) {
                        fields.email = '';
                      } else {
                        delete fields.email;
                      }
                      handleConfigChange('fields', fields);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Email</span>
                  {action.config.fields && 'email' in action.config.fields && (
                    <input
                      type="text"
                      value={action.config.fields.email || ''}
                      onChange={(e) => {
                        const fields = { ...action.config.fields, email: e.target.value };
                        handleConfigChange('fields', fields);
                      }}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nuevo valor o variable {{variable}}"
                    />
                  )}
                </div>

                {/* Campo Teléfono */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={action.config.fields && 'phone' in action.config.fields}
                    onChange={(e) => {
                      const fields = { ...action.config.fields };
                      if (e.target.checked) {
                        fields.phone = '';
                      } else {
                        delete fields.phone;
                      }
                      handleConfigChange('fields', fields);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Teléfono</span>
                  {action.config.fields && 'phone' in action.config.fields && (
                    <input
                      type="text"
                      value={action.config.fields.phone || ''}
                      onChange={(e) => {
                        const fields = { ...action.config.fields, phone: e.target.value };
                        handleConfigChange('fields', fields);
                      }}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nuevo valor o variable {{variable}}"
                    />
                  )}
                </div>

                {/* Campo de notas */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={action.config.fields && 'notes' in action.config.fields}
                    onChange={(e) => {
                      const fields = { ...action.config.fields };
                      if (e.target.checked) {
                        fields.notes = '';
                      } else {
                        delete fields.notes;
                      }
                      handleConfigChange('fields', fields);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Notas</span>
                  {action.config.fields && 'notes' in action.config.fields && (
                    <input
                      type="text"
                      value={action.config.fields.notes || ''}
                      onChange={(e) => {
                        const fields = { ...action.config.fields, notes: e.target.value };
                        handleConfigChange('fields', fields);
                      }}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nuevo valor o variable {{variable}}"
                    />
                  )}
                </div>

                {/* Campo personalizado */}
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-sm text-gray-700">Campo personalizado:</span>
                  <input
                    type="text"
                    placeholder="Nombre del campo"
                    className="w-40 border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const fields = { ...action.config.fields, [e.target.value]: '' };
                        handleConfigChange('fields', fields);
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        const fields = { ...action.config.fields, [(e.target as HTMLInputElement).value]: '' };
                        handleConfigChange('fields', fields);
                        (e.target as HTMLInputElement).value = '';
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      const fieldName = prompt('Nombre del campo personalizado:');
                      if (fieldName) {
                        const fields = { ...action.config.fields, [fieldName]: '' };
                        handleConfigChange('fields', fields);
                      }
                    }}
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case ActionType.ADD_TAG:
      case ActionType.REMOVE_TAG:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas
            </label>
            <input
              type="text"
              value={(action.config.tags || []).join(', ')}
              onChange={(e) => {
                const tagsString = e.target.value;
                const tags = tagsString
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                handleConfigChange('tags', tags);
              }}
              placeholder="Ej: cliente_potencial, seguimiento, urgente"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ingresa las etiquetas separadas por comas
            </p>
          </div>
        );

      case ActionType.MOVE_PIPELINE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline
              </label>
              <select
                value={action.config.pipelineId || ''}
                onChange={(e) => {
                  const pipelineId = e.target.value;
                  handleConfigChange('pipelineId', pipelineId);
                  
                  // Actualizar etapas disponibles
                  const pipeline = pipelines.find(p => p.id === pipelineId);
                  if (pipeline) {
                    setSelectedPipelineStages(pipeline.stages);
                    // Seleccionar la primera etapa por defecto
                    if (pipeline.stages.length > 0) {
                      handleConfigChange('stageId', pipeline.stages[0].id);
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar pipeline</option>
                {pipelines.map(pipeline => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etapa
              </label>
              <select
                value={action.config.stageId || ''}
                onChange={(e) => handleConfigChange('stageId', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={!action.config.pipelineId || selectedPipelineStages.length === 0}
              >
                <option value="">Seleccionar etapa</option>
                {selectedPipelineStages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case ActionType.WAIT:
        return (
          <div className="flex items-end space-x-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración
              </label>
              <input
                type="number"
                min="1"
                value={action.config.duration || 5}
                onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
                className="w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <select
                value={action.config.unit || 'minutes'}
                onChange={(e) => handleConfigChange('unit', e.target.value)}
                className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="seconds">Segundos</option>
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
            </div>
          </div>
        );

      case ActionType.RUN_AI_AGENT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agente de IA
              </label>
              <select
                value={action.config.agentId || ''}
                onChange={(e) => handleConfigChange('agentId', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar agente</option>
                {aiAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entrada para el agente (opcional)
              </label>
              <textarea
                value={action.config.input || ''}
                onChange={(e) => handleConfigChange('input', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Texto para procesar o instrucciones para el agente..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Si está vacío, se usará el mensaje o evento que activó la automatización
              </p>
            </div>
          </div>
        );

      case ActionType.WEBHOOK:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Webhook
              </label>
              <input
                type="url"
                value={action.config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://ejemplo.com/webhook"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método
              </label>
              <select
                value={action.config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuerpo (para POST, PUT)
              </label>
              <textarea
                value={action.config.body ? (typeof action.config.body === 'string' ? action.config.body : JSON.stringify(action.config.body, null, 2)) : ''}
                onChange={(e) => {
                  try {
                    // Intentar parsear como JSON
                    const jsonBody = JSON.parse(e.target.value);
                    handleConfigChange('body', jsonBody);
                  } catch {
                    // Si no es JSON válido, guardar como string
                    handleConfigChange('body', e.target.value);
                  }
                }}
                rows={3}
                className="w-full font-mono border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder='{"key": "value"}'
              />
              <p className="mt-1 text-xs text-gray-500">
                Formato JSON. Puedes usar variables como {"{contact.name}"}
              </p>
            </div>
          </div>
        );

      case ActionType.CREATE_TASK:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la tarea *
              </label>
              <input
                type="text"
                value={action.config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Ej: Llamar al cliente"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={action.config.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Instrucciones o detalles para esta tarea..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignar a
                </label>
                <select
                  value={action.config.assignedTo || ''}
                  onChange={(e) => handleConfigChange('assignedTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Sin asignar</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={action.config.priority || 'medium'}
                  onChange={(e) => handleConfigChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha límite
              </label>
              <input
                type="date"
                value={action.config.dueDate || ''}
                onChange={(e) => handleConfigChange('dueDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );
      
      case ActionType.SEND_EMAIL_CAMPAIGN:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaña de Email
              </label>
              <input
                type="text"
                value={action.config.campaignName || ''}
                onChange={(e) => {
                  handleConfigChange('campaignName', e.target.value);
                  handleConfigChange('campaignId', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="Nombre de la campaña"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                En una implementación real, mostraremos un selector de campañas existentes
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segmento de destinatarios
              </label>
              <input
                type="text"
                value={action.config.segmentName || ''}
                onChange={(e) => {
                  handleConfigChange('segmentName', e.target.value);
                  handleConfigChange('segmentId', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="Segmento de destinatarios (opcional)"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Si se deja vacío, se usará el contacto que activó la automatización
              </p>
            </div>
          </div>
        );
      
      case ActionType.SCORE_LEAD:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de puntuación
              </label>
              <select
                value={action.config.scoreType || 'increment'}
                onChange={(e) => handleConfigChange('scoreType', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="absolute">Valor absoluto (establecer)</option>
                <option value="increment">Incrementar (sumar)</option>
                <option value="decrement">Decrementar (restar)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {action.config.scoreType === 'absolute' ? 'Puntuación' : 'Cambio de puntuación'}
              </label>
              <input
                type="number"
                value={action.config.score || 0}
                onChange={(e) => handleConfigChange('score', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón (opcional)
              </label>
              <input
                type="text"
                value={action.config.reason || ''}
                onChange={(e) => handleConfigChange('reason', e.target.value)}
                placeholder="Ej: Descargó un recurso premium"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );
      
      case ActionType.GENERATE_DOCUMENT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento
              </label>
              <select
                value={action.config.documentType || 'proposal'}
                onChange={(e) => handleConfigChange('documentType', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="proposal">Propuesta comercial</option>
                <option value="contract">Contrato</option>
                <option value="invoice">Factura</option>
                <option value="quote">Cotización</option>
                <option value="report">Reporte</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla
              </label>
              <select
                value={action.config.template || ''}
                onChange={(e) => handleConfigChange('template', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar plantilla</option>
                <option value="template1">Plantilla Básica</option>
                <option value="template2">Corporativa Premium</option>
                <option value="template3">Diseño Moderno</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                En una implementación real, estas serían plantillas configuradas por el usuario
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato de salida
              </label>
              <select
                value={action.config.format || 'pdf'}
                onChange={(e) => handleConfigChange('format', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="docx">Word (DOCX)</option>
                <option value="html">HTML</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendToContact"
                checked={action.config.sendToContact || false}
                onChange={(e) => handleConfigChange('sendToContact', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="sendToContact" className="ml-2 block text-sm text-gray-700">
                Enviar automáticamente al contacto por email
              </label>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-500 italic py-2">
            No hay configuración disponible para este tipo de acción
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Acción
        </label>
        <input
          type="text"
          value={action.name}
          onChange={handleNameChange}
          placeholder="Ejemplo: Enviar mensaje de bienvenida"
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Acción
        </label>
        <select
          value={action.type}
          onChange={handleTypeChange}
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <optgroup label="Comunicación">
            <option value={ActionType.SEND_MESSAGE}>Enviar mensaje</option>
            <option value={ActionType.SEND_EMAIL_CAMPAIGN}>Enviar campaña email</option>
          </optgroup>
          
          <optgroup label="Contactos y Leads">
            <option value={ActionType.UPDATE_CONTACT}>Actualizar contacto</option>
            <option value={ActionType.ADD_TAG}>Añadir etiqueta</option>
            <option value={ActionType.REMOVE_TAG}>Eliminar etiqueta</option>
            <option value={ActionType.ENRICH_CONTACT}>Enriquecer contacto</option>
            <option value={ActionType.SEGMENT_CONTACT}>Segmentar contacto</option>
            <option value={ActionType.SCORE_LEAD}>Puntuar lead</option>
          </optgroup>
          
          <optgroup label="CRM">
            <option value={ActionType.ASSIGN_AGENT}>Asignar agente</option>
            <option value={ActionType.CREATE_TASK}>Crear tarea</option>
            <option value={ActionType.SCHEDULE_MEETING}>Programar reunión</option>
            <option value={ActionType.LOG_ACTIVITY}>Registrar actividad</option>
            <option value={ActionType.CREATE_DEAL}>Crear oportunidad</option>
            <option value={ActionType.UPDATE_DEAL}>Actualizar oportunidad</option>
            <option value={ActionType.MOVE_PIPELINE}>Mover en pipeline</option>
            <option value={ActionType.GENERATE_DOCUMENT}>Generar documento</option>
          </optgroup>
          
          <optgroup label="Control de flujo">
            <option value={ActionType.WAIT}>Esperar</option>
            <option value={ActionType.CONDITIONAL}>Condición</option>
          </optgroup>
          
          <optgroup label="Integración y IA">
            <option value={ActionType.RUN_AI_AGENT}>Ejecutar agente IA</option>
            <option value={ActionType.WEBHOOK}>Llamar webhook</option>
            <option value={ActionType.CUSTOM_FUNCTION}>Función personalizada</option>
          </optgroup>
        </select>
      </div>

      {/* Configuración específica para este tipo de acción */}
      {renderActionTypeConfig()}
    </div>
  );
};

export default ActionConfig;
