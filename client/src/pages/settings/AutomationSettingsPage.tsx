import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AutomationBuilder from '../../components/automation/AutomationBuilder';
import { loadAutomations, createAutomation, updateAutomation, deleteAutomation, toggleAutomationActive } from './automation-methods';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  ClockIcon, 
  PaperAirplaneIcon, 
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Automation, TriggerEventType } from '../../components/automation/types';

type ActiveView = 'list' | 'new' | 'edit';

const AutomationSettingsPage: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');


  // Load automations from the API
  useEffect(() => {
    // The organization ID would come from the user context
    const organizationId = 'org-123';
    
    // Load automations using the imported method
    loadAutomations(
      organizationId,
      setIsLoading,
      setError,
      setAutomations
    );
  }, []);

  // Filtrar automatizaciones por tipo
  const filteredAutomations = automations.filter(automation => {
    if (filterType === 'all') return true;
    return automation.trigger.type === filterType;
  });

  // Use imported handlers for automation CRUD operations
  
  // Create a new automation
  const handleCreateAutomation = (automation: Automation) => {
    createAutomation(automation, setIsLoading, setError, setAutomations, setActiveView);
  };

  // Update an existing automation
  const handleUpdateAutomation = (automation: Automation) => {
    updateAutomation(automation, setIsLoading, setError, setAutomations, setActiveView);
  };

  // Delete an automation
  const handleDeleteAutomation = (automationId: string) => {
    deleteAutomation(automationId, setIsLoading, setError, setAutomations);
  };

  // Toggle automation active state
  const handleToggleActive = (automationId: string, isActive: boolean) => {
    toggleAutomationActive(automationId, isActive, setIsLoading, setError, setAutomations);
  };

  // Obtener icono según el tipo de trigger
  const getTriggerIcon = (triggerType: TriggerEventType) => {
    switch (triggerType) {
      case TriggerEventType.NEW_MESSAGE:
        return <PaperAirplaneIcon className="h-5 w-5" />;
      case TriggerEventType.NEW_CONTACT:
        return <PlusIcon className="h-5 w-5" />;
      case TriggerEventType.CONTACT_UPDATED:
        return <PencilIcon className="h-5 w-5" />;
      case TriggerEventType.PIPELINE_STAGE_CHANGED:
        return <ArrowTrendingUpIcon className="h-5 w-5" />;
      case TriggerEventType.TAG_ADDED:
      case TriggerEventType.TAG_REMOVED:
        return <TagIcon className="h-5 w-5" />;
      case TriggerEventType.FORM_SUBMITTED:
        return <CheckCircleIcon className="h-5 w-5" />;
      case TriggerEventType.SCHEDULED:
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <BoltIcon className="h-5 w-5" />;
    }
  };

  // Obtener la descripción legible del tipo de trigger
  const getTriggerDescription = (triggerType: TriggerEventType, trigger: any) => {
    switch (triggerType) {
      case TriggerEventType.NEW_MESSAGE:
        return `Cuando se recibe un nuevo mensaje${trigger.conditions?.channel ? ` en ${trigger.conditions.channel.join(', ')}` : ''}`;
      case TriggerEventType.NEW_CONTACT:
        return 'Cuando se crea un nuevo contacto';
      case TriggerEventType.CONTACT_UPDATED:
        return `Cuando se actualiza un contacto${trigger.conditions?.field ? ` (campo: ${trigger.conditions.field})` : ''}`;
      case TriggerEventType.PIPELINE_STAGE_CHANGED:
        return 'Cuando un contacto cambia de etapa en el pipeline';
      case TriggerEventType.TAG_ADDED:
        return `Cuando se añade una etiqueta${trigger.conditions?.tags ? `: ${trigger.conditions.tags.join(', ')}` : ''}`;
      case TriggerEventType.TAG_REMOVED:
        return `Cuando se elimina una etiqueta${trigger.conditions?.tags ? `: ${trigger.conditions.tags.join(', ')}` : ''}`;
      case TriggerEventType.FORM_SUBMITTED:
        return 'Cuando se envía un formulario';
      case TriggerEventType.SCHEDULED:
        if (trigger.schedule?.frequency === 'once') {
          return `Programado una vez: ${trigger.schedule.startDate ? new Date(trigger.schedule.startDate).toLocaleDateString() : 'fecha no especificada'}`;
        }
        if (trigger.schedule?.frequency === 'daily') {
          return `Diariamente a las ${trigger.schedule.time || '00:00'}`;
        }
        if (trigger.schedule?.frequency === 'weekly') {
          return `Semanalmente ${trigger.schedule.daysOfWeek ? 'los días ' + trigger.schedule.daysOfWeek.map((d: number) => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d]).join(', ') : ''} a las ${trigger.schedule.time || '00:00'}`;
        }
        if (trigger.schedule?.frequency === 'monthly') {
          return `Mensualmente el día ${trigger.schedule.dayOfMonth || 1} a las ${trigger.schedule.time || '00:00'}`;
        }
        return 'Evento programado';
      default:
        return 'Evento personalizado';
    }
  };

  // Obtener resumen de acciones
  const getActionsSummary = (actions: any[]) => {
    if (actions.length === 0) return 'Sin acciones';
    
    if (actions.length === 1) {
      return `1 acción: ${actions[0].name}`;
    }
    
    return `${actions.length} acciones`;
  };

  // Renderizar contenido según la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-gray-900">Automatizaciones</h2>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value={TriggerEventType.NEW_MESSAGE}>Nuevo mensaje</option>
                  <option value={TriggerEventType.NEW_CONTACT}>Nuevo contacto</option>
                  <option value={TriggerEventType.CONTACT_UPDATED}>Contacto actualizado</option>
                  <option value={TriggerEventType.PIPELINE_STAGE_CHANGED}>Cambio en pipeline</option>
                  <option value={TriggerEventType.TAG_ADDED}>Etiqueta añadida</option>
                  <option value={TriggerEventType.SCHEDULED}>Programado</option>
                </select>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedAutomation(null);
                  setActiveView('new');
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Automatización
              </Button>
            </div>

            {isLoading && automations.length === 0 ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <BoltIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay automatizaciones creadas</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Las automatizaciones te permiten realizar acciones automáticas basadas en eventos.
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedAutomation(null);
                      setActiveView('new');
                    }}
                  >
                    Crear Primera Automatización
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAutomations.map(automation => (
                  <Card key={automation.id}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900 mr-2">{automation.name}</h3>
                            <Badge
                              color={automation.isActive ? 'green' : 'gray'}
                              size="sm"
                            >
                              {automation.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(automation.id!, !automation.isActive)}
                          >
                            {automation.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAutomation(automation);
                              setActiveView('edit');
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAutomation(automation.id!)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        {/* Trigger */}
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 rounded-full p-1.5 bg-blue-50 text-blue-700`}>
                            {getTriggerIcon(automation.trigger.type)}
                          </div>
                          <div className="ml-3">
                            <h4 className="text-xs font-medium text-gray-700">EVENTO DESENCADENANTE</h4>
                            <p className="text-sm text-gray-900">
                              {getTriggerDescription(automation.trigger.type, automation.trigger)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 rounded-full p-1.5 bg-green-50 text-green-700`}>
                            <BoltIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-xs font-medium text-gray-700">ACCIONES</h4>
                            <p className="text-sm text-gray-900">
                              {getActionsSummary(automation.actions)}
                            </p>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        {automation.totalExecutions > 0 && (
                          <div className="bg-gray-50 rounded-md p-3 mt-3">
                            <div className="flex justify-between text-xs text-gray-700">
                              <div>
                                <span className="font-medium">Total ejecuciones:</span> {automation.totalExecutions}
                              </div>
                              <div>
                                <span className="text-green-600">{automation.successfulExecutions} correctas</span> / 
                                <span className="text-red-600"> {automation.failedExecutions} fallidas</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full" 
                                style={{ width: `${(automation.successfulExecutions / automation.totalExecutions) * 100}%` }}
                              ></div>
                            </div>
                            {automation.lastExecutedAt && (
                              <div className="text-xs text-gray-500 mt-2">
                                Última ejecución: {new Date(automation.lastExecutedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'new':
      case 'edit':
        return (
          <div>
            <div className="mb-4">
              <button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => setActiveView('list')}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a la lista
              </button>
            </div>
            
            <AutomationBuilder
              automation={selectedAutomation || undefined}
              onSave={activeView === 'edit' ? handleUpdateAutomation : handleCreateAutomation}
              onCancel={() => setActiveView('list')}
              isLoading={isLoading}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automatizaciones"
        subtitle="Configura flujos de trabajo automáticos basados en eventos"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default AutomationSettingsPage;