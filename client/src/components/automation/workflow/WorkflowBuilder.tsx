import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../ui/Button';
import { 
  PlusIcon, 
  ArrowPathIcon,
  LightBulbIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  ArrowLongRightIcon
} from '@heroicons/react/24/outline';
import WorkflowStepCard from './WorkflowStepCard';
import ActionConfig from '../ActionConfig';
import {
  Automation,
  WorkflowStep,
  WorkflowConnection,
  WorkflowConnectionType,
  Action,
  ActionType,
  ActionCondition
} from '../types';

interface WorkflowBuilderProps {
  automation: Automation;
  onChange: (updatedAutomation: Automation) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  automation,
  onChange
}) => {
  // Local state for workflow editing
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  
  // State for editing connections
  const [creatingConnection, setCreatingConnection] = useState<{
    sourceStepId: string;
    targetStepId: string | null;
    connectionType: WorkflowConnectionType;
    conditions: ActionCondition[];
  } | null>(null);
  
  // State for editing actions within a step
  const [editingAction, setEditingAction] = useState<{
    stepId: string;
    action: Action;
    actionIndex: number | null;
  } | null>(null);
  
  // Initialize workflow if not present
  const initializeWorkflow = () => {
    // Create a start step with actions from the basic automation
    const startStep: WorkflowStep = {
      id: uuidv4(),
      name: 'Inicio del Flujo',
      description: 'Paso inicial del workflow',
      actions: [...automation.actions]
    };
    
    // Create an end step
    const endStep: WorkflowStep = {
      id: uuidv4(),
      name: 'Fin del Flujo',
      description: 'Paso final del workflow',
      actions: [],
      isEndStep: true
    };
    
    // Create a connection from start to end
    const connection: WorkflowConnection = {
      id: uuidv4(),
      type: WorkflowConnectionType.SEQUENCE,
      sourceStepId: startStep.id,
      targetStepId: endStep.id
    };
    
    // Update the automation with the new workflow
    const updatedAutomation: Automation = {
      ...automation,
      workflowEnabled: true,
      workflowSteps: [startStep, endStep],
      workflowConnections: [connection],
      initialStepId: startStep.id
    };
    
    onChange(updatedAutomation);
  };
  
  // Handle toggling workflow mode
  const handleToggleWorkflowMode = () => {
    if (!automation.workflowEnabled) {
      initializeWorkflow();
    } else {
      if (window.confirm('¿Estás seguro de que deseas desactivar el modo workflow? Perderás todas las configuraciones de pasos y conexiones.')) {
        const updatedAutomation: Automation = {
          ...automation,
          workflowEnabled: false,
          workflowSteps: undefined,
          workflowConnections: undefined,
          initialStepId: undefined
        };
        
        onChange(updatedAutomation);
      }
    }
  };
  
  // Add a new step to the workflow
  const handleAddStep = () => {
    if (!automation.workflowSteps) return;
    
    const newStep: WorkflowStep = {
      id: uuidv4(),
      name: `Paso ${automation.workflowSteps.length}`,
      description: 'Nuevo paso de workflow',
      actions: []
    };
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: [...automation.workflowSteps, newStep]
    };
    
    onChange(updatedAutomation);
  };
  
  // Edit an existing step
  const handleEditStep = (stepId: string) => {
    const step = automation.workflowSteps?.find(s => s.id === stepId);
    if (!step) return;
    
    setEditingStepId(stepId);
    setEditingStep({ ...step });
  };
  
  // Save step edits
  const handleSaveStep = () => {
    if (!editingStep || !automation.workflowSteps) return;
    
    const updatedSteps = automation.workflowSteps.map(step => 
      step.id === editingStep.id ? editingStep : step
    );
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: updatedSteps
    };
    
    onChange(updatedAutomation);
    setEditingStepId(null);
    setEditingStep(null);
  };
  
  // Cancel step editing
  const handleCancelEditStep = () => {
    setEditingStepId(null);
    setEditingStep(null);
  };
  
  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    if (!automation.workflowSteps || !automation.workflowConnections) return;
    
    // Cannot delete initial or end steps
    if (stepId === automation.initialStepId) {
      alert('No puedes eliminar el paso inicial del workflow.');
      return;
    }
    
    if (automation.workflowSteps.find(s => s.id === stepId)?.isEndStep) {
      alert('No puedes eliminar pasos finales del workflow.');
      return;
    }
    
    // Remove the step and any connections to/from it
    const updatedSteps = automation.workflowSteps.filter(step => step.id !== stepId);
    const updatedConnections = automation.workflowConnections.filter(
      conn => conn.sourceStepId !== stepId && conn.targetStepId !== stepId
    );
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: updatedSteps,
      workflowConnections: updatedConnections
    };
    
    onChange(updatedAutomation);
  };
  
  // Start creating a connection
  const handleAddConnection = (sourceStepId: string) => {
    setCreatingConnection({
      sourceStepId,
      targetStepId: null,
      connectionType: WorkflowConnectionType.SEQUENCE,
      conditions: []
    });
  };
  
  // Complete the connection creation
  const handleCompleteConnection = (targetStepId: string) => {
    if (!creatingConnection || !automation.workflowConnections) return;
    
    // Check if connection already exists
    const connectionExists = automation.workflowConnections.some(
      conn => conn.sourceStepId === creatingConnection.sourceStepId && conn.targetStepId === targetStepId
    );
    
    if (connectionExists) {
      alert('Ya existe una conexión entre estos pasos.');
      return;
    }
    
    // Create the new connection
    const newConnection: WorkflowConnection = {
      id: uuidv4(),
      type: creatingConnection.connectionType,
      sourceStepId: creatingConnection.sourceStepId,
      targetStepId,
      conditions: creatingConnection.conditions.length > 0 ? creatingConnection.conditions : undefined
    };
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowConnections: [...automation.workflowConnections, newConnection]
    };
    
    onChange(updatedAutomation);
    setCreatingConnection(null);
  };
  
  // Cancel connection creation
  const handleCancelConnection = () => {
    setCreatingConnection(null);
  };
  
  // Change connection type
  const handleConnectionTypeChange = (type: WorkflowConnectionType) => {
    if (!creatingConnection) return;
    
    setCreatingConnection({
      ...creatingConnection,
      connectionType: type
    });
  };
  
  // Add condition to connection
  const handleAddConditionToConnection = () => {
    if (!creatingConnection) return;
    
    setCreatingConnection({
      ...creatingConnection,
      conditions: [
        ...creatingConnection.conditions,
        {
          field: 'contact.name',
          operator: 'equals',
          value: ''
        }
      ]
    });
  };
  
  // Remove condition from connection
  const handleRemoveConditionFromConnection = (index: number) => {
    if (!creatingConnection) return;
    
    const updatedConditions = [...creatingConnection.conditions];
    updatedConditions.splice(index, 1);
    
    setCreatingConnection({
      ...creatingConnection,
      conditions: updatedConditions
    });
  };
  
  // Update condition in connection
  const handleUpdateConditionInConnection = (index: number, field: string, value: any) => {
    if (!creatingConnection) return;
    
    const updatedConditions = [...creatingConnection.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };
    
    setCreatingConnection({
      ...creatingConnection,
      conditions: updatedConditions
    });
  };
  
  // Start editing an action
  const handleEditAction = (stepId: string, actionIndex: number) => {
    if (!automation.workflowSteps) return;
    
    const step = automation.workflowSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const action = step.actions[actionIndex];
    
    setEditingAction({
      stepId,
      action: { ...action },
      actionIndex
    });
  };
  
  // Add a new action to a step
  const handleAddAction = (stepId: string) => {
    if (!automation.workflowSteps) return;
    
    const step = automation.workflowSteps.find(s => s.id === stepId);
    if (!step) return;
    
    // Create default action
    const newAction: Action = {
      id: uuidv4(),
      type: ActionType.SEND_MESSAGE,
      name: 'Nueva acción',
      order: step.actions.length,
      config: {
        channel: 'whatsapp',
        messageType: 'text',
        content: ''
      }
    };
    
    setEditingAction({
      stepId,
      action: newAction,
      actionIndex: null // null indicates a new action
    });
  };
  
  // Save action changes
  const handleSaveAction = () => {
    if (!editingAction || !automation.workflowSteps) return;
    
    const updatedSteps = automation.workflowSteps.map(step => {
      if (step.id === editingAction.stepId) {
        let updatedActions;
        
        if (editingAction.actionIndex !== null) {
          // Update existing action
          updatedActions = [...step.actions];
          updatedActions[editingAction.actionIndex] = editingAction.action;
        } else {
          // Add new action
          updatedActions = [...step.actions, editingAction.action];
        }
        
        return {
          ...step,
          actions: updatedActions
        };
      }
      return step;
    });
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: updatedSteps
    };
    
    onChange(updatedAutomation);
    setEditingAction(null);
  };
  
  // Cancel action editing
  const handleCancelEditAction = () => {
    setEditingAction(null);
  };
  
  // Delete an action
  const handleDeleteAction = (stepId: string, actionIndex: number) => {
    if (!automation.workflowSteps) return;
    
    const updatedSteps = automation.workflowSteps.map(step => {
      if (step.id === stepId) {
        const updatedActions = [...step.actions];
        updatedActions.splice(actionIndex, 1);
        
        // Reorder actions
        const reorderedActions = updatedActions.map((action, idx) => ({
          ...action,
          order: idx
        }));
        
        return {
          ...step,
          actions: reorderedActions
        };
      }
      return step;
    });
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: updatedSteps
    };
    
    onChange(updatedAutomation);
  };
  
  // Move an action up or down within a step
  const handleMoveAction = (stepId: string, actionIndex: number, direction: 'up' | 'down') => {
    if (!automation.workflowSteps) return;
    
    const step = automation.workflowSteps.find(s => s.id === stepId);
    if (!step) return;
    
    if (
      (direction === 'up' && actionIndex === 0) ||
      (direction === 'down' && actionIndex === step.actions.length - 1)
    ) {
      return;
    }
    
    const updatedSteps = automation.workflowSteps.map(s => {
      if (s.id === stepId) {
        const updatedActions = [...s.actions];
        const targetIndex = direction === 'up' ? actionIndex - 1 : actionIndex + 1;
        
        // Swap actions
        [updatedActions[actionIndex], updatedActions[targetIndex]] = 
          [updatedActions[targetIndex], updatedActions[actionIndex]];
        
        // Update order property
        const reorderedActions = updatedActions.map((action, idx) => ({
          ...action,
          order: idx
        }));
        
        return {
          ...s,
          actions: reorderedActions
        };
      }
      return s;
    });
    
    const updatedAutomation: Automation = {
      ...automation,
      workflowSteps: updatedSteps
    };
    
    onChange(updatedAutomation);
  };
  
  // Get connection targets for a given source step
  const getConnectionTargets = (sourceStepId: string) => {
    if (!automation.workflowConnections) return [];
    
    return automation.workflowConnections
      .filter(conn => conn.sourceStepId === sourceStepId)
      .map(conn => {
        const targetStep = automation.workflowSteps?.find(s => s.id === conn.targetStepId);
        return {
          connection: conn,
          targetStep
        };
      });
  };
  
  // Render connection badges for a step
  const renderConnectionBadges = (step: WorkflowStep) => {
    const connections = getConnectionTargets(step.id);
    
    if (connections.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {connections.map(({ connection, targetStep }) => (
          <div 
            key={connection.id}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
          >
            <span className="mr-1">→</span>
            {targetStep?.name || 'Paso desconocido'}
            
            {connection.type !== WorkflowConnectionType.SEQUENCE && (
              <span className="ml-1 text-xs px-1 bg-blue-200 rounded">
                {connection.type === WorkflowConnectionType.BRANCH ? 'Condición' :
                 connection.type === WorkflowConnectionType.PARALLEL ? 'Paralelo' :
                 connection.type === WorkflowConnectionType.LOOP ? 'Bucle' : 'Espera'}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // If workflow mode is not enabled, show toggle option
  if (!automation.workflowEnabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <LightBulbIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">
              Modo de workflow avanzado no activado
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                El modo workflow te permite crear flujos de trabajo complejos con múltiples pasos,
                bifurcaciones condicionales, bucles y mucho más. Actualizar a este modo convertirá
                tus acciones actuales en un flujo visual.
              </p>
            </div>
            <div className="mt-4">
              <Button 
                variant="primary"
                onClick={handleToggleWorkflowMode}
              >
                <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                Activar Modo Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If editing a step
  if (editingStepId && editingStep) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Editar Paso</h3>
          <button
            type="button"
            onClick={handleCancelEditStep}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="stepName" className="block text-sm font-medium text-gray-700">
              Nombre del Paso
            </label>
            <input
              type="text"
              id="stepName"
              value={editingStep.name}
              onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="stepDescription" className="block text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <textarea
              id="stepDescription"
              value={editingStep.description || ''}
              onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {!editingStep.isEndStep && automation.initialStepId !== editingStepId && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isEndStep"
                checked={!!editingStep.isEndStep}
                onChange={(e) => setEditingStep({ ...editingStep, isEndStep: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isEndStep" className="ml-2 block text-sm text-gray-900">
                Este es un paso final (termina el workflow)
              </label>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={handleCancelEditStep}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={handleSaveStep}
          >
            Guardar Paso
          </Button>
        </div>
      </div>
    );
  }
  
  // If editing an action
  if (editingAction) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {editingAction.actionIndex !== null ? 'Editar Acción' : 'Nueva Acción'}
          </h3>
          <button
            type="button"
            onClick={handleCancelEditAction}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <ActionConfig
          action={editingAction.action}
          onChange={(updatedAction) => setEditingAction({
            ...editingAction,
            action: updatedAction
          })}
        />
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={handleCancelEditAction}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={handleSaveAction}
          >
            {editingAction.actionIndex !== null ? 'Actualizar' : 'Añadir'}
          </Button>
        </div>
      </div>
    );
  }
  
  // If creating a connection
  if (creatingConnection) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Crear Conexión</h3>
          <button
            type="button"
            onClick={handleCancelConnection}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paso de Origen
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm">
              {automation.workflowSteps?.find(s => s.id === creatingConnection.sourceStepId)?.name || 'Paso Desconocido'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Conexión
            </label>
            <select
              value={creatingConnection.connectionType}
              onChange={(e) => handleConnectionTypeChange(e.target.value as WorkflowConnectionType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={WorkflowConnectionType.SEQUENCE}>Secuencial (Siempre continúa)</option>
              <option value={WorkflowConnectionType.BRANCH}>Condicional (Si se cumple condición)</option>
              <option value={WorkflowConnectionType.PARALLEL}>Paralelo (Ejecutar simultáneamente)</option>
              <option value={WorkflowConnectionType.LOOP}>Bucle (Repetir hasta condición)</option>
              <option value={WorkflowConnectionType.WAIT_UNTIL}>Esperar Hasta (Continuar cuando se cumpla)</option>
            </select>
          </div>
          
          {/* Conditional settings */}
          {(creatingConnection.connectionType === WorkflowConnectionType.BRANCH ||
            creatingConnection.connectionType === WorkflowConnectionType.LOOP ||
            creatingConnection.connectionType === WorkflowConnectionType.WAIT_UNTIL) && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Condiciones
                </label>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleAddConditionToConnection}
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Añadir
                </Button>
              </div>
              
              {creatingConnection.conditions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay condiciones. Añade al menos una condición para este tipo de conexión.
                </p>
              ) : (
                <div className="space-y-3">
                  {creatingConnection.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Nombre del campo"
                        value={condition.field}
                        onChange={(e) => handleUpdateConditionInConnection(index, 'field', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <select
                        value={condition.operator}
                        onChange={(e) => handleUpdateConditionInConnection(index, 'operator', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="equals">es igual a</option>
                        <option value="notEquals">no es igual a</option>
                        <option value="contains">contiene</option>
                        <option value="notContains">no contiene</option>
                        <option value="greaterThan">es mayor que</option>
                        <option value="lessThan">es menor que</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Valor"
                        value={condition.value as string}
                        onChange={(e) => handleUpdateConditionInConnection(index, 'value', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleRemoveConditionFromConnection(index)}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paso de Destino
            </label>
            <select
              value={creatingConnection.targetStepId || ''}
              onChange={(e) => setCreatingConnection({
                ...creatingConnection,
                targetStepId: e.target.value
              })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Selecciona un paso de destino</option>
              {automation.workflowSteps?.filter(step => 
                step.id !== creatingConnection.sourceStepId
              ).map(step => (
                <option key={step.id} value={step.id}>
                  {step.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={handleCancelConnection}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              if (creatingConnection.targetStepId) {
                handleCompleteConnection(creatingConnection.targetStepId);
              } else {
                alert('Debes seleccionar un paso de destino.');
              }
            }}
            disabled={!creatingConnection.targetStepId}
          >
            Crear Conexión
          </Button>
        </div>
      </div>
    );
  }
  
  // Normal workflow view
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900 mr-3">Modo Workflow</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activado
          </span>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleToggleWorkflowMode}
            size="sm"
          >
            Desactivar Workflow
          </Button>
          
          <Button
            variant="primary"
            onClick={handleAddStep}
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Añadir Paso
          </Button>
        </div>
      </div>
      
      {(!automation.workflowSteps || automation.workflowSteps.length === 0) ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <LightBulbIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">
            No hay pasos definidos en este workflow. Añade un paso para comenzar.
          </p>
          <Button
            variant="primary"
            onClick={handleAddStep}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Añadir Primer Paso
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Initial step */}
          {automation.initialStepId && (
            <WorkflowStepCard
              step={automation.workflowSteps.find(s => s.id === automation.initialStepId)!}
              isFirst
              onEdit={handleEditStep}
              onDelete={handleDeleteStep}
              onAddAction={handleAddAction}
              onEditAction={handleEditAction}
              onDeleteAction={handleDeleteAction}
              onMoveAction={handleMoveAction}
              onAddConnection={handleAddConnection}
            />
          )}
          
          {/* Other steps (excluding initial and end steps) */}
          {automation.workflowSteps
            .filter(step => 
              step.id !== automation.initialStepId && !step.isEndStep
            )
            .map(step => (
              <WorkflowStepCard
                key={step.id}
                step={step}
                onEdit={handleEditStep}
                onDelete={handleDeleteStep}
                onAddAction={handleAddAction}
                onEditAction={handleEditAction}
                onDeleteAction={handleDeleteAction}
                onMoveAction={handleMoveAction}
                onAddConnection={handleAddConnection}
              />
            ))}
          
          {/* End steps */}
          {automation.workflowSteps
            .filter(step => step.isEndStep)
            .map(step => (
              <WorkflowStepCard
                key={step.id}
                step={step}
                isLast
                onEdit={handleEditStep}
                onDelete={handleDeleteStep}
                onAddAction={handleAddAction}
                onEditAction={handleEditAction}
                onDeleteAction={handleDeleteAction}
                onMoveAction={handleMoveAction}
                onAddConnection={handleAddConnection}
              />
            ))}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          El modo workflow te permite crear flujos complejos. Conecta los pasos para definir el
          orden de ejecución y añade condiciones para crear bifurcaciones en el flujo.
        </p>
      </div>
    </div>
  );
};

export default WorkflowBuilder;