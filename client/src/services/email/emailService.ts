import axios from 'axios';
import { 
  CampaignStatus, 
  CampaignType, 
  EmailCampaign, 
  EmailTemplate, 
  AudienceSegment 
} from './types';

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

// Email Service for handling all email campaign related API calls
class EmailService {
  // --- CAMPAIGNS ---
  
  // Get all campaigns for an organization
  async getCampaignsByOrganization(organizationId: string): Promise<EmailCampaign[]> {
    try {
      const response = await axios.get<ApiResponse<EmailCampaign[]>>(
        `${API_URL}/email/campaigns/organization/${organizationId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch campaigns');
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      throw error;
    }
  }

  // Get a single campaign by ID
  async getCampaignById(campaignId: string): Promise<EmailCampaign> {
    try {
      const response = await axios.get<ApiResponse<EmailCampaign>>(
        `${API_URL}/email/campaigns/${campaignId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch campaign');
    } catch (error) {
      console.error('Error fetching email campaign:', error);
      throw error;
    }
  }

  // Create a new campaign
  async createCampaign(campaign: EmailCampaign): Promise<EmailCampaign> {
    try {
      const response = await axios.post<ApiResponse<EmailCampaign>>(
        `${API_URL}/email/campaigns`,
        campaign
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create campaign');
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }

  // Update an existing campaign
  async updateCampaign(campaign: EmailCampaign): Promise<EmailCampaign> {
    if (!campaign.id) {
      throw new Error('Campaign ID is required for updates');
    }
    
    try {
      const response = await axios.put<ApiResponse<EmailCampaign>>(
        `${API_URL}/email/campaigns/${campaign.id}`,
        campaign
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update campaign');
    } catch (error) {
      console.error('Error updating email campaign:', error);
      throw error;
    }
  }

  // Delete a campaign
  async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<any>>(
        `${API_URL}/email/campaigns/${campaignId}`
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error deleting email campaign:', error);
      throw error;
    }
  }

  // Schedule a campaign
  async scheduleCampaign(campaignId: string, sendDate: Date): Promise<EmailCampaign> {
    try {
      const response = await axios.post<ApiResponse<EmailCampaign>>(
        `${API_URL}/email/campaigns/${campaignId}/schedule`,
        { sendDate }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to schedule campaign');
    } catch (error) {
      console.error('Error scheduling email campaign:', error);
      throw error;
    }
  }

  // Update campaign status
  async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<EmailCampaign> {
    try {
      const response = await axios.patch<ApiResponse<EmailCampaign>>(
        `${API_URL}/email/campaigns/${campaignId}/status`,
        { status }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update campaign status');
    } catch (error) {
      console.error('Error updating email campaign status:', error);
      throw error;
    }
  }

  // Get campaign stats
  async getCampaignStats(campaignId: string): Promise<any> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/email/campaigns/${campaignId}/stats`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch campaign stats');
    } catch (error) {
      console.error('Error fetching email campaign stats:', error);
      throw error;
    }
  }

  // Send test campaign
  async sendTestCampaign(campaignId: string, testEmails: string[]): Promise<boolean> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/email/campaigns/${campaignId}/test`,
        { testEmails }
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error sending test email campaign:', error);
      throw error;
    }
  }

  // Send campaign
  async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/email/campaigns/${campaignId}/send`
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error sending email campaign:', error);
      throw error;
    }
  }

  // --- TEMPLATES ---
  
  // Get all templates for an organization
  async getTemplates(organizationId?: string, category?: string): Promise<EmailTemplate[]> {
    try {
      const url = new URL(`${API_URL}/email/templates`);
      if (organizationId) {
        url.searchParams.append('organizationId', organizationId);
      }
      if (category) {
        url.searchParams.append('category', category);
      }
      
      const response = await axios.get<ApiResponse<EmailTemplate[]>>(url.toString());
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch templates');
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Create a new template
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const response = await axios.post<ApiResponse<EmailTemplate>>(
        `${API_URL}/email/templates`,
        template
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create template');
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  // --- AUDIENCE SEGMENTS ---
  
  // Get all segments for an organization
  async getSegmentsByOrganization(organizationId: string): Promise<AudienceSegment[]> {
    try {
      const response = await axios.get<ApiResponse<AudienceSegment[]>>(
        `${API_URL}/email/segments/organization/${organizationId}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch segments');
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      throw error;
    }
  }

  // Create a new segment
  async createSegment(segment: Partial<AudienceSegment>): Promise<AudienceSegment> {
    try {
      const response = await axios.post<ApiResponse<AudienceSegment>>(
        `${API_URL}/email/segments`,
        segment
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create segment');
    } catch (error) {
      console.error('Error creating audience segment:', error);
      throw error;
    }
  }

  // Get contacts count in a segment
  async getContactsInSegment(segmentId: string): Promise<number> {
    try {
      const response = await axios.get<ApiResponse<{ count: number }>>(
        `${API_URL}/email/segments/${segmentId}/contacts`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data.count;
      }
      throw new Error(response.data.message || 'Failed to fetch contacts count');
    } catch (error) {
      console.error('Error fetching contacts in segment:', error);
      throw error;
    }
  }
}

export default new EmailService();