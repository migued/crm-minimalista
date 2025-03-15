import { Automation, Action, Trigger, TriggerEventType, ActionType } from '../../components/automation/types';
import axios from 'axios';

// Base API URL - would come from environment variables in a real application
const API_URL = '/api';

// Define response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

interface AutomationExecutionResult {
  automationId: string;
  automationName: string;
  success: boolean;
  executedActions: number;
  results: any[];
  error?: string;
}

// Automation Service for handling all automation related API calls
class AutomationService {
  // Get all automations for an organization
  async getAutomations(organizationId: string): Promise<Automation[]> {
    try {
      const response = await axios.get<ApiResponse<Automation[]>>(
        `${API_URL}/automations/organization/${organizationId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automations');
    } catch (error) {
      console.error('Error fetching automations:', error);
      throw error;
    }
  }

  // Get a single automation by ID
  async getAutomationById(automationId: string): Promise<Automation> {
    try {
      const response = await axios.get<ApiResponse<Automation>>(
        `${API_URL}/automations/${automationId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automation');
    } catch (error) {
      console.error('Error fetching automation:', error);
      throw error;
    }
  }

  // Create a new automation
  async createAutomation(automation: Automation): Promise<Automation> {
    try {
      const response = await axios.post<ApiResponse<Automation>>(
        `${API_URL}/automations`,
        automation
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create automation');
    } catch (error) {
      console.error('Error creating automation:', error);
      throw error;
    }
  }

  // Update an existing automation
  async updateAutomation(automation: Automation): Promise<Automation> {
    if (!automation.id) {
      throw new Error('Automation ID is required for updates');
    }
    
    try {
      const response = await axios.put<ApiResponse<Automation>>(
        `${API_URL}/automations/${automation.id}`,
        automation
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update automation');
    } catch (error) {
      console.error('Error updating automation:', error);
      throw error;
    }
  }

  // Delete an automation
  async deleteAutomation(automationId: string): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<any>>(
        `${API_URL}/automations/${automationId}`
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error deleting automation:', error);
      throw error;
    }
  }

  // Toggle automation active state
  async toggleAutomationActive(automationId: string, isActive: boolean): Promise<Automation> {
    try {
      const response = await axios.patch<ApiResponse<Automation>>(
        `${API_URL}/automations/${automationId}/toggle-active`,
        { isActive }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update automation status');
    } catch (error) {
      console.error('Error updating automation status:', error);
      throw error;
    }
  }

  // Manually trigger an automation
  async triggerAutomation(
    automationId: string,
    payload: Record<string, any>
  ): Promise<AutomationExecutionResult> {
    try {
      const response = await axios.post<ApiResponse<AutomationExecutionResult>>(
        `${API_URL}/automations/${automationId}/trigger`,
        { payload }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to trigger automation');
    } catch (error) {
      console.error('Error triggering automation:', error);
      throw error;
    }
  }

  // Get automation execution history
  async getAutomationHistory(
    automationId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    executions: {
      id: string;
      automationId: string;
      timestamp: Date;
      success: boolean;
      executedActions: number;
      error?: string;
    }[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/automations/${automationId}/history?page=${page}&limit=${limit}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automation history');
    } catch (error) {
      console.error('Error fetching automation history:', error);
      throw error;
    }
  }

  // Get available triggers and actions
  async getAutomationComponents(): Promise<{
    triggers: {
      type: TriggerEventType;
      name: string;
      description: string;
      requiredFields?: string[];
      availableConditions?: string[];
    }[];
    actions: {
      type: ActionType;
      name: string;
      description: string;
      requiredConfig?: string[];
    }[];
  }> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/automations/components`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automation components');
    } catch (error) {
      console.error('Error fetching automation components:', error);
      throw error;
    }
  }

  // Get automation templates
  async getAutomationTemplates(category?: string): Promise<{
    id: string;
    name: string;
    description: string;
    category: string;
    trigger: Trigger;
    actions: Action[];
  }[]> {
    try {
      const url = new URL(`${API_URL}/automations/templates`);
      if (category) {
        url.searchParams.append('category', category);
      }
      
      const response = await axios.get<ApiResponse<any>>(url.toString());
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automation templates');
    } catch (error) {
      console.error('Error fetching automation templates:', error);
      throw error;
    }
  }

  // Create automation from template
  async createAutomationFromTemplate(
    templateId: string,
    organizationId: string,
    name: string,
    customizations?: Partial<Automation>
  ): Promise<Automation> {
    try {
      const response = await axios.post<ApiResponse<Automation>>(
        `${API_URL}/automations/from-template`,
        {
          templateId,
          organizationId,
          name,
          customizations
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create automation from template');
    } catch (error) {
      console.error('Error creating automation from template:', error);
      throw error;
    }
  }

  // Clone an existing automation
  async cloneAutomation(automationId: string, newName: string): Promise<Automation> {
    try {
      const response = await axios.post<ApiResponse<Automation>>(
        `${API_URL}/automations/${automationId}/clone`,
        { name: newName }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to clone automation');
    } catch (error) {
      console.error('Error cloning automation:', error);
      throw error;
    }
  }

  // Get organization's automation stats
  async getAutomationStats(organizationId: string): Promise<{
    totalAutomations: number;
    activeAutomations: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    topAutomations: {
      id: string;
      name: string;
      executions: number;
      successRate: number;
    }[];
  }> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/automations/organization/${organizationId}/stats`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch automation stats');
    } catch (error) {
      console.error('Error fetching automation stats:', error);
      throw error;
    }
  }
}

export default new AutomationService();