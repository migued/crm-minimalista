import React, { useState } from 'react';
import Button from '../ui/Button';
import { PlusIcon, TrashIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { ConditionOperator } from './types';

interface Condition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

interface ConditionalBranch {
  id: string;
  name: string;
  conditions: Condition[];
  actions: any[]; // We would define action type here
}

interface ConditionalActionConfigProps {
  initialBranches?: ConditionalBranch[];
  onChange: (branches: ConditionalBranch[]) => void;
  onAddAction: (branchId: string) => void;
  availableFields: Array<{ id: string; name: string; type: 'string' | 'number' | 'boolean' | 'date' }>;
}

const ConditionalActionConfig: React.FC<ConditionalActionConfigProps> = ({
  initialBranches = [],
  onChange,
  onAddAction,
  availableFields,
}) => {
  // Initialize with at least one branch (if/else)
  const [branches, setBranches] = useState<ConditionalBranch[]>(
    initialBranches.length > 0 
      ? initialBranches 
      : [
          {
            id: `branch-${Date.now()}-1`,
            name: 'Si se cumplen las condiciones',
            conditions: [],
            actions: []
          },
          {
            id: `branch-${Date.now()}-2`,
            name: 'De lo contrario',
            conditions: [],
            actions: []
          }
        ]
  );
  
  // Active branch for editing conditions
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  
  // Add a new condition to a branch
  const handleAddCondition = (branchId: string) => {
    const updatedBranches = branches.map(branch => {
      if (branch.id === branchId) {
        return {
          ...branch,
          conditions: [
            ...branch.conditions,
            {
              field: availableFields[0]?.id || '',
              operator: ConditionOperator.EQUALS,
              value: ''
            }
          ]
        };
      }
      return branch;
    });
    
    setBranches(updatedBranches);
    onChange(updatedBranches);
  };
  
  // Remove a condition from a branch
  const handleRemoveCondition = (branchId: string, conditionIndex: number) => {
    const updatedBranches = branches.map(branch => {
      if (branch.id === branchId) {
        const newConditions = [...branch.conditions];
        newConditions.splice(conditionIndex, 1);
        return {
          ...branch,
          conditions: newConditions
        };
      }
      return branch;
    });
    
    setBranches(updatedBranches);
    onChange(updatedBranches);
  };
  
  // Update a condition
  const handleUpdateCondition = (
    branchId: string,
    conditionIndex: number,
    field: string,
    value: any
  ) => {
    const updatedBranches = branches.map(branch => {
      if (branch.id === branchId) {
        const newConditions = [...branch.conditions];
        newConditions[conditionIndex] = {
          ...newConditions[conditionIndex],
          [field]: value
        };
        return {
          ...branch,
          conditions: newConditions
        };
      }
      return branch;
    });
    
    setBranches(updatedBranches);
    onChange(updatedBranches);
  };
  
  // Add a new branch
  const handleAddBranch = () => {
    const newBranch: ConditionalBranch = {
      id: `branch-${Date.now()}-${branches.length + 1}`,
      name: `Condición ${branches.length}`,
      conditions: [],
      actions: []
    };
    
    const updatedBranches = [...branches.slice(0, -1), newBranch, branches[branches.length - 1]];
    setBranches(updatedBranches);
    onChange(updatedBranches);
  };
  
  // Remove a branch
  const handleRemoveBranch = (branchId: string) => {
    // Don't allow removing all branches, keep at least if/else
    if (branches.length <= 2) return;
    
    const updatedBranches = branches.filter(branch => branch.id !== branchId);
    setBranches(updatedBranches);
    onChange(updatedBranches);
  };
  
  // Get the operator options based on field type
  const getOperatorOptions = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    
    if (!field) return Object.values(ConditionOperator);
    
    switch (field.type) {
      case 'string':
        return [
          ConditionOperator.EQUALS,
          ConditionOperator.NOT_EQUALS,
          ConditionOperator.CONTAINS,
          ConditionOperator.NOT_CONTAINS,
          ConditionOperator.EXISTS,
          ConditionOperator.NOT_EXISTS
        ];
      case 'number':
        return [
          ConditionOperator.EQUALS,
          ConditionOperator.NOT_EQUALS,
          ConditionOperator.GREATER_THAN,
          ConditionOperator.LESS_THAN,
          ConditionOperator.EXISTS,
          ConditionOperator.NOT_EXISTS
        ];
      case 'boolean':
        return [
          ConditionOperator.EQUALS,
          ConditionOperator.NOT_EQUALS
        ];
      case 'date':
        return [
          ConditionOperator.EQUALS,
          ConditionOperator.NOT_EQUALS,
          ConditionOperator.GREATER_THAN,
          ConditionOperator.LESS_THAN,
          ConditionOperator.EXISTS,
          ConditionOperator.NOT_EXISTS
        ];
      default:
        return Object.values(ConditionOperator);
    }
  };
  
  // Get human-readable operator description
  const getOperatorLabel = (operator: ConditionOperator) => {
    switch (operator) {
      case ConditionOperator.EQUALS: return 'es igual a';
      case ConditionOperator.NOT_EQUALS: return 'no es igual a';
      case ConditionOperator.CONTAINS: return 'contiene';
      case ConditionOperator.NOT_CONTAINS: return 'no contiene';
      case ConditionOperator.GREATER_THAN: return 'es mayor que';
      case ConditionOperator.LESS_THAN: return 'es menor que';
      case ConditionOperator.EXISTS: return 'existe';
      case ConditionOperator.NOT_EXISTS: return 'no existe';
      default: return operator;
    }
  };
  
  // Render the input field based on operator and field type
  const renderValueInput = (condition: Condition, branchId: string, conditionIndex: number) => {
    const field = availableFields.find(f => f.id === condition.field);
    
    // Some operators don't need a value (EXISTS, NOT_EXISTS)
    if (condition.operator === ConditionOperator.EXISTS || condition.operator === ConditionOperator.NOT_EXISTS) {
      return null;
    }
    
    switch (field?.type) {
      case 'boolean':
        return (
          <select
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={condition.value ? 'true' : 'false'}
            onChange={(e) => handleUpdateCondition(branchId, conditionIndex, 'value', e.target.value === 'true')}
          >
            <option value="true">Verdadero</option>
            <option value="false">Falso</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={condition.value as number}
            onChange={(e) => handleUpdateCondition(branchId, conditionIndex, 'value', parseFloat(e.target.value))}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={condition.value as string}
            onChange={(e) => handleUpdateCondition(branchId, conditionIndex, 'value', e.target.value)}
          />
        );
      default:
        return (
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={condition.value as string}
            onChange={(e) => handleUpdateCondition(branchId, conditionIndex, 'value', e.target.value)}
          />
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Flujo Condicional</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleAddBranch}
          disabled={branches.length >= 5} // Limit number of branches for simplicity
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Añadir Condición
        </Button>
      </div>
      
      <div className="border border-gray-200 rounded-lg">
        {branches.map((branch, branchIndex) => {
          // Special case for the last branch (else branch)
          const isElseBranch = branchIndex === branches.length - 1;
          
          return (
            <div 
              key={branch.id}
              className={`p-4 ${branchIndex > 0 ? 'border-t border-gray-200' : ''} ${activeBranchId === branch.id ? 'bg-blue-50' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  {isElseBranch ? (
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm font-medium">De lo contrario</div>
                  ) : (
                    <>
                      <span className="text-sm font-medium mr-2">{branchIndex === 0 ? 'Si' : 'Sino, si'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveBranchId(activeBranchId === branch.id ? null : branch.id)}
                      >
                        {branch.conditions.length > 0 ? `${branch.conditions.length} condición(es)` : 'Configurar Condiciones'}
                        <ArrowsRightLeftIcon className="h-4 w-4 ml-1" />
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddAction(branch.id)}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Acción
                  </Button>
                  
                  {!isElseBranch && branches.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBranch(branch.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Conditions Editor */}
              {activeBranchId === branch.id && !isElseBranch && (
                <div className="mt-3 border border-gray-200 rounded-md p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Condiciones</h4>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleAddCondition(branch.id)}
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Añadir
                    </Button>
                  </div>
                  
                  {branch.conditions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">
                      No hay condiciones configuradas. Añade al menos una condición.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {branch.conditions.map((condition, conditionIndex) => (
                        <div key={conditionIndex} className="flex items-center space-x-2">
                          <select
                            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={condition.field}
                            onChange={(e) => handleUpdateCondition(branch.id, conditionIndex, 'field', e.target.value)}
                          >
                            {availableFields.map(field => (
                              <option key={field.id} value={field.id}>
                                {field.name}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={condition.operator}
                            onChange={(e) => handleUpdateCondition(branch.id, conditionIndex, 'operator', e.target.value as ConditionOperator)}
                          >
                            {getOperatorOptions(condition.field).map(op => (
                              <option key={op} value={op}>
                                {getOperatorLabel(op)}
                              </option>
                            ))}
                          </select>
                          
                          {renderValueInput(condition, branch.id, conditionIndex)}
                          
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => handleRemoveCondition(branch.id, conditionIndex)}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {branch.conditions.length > 1 && (
                        <div className="pt-2 text-sm text-gray-500">
                          <p>Todas las condiciones deben cumplirse (operador AND)</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions List */}
              <div className="mt-2">
                {branch.actions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay acciones configuradas para esta rama.</p>
                ) : (
                  <div className="pl-4 border-l-2 border-gray-200">
                    {branch.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="py-1 text-sm">
                        • {action.name || `Acción ${actionIndex + 1}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Configura diferentes ramas de ejecución basadas en condiciones. Las condiciones se evalúan en orden y se ejecuta la primera rama cuyas condiciones se cumplan.</p>
      </div>
    </div>
  );
};

export default ConditionalActionConfig;