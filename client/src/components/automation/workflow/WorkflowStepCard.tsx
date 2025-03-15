import React, { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  LinkIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { WorkflowStep, Action, ActionType } from '../types';
import AutomationActionCard from '../AutomationActionCard';

interface WorkflowStepCardProps {
  step: WorkflowStep;
  isFirst?: boolean;
  isLast?: boolean;
  onEdit: (stepId: string) => void;
  onDelete: (stepId: string) => void;
  onAddAction: (stepId: string) => void;
  onEditAction: (stepId: string, actionIndex: number) => void;
  onDeleteAction: (stepId: string, actionIndex: number) => void;
  onMoveAction: (stepId: string, actionIndex: number, direction: 'up' | 'down') => void;
  onAddConnection: (sourceStepId: string) => void;
}

const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  step,
  isFirst = false,
  isLast = false,
  onEdit,
  onDelete,
  onAddAction,
  onEditAction,
  onDeleteAction,
  onMoveAction,
  onAddConnection
}) => {
  const [expanded, setExpanded] = useState(true);

  // Get appropriate color for step card
  const getStepColor = () => {
    if (isFirst) return 'bg-green-50 border-green-200';
    if (isLast) return 'bg-purple-50 border-purple-200';
    if (step.isEndStep) return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  // Get appropriate icon for step card
  const getStepIcon = () => {
    if (isFirst) {
      return <ArrowPathIcon className="h-5 w-5 text-green-500" />;
    }
    if (isLast || step.isEndStep) {
      return <QuestionMarkCircleIcon className="h-5 w-5 text-purple-500" />;
    }
    return <LinkIcon className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className={`border ${getStepColor()} rounded-lg mb-4`}>
      {/* Step Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white">
            {getStepIcon()}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{step.name}</h3>
            {step.description && (
              <p className="text-sm text-gray-600">{step.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full hover:bg-white/50 text-gray-500"
          >
            {expanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
          
          <button
            type="button"
            onClick={() => onEdit(step.id)}
            className="p-1 rounded-full hover:bg-white/50 text-blue-500"
            title="Editar paso"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          {!isFirst && !isLast && (
            <button
              type="button"
              onClick={() => onDelete(step.id)}
              className="p-1 rounded-full hover:bg-white/50 text-red-500"
              title="Eliminar paso"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Step Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Actions Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Acciones</h4>
              <button
                type="button"
                onClick={() => onAddAction(step.id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Añadir Acción
              </button>
            </div>
            
            {step.actions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay acciones configuradas para este paso.</p>
            ) : (
              <div className="relative pl-6 space-y-3">
                {step.actions.map((action, index) => (
                  <AutomationActionCard
                    key={action.id}
                    action={action}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === step.actions.length - 1}
                    onMoveUp={() => onMoveAction(step.id, index, 'up')}
                    onMoveDown={() => onMoveAction(step.id, index, 'down')}
                    onEdit={() => onEditAction(step.id, index)}
                    onDelete={() => onDeleteAction(step.id, index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Flow Connection */}
          {!step.isEndStep && !isLast && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onAddConnection(step.id)}
                className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Conectar a otro paso
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowStepCard;