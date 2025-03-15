import { Automation } from '../../components/automation/types';
import automationService from '../../services/automation/automationService';

// Create a new automation
export const createAutomation = async (
  automation: Automation,
  setIsLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setAutomations: (value: Automation[] | ((prev: Automation[]) => Automation[])) => void,
  setActiveView: (value: string) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Call the service to create the automation
    const newAutomation = await automationService.createAutomation(automation);
    
    // Update the local state with the new automation
    setAutomations(prev => [...prev, newAutomation]);
    setActiveView('list');
  } catch (err) {
    setError('Error al crear la automatización');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

// Update an existing automation
export const updateAutomation = async (
  automation: Automation,
  setIsLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setAutomations: (value: Automation[] | ((prev: Automation[]) => Automation[])) => void,
  setActiveView: (value: string) => void
) => {
  if (!automation.id) return;
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Call the service to update the automation
    const updatedAutomation = await automationService.updateAutomation(automation);
    
    // Update the local state
    setAutomations(prev => 
      prev.map(a => a.id === automation.id ? updatedAutomation : a)
    );
    
    setActiveView('list');
  } catch (err) {
    setError('Error al actualizar la automatización');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

// Delete an automation
export const deleteAutomation = async (
  automationId: string,
  setIsLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setAutomations: (value: Automation[] | ((prev: Automation[]) => Automation[])) => void
) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar esta automatización?')) {
    return;
  }
  
  try {
    setIsLoading(true);
    setError(null);
    
    // Call the service to delete the automation
    const success = await automationService.deleteAutomation(automationId);
    
    if (success) {
      // Remove from local state if the deletion was successful
      setAutomations(prev => prev.filter(a => a.id !== automationId));
    } else {
      throw new Error('No se pudo eliminar la automatización');
    }
  } catch (err) {
    setError('Error al eliminar la automatización');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

// Toggle the active state of an automation
export const toggleAutomationActive = async (
  automationId: string,
  isActive: boolean,
  setIsLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setAutomations: (value: Automation[] | ((prev: Automation[]) => Automation[])) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Call the service to activate/deactivate the automation
    const updatedAutomation = await automationService.toggleAutomationActive(automationId, isActive);
    
    // Update the local state
    setAutomations(prev => 
      prev.map(a => a.id === automationId ? updatedAutomation : a)
    );
  } catch (err) {
    setError('Error al actualizar el estado de la automatización');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

// Load automations from the API
export const loadAutomations = async (
  organizationId: string,
  setIsLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setAutomations: (automations: Automation[]) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Call the service
    const automations = await automationService.getAutomations(organizationId);
    setAutomations(automations);
  } catch (err) {
    setError('Error al cargar las automatizaciones');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};