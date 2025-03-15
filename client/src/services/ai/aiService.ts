import { AIAgent, AIAgentType } from '../../components/ai/AIAgentForm';
import axios from 'axios';
import { CampaignType } from '../../components/email/EmailCampaignBuilder';

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

interface AgentTemplateResponse {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  industry: string;
}

interface AIResponse {
  response: string;
  type: string;
  metadata?: any;
  requiresHumanAttention: boolean;
}

interface EmailGenerationOptions {
  type: CampaignType;
  existingSubject?: string;
  segmentName?: string;
  includeImages?: boolean;
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  callToAction?: string;
}

// AI Service for handling all AI agent related API calls
class AIService {
  // Get all AI agents for an organization
  async getAgents(organizationId: string): Promise<AIAgent[]> {
    try {
      const response = await axios.get<ApiResponse<AIAgent[]>>(
        `${API_URL}/ai/agents/organization/${organizationId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch agents');
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      throw error;
    }
  }

  // Get a single AI agent by ID
  async getAgentById(agentId: string): Promise<AIAgent> {
    try {
      const response = await axios.get<ApiResponse<AIAgent>>(
        `${API_URL}/ai/agents/${agentId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch agent');
    } catch (error) {
      console.error('Error fetching AI agent:', error);
      throw error;
    }
  }

  // Create a new AI agent
  async createAgent(agent: AIAgent): Promise<AIAgent> {
    try {
      const response = await axios.post<ApiResponse<AIAgent>>(
        `${API_URL}/ai/agents`,
        agent
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create agent');
    } catch (error) {
      console.error('Error creating AI agent:', error);
      throw error;
    }
  }

  // Update an existing AI agent
  async updateAgent(agent: AIAgent): Promise<AIAgent> {
    if (!agent.id) {
      throw new Error('Agent ID is required for updates');
    }
    
    try {
      const response = await axios.put<ApiResponse<AIAgent>>(
        `${API_URL}/ai/agents/${agent.id}`,
        agent
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update agent');
    } catch (error) {
      console.error('Error updating AI agent:', error);
      throw error;
    }
  }

  // Delete an AI agent
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<any>>(
        `${API_URL}/ai/agents/${agentId}`
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error deleting AI agent:', error);
      throw error;
    }
  }

  // Toggle AI agent active state
  async toggleAgentActive(agentId: string, isActive: boolean): Promise<AIAgent> {
    try {
      const response = await axios.patch<ApiResponse<AIAgent>>(
        `${API_URL}/ai/agents/${agentId}/toggle-active`,
        { isActive }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update agent status');
    } catch (error) {
      console.error('Error updating AI agent status:', error);
      throw error;
    }
  }

  // Get all agent templates
  async getAgentTemplates(industry?: string): Promise<AgentTemplateResponse[]> {
    try {
      const url = new URL(`${API_URL}/ai/templates`);
      if (industry) {
        url.searchParams.append('industry', industry);
      }
      
      const response = await axios.get<ApiResponse<AgentTemplateResponse[]>>(url.toString());
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch templates');
    } catch (error) {
      console.error('Error fetching AI agent templates:', error);
      throw error;
    }
  }

  // Create an agent from a template
  async createAgentFromTemplate(
    templateId: string,
    organizationId: string,
    name: string,
    customizations?: Partial<AIAgent>
  ): Promise<AIAgent> {
    try {
      const response = await axios.post<ApiResponse<AIAgent>>(
        `${API_URL}/ai/agents/from-template`,
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
      throw new Error(response.data.message || 'Failed to create agent from template');
    } catch (error) {
      console.error('Error creating AI agent from template:', error);
      throw error;
    }
  }

  // Process a message with an AI agent
  async processMessage(
    agentId: string,
    conversationId: string,
    message: string,
    includeMetadata: boolean = false
  ): Promise<AIResponse> {
    try {
      const response = await axios.post<ApiResponse<AIResponse>>(
        `${API_URL}/ai/agents/process-message`,
        {
          agentId,
          conversationId,
          message,
          includeMetadata
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to process message');
    } catch (error) {
      console.error('Error processing message with AI agent:', error);
      throw error;
    }
  }

  // Evaluate if a message should trigger an AI agent
  async evaluateAgentTrigger(
    organizationId: string,
    message: string,
    channel: string,
    contactId?: string
  ): Promise<{ triggered: boolean; agent?: { id: string; name: string; type: AIAgentType } }> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/ai/agents/evaluate-trigger`,
        {
          organizationId,
          message,
          channel,
          contactId
        }
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to evaluate trigger');
    } catch (error) {
      console.error('Error evaluating agent trigger:', error);
      throw error;
    }
  }

  // Analyze text with AI
  async analyzeText(text: string): Promise<{
    entities: Record<string, string[]>;
    sentiment: number;
    intent: string;
    summary: string;
  }> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/ai/analyze-text`,
        { text }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to analyze text');
    } catch (error) {
      console.error('Error analyzing text with AI:', error);
      throw error;
    }
  }

  // Summarize a conversation
  async summarizeConversation(
    conversationId: string,
    maxLength?: number
  ): Promise<{ summary: string; conversationId: string }> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/ai/summarize-conversation`,
        {
          conversationId,
          maxLength
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to summarize conversation');
    } catch (error) {
      console.error('Error summarizing conversation with AI:', error);
      throw error;
    }
  }

  // Generate email content with AI
  async generateEmailContent(
    agentId: string,
    prompt: string,
    options: EmailGenerationOptions
  ): Promise<{ subject: string; content: string; }> {
    try {
      const response = await axios.post<ApiResponse<{ subject: string; content: string; }>>(
        `${API_URL}/ai/generate-email`,
        {
          agentId,
          prompt,
          options
        }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to generate email content');
    } catch (error) {
      console.error('Error generating email content with AI:', error);
      throw error;
    }
  }

  // Get AI agent performance analytics
  async getAgentAnalytics(
    agentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    messagesProcessed: number;
    averageResponseTime: number;
    handoffRate: number;
    userSatisfactionScore: number;
    topIntents: { intent: string; count: number }[];
    dailyActivity: { date: string; count: number }[];
    performanceByHour: { hour: number; averageResponseTime: number; count: number }[];
  }> {
    try {
      const url = new URL(`${API_URL}/ai/agents/${agentId}/analytics`);
      if (startDate) {
        url.searchParams.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        url.searchParams.append('endDate', endDate.toISOString());
      }
      
      const response = await axios.get<ApiResponse<any>>(url.toString());
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch agent analytics');
    } catch (error) {
      console.error('Error fetching AI agent analytics:', error);
      throw error;
    }
  }
}

export default new AIService();