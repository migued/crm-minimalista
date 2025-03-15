import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { 
  PlusIcon, 
  ArrowPathIcon,
  LightBulbIcon,
  ChartBarIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import TriggerConfig from './TriggerConfig';
import ActionConfig from './ActionConfig';
import AutomationActionCard from './AutomationActionCard';
import WorkflowBuilder from './workflow/WorkflowBuilder';
import { 
  Automation, 
  Trigger, 
  Action, 
  TriggerEventType, 
  ActionType
} from './types';

interface AutomationBuilderProps {
  automation?: Automation;
  onSave: (automation: Automation) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AutomationBuilder: React.FC<AutomationBuilderProps> = ({
  automation,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // Estado inicial para una nueva automatización
  const initialAutomation: Automation = {
    name: '',
    description: '',
    organizationId: 'org-123', // Esto debería venir del contexto de la aplicación
    isActive: true,
    trigger: {
      type: TriggerEventType.NEW_MESSAGE,
      conditions: {}
    },
    actions: [],
    workflowEnabled: false
  };

  // Estado actual de la automatización
  const [currentAutomation, setCurrentAutomation] = useState<Automation>(
    automation || initialAutomation
  );

  // Estado para el modo de edición de acción
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [isEditingActionIndex, setIsEditingActionIndex] = useState<number | null>(null);
  
  // Estado para alternar entre modo sencillo y modo workflow
  const [viewMode, setViewMode] = useState<'simple' | 'workflow'>(
    currentAutomation.workflowEnabled ? 'workflow' : 'simple'
  );

  // Acción por defecto
  const defaultAction: Action = {
    id: uuidv4(),
    type: ActionType.SEND_MESSAGE,
    name: 'Nueva acción',
    order: currentAutomation.actions.length,
    config: {
      channel: 'whatsapp',
      messageType: 'text',
      content: ''
    }
  };

  // Función para manejar cambios en el trigger
  const handleTriggerChange = (updatedTrigger: Trigger) => {
    setCurrentAutomation(prev => ({
      ...prev,
      trigger: updatedTrigger
    }));
  };

  // Función para manejar cambios en las acciones
  const handleAddAction = () => {
    setEditingAction({ ...defaultAction });
    setIsAddingAction(true);
    setIsEditingActionIndex(null);
  };

  const handleEditAction = (index: number) => {
    setEditingAction({ ...currentAutomation.actions[index] });
    setIsAddingAction(false);
    setIsEditingActionIndex(index);
  };

  const handleDeleteAction = (index: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta acción?')) {
      const newActions = [...currentAutomation.actions];
      newActions.splice(index, 1);
      
      // Reordenar las acciones restantes
      const reorderedActions = newActions.map((action, idx) => ({
        ...action,
        order: idx
      }));
      
      setCurrentAutomation(prev => ({
        ...prev,
        actions: reorderedActions
      }));
    }
  };

  const handleSaveAction = (action: Action) => {
    let newActions = [...currentAutomation.actions];
    
    if (isAddingAction) {
      // Añadir nueva acción
      newActions.push({
        ...action,
        id: action.id || uuidv4(),
        order: newActions.length
      });
    } else if (isEditingActionIndex !== null) {
      // Actualizar acción existente
      newActions[isEditingActionIndex] = {
        ...action,
        order: isEditingActionIndex
      };
    }
    
    setCurrentAutomation(prev => ({
      ...prev,
      actions: newActions
    }));
    
    setEditingAction(null);
    setIsAddingAction(false);
    setIsEditingActionIndex(null);
  };

  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === currentAutomation.actions.length - 1)
    ) {
      return;
    }
    
    const newActions = [...currentAutomation.actions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Intercambiar acciones
    [newActions[index], newActions[targetIndex]] = [newActions[targetIndex], newActions[index]];
    
    // Actualizar órdenes
    const reorderedActions = newActions.map((action, idx) => ({
      ...action,
      order: idx
    }));
    
    setCurrentAutomation(prev => ({
      ...prev,
      actions: reorderedActions
    }));
  };

  // Función para manejar el formulario de la automatización
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAutomation(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAutomation(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAutomation(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!currentAutomation.name.trim()) {
      alert('Por favor, ingresa un nombre para la automatización.');
      return;
    }
    
    if (currentAutomation.actions.length === 0) {
      alert('Debes añadir al menos una acción.');
      return;
    }
    
    onSave(currentAutomation);
  };

  const cancelActionEdit = () => {
    setEditingAction(null);
    setIsAddingAction(false);
    setIsEditingActionIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulario principal */}
      <form onSubmit={handleSubmit}>
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {automation?.id ? 'Editar Automatización' : 'Nueva Automatización'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={currentAutomation.isActive}
                    onChange={handleActiveChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Automatización Activa
                  </label>
                </div>
                
                <div className="border border-gray-300 rounded-md overflow-hidden flex">
                  <button
                    type="button"
                    className={`py-1 px-3 ${
                      viewMode === 'simple' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setViewMode('simple');
                      setCurrentAutomation(prev => ({
                        ...prev,
                        workflowEnabled: false
                      }));
                    }}
                  >
                    <ListBulletIcon className="h-4 w-4 inline-block mr-1" />
                    Simple
                  </button>
                  <button
                    type="button"
                    className={`py-1 px-3 ${
                      viewMode === 'workflow' 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setViewMode('workflow');
                      setCurrentAutomation(prev => ({
                        ...prev,
                        workflowEnabled: true
                      }));
                    }}
                  >
                    <ChartBarIcon className="h-4 w-4 inline-block mr-1" />
                    Avanzado
                  </button>
                </div>
              </div>
            </div>
          </Card.Header>
          
          <Card.Body>
            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={currentAutomation.name}
                    onChange={handleNameChange}
                    placeholder="Ej.: Mensaje de bienvenida a nuevos contactos"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={currentAutomation.description}
                    onChange={handleDescriptionChange}
                    rows={2}
                    placeholder="Describe brevemente qué hace esta automatización..."
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Trigger */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-4">Evento Desencadenante</h3>
                <TriggerConfig
                  trigger={currentAutomation.trigger}
                  onChange={handleTriggerChange}
                />
              </div>
              
              {/* Acciones (en modo simple) o Workflow (en modo avanzado) */}
              {viewMode === 'simple' ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Acciones a Realizar</h3>
                    {!editingAction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAction}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Añadir Acción
                      </Button>
                    )}
                  </div>
                  
                  {/* Lista de acciones */}
                  {currentAutomation.actions.length === 0 && !editingAction ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <LightBulbIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Aún no hay acciones configuradas. Añade acciones para que se ejecuten cuando se active el evento.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddAction}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Añadir Primera Acción
                      </Button>
                    </div>
                  ) : !editingAction ? (
                    <div className="relative pl-6">
                      {currentAutomation.actions.map((action, index) => (
                        <AutomationActionCard
                          key={action.id}
                          action={action}
                          index={index}
                          isFirst={index === 0}
                          isLast={index === currentAutomation.actions.length - 1}
                          onMoveUp={() => handleMoveAction(index, 'up')}
                          onMoveDown={() => handleMoveAction(index, 'down')}
                          onEdit={() => handleEditAction(index)}
                          onDelete={() => handleDeleteAction(index)}
                        />
                      ))}
                      
                      {/* Punto de adición */}
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={handleAddAction}
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        {isAddingAction ? 'Nueva Acción' : 'Editar Acción'}
                      </h3>
                      <ActionConfig
                        action={editingAction}
                        onChange={setEditingAction}
                      />
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelActionEdit}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveAction(editingAction)}
                        >
                          {isAddingAction ? 'Añadir' : 'Actualizar'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <WorkflowBuilder 
                    automation={currentAutomation}
                    onChange={setCurrentAutomation}
                  />
                </div>
              )}
            </div>
          </Card.Body>
          
          <Card.Footer>
            <div className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading || editingAction !== null}
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  automation?.id ? 'Actualizar Automatización' : 'Crear Automatización'
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </div>
  );
};

export default AutomationBuilder;