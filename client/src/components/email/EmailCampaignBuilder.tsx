import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  DocumentDuplicateIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  PaperAirplaneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AIAgent } from '../ai/AIAgentForm';

// Email campaign types
export enum CampaignType {
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  ANNOUNCEMENT = 'announcement',
  FOLLOW_UP = 'follow_up',
  AUTOMATED = 'automated',
  SURVEY = 'survey'
}

// Email campaign status
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

// Email template type
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  thumbnailUrl?: string;
  category: string;
}

// Audience segment type
export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: {
    field: string;
    operator: string;
    value: any;
  }[];
}

// Email campaign type
export interface EmailCampaign {
  id?: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  subject: string;
  content: string;
  templateId?: string;
  segmentId: string;
  segmentName?: string;
  schedule?: {
    sendDate: Date;
    sendTime?: string;
    timezone?: string;
    recurringType?: 'none' | 'daily' | 'weekly' | 'monthly';
    recurringInterval?: number;
    endDate?: Date;
  };
  organizationId: string;
  createdAt?: Date;
  updatedAt?: Date;
  sentAt?: Date;
  stats?: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
  };
  aiGenerated?: boolean;
  aiAgentId?: string;
}

interface EmailCampaignBuilderProps {
  campaign?: EmailCampaign;
  onSave: (campaign: EmailCampaign) => void;
  onCancel: () => void;
  isLoading?: boolean;
  availableTemplates?: EmailTemplate[];
  availableSegments?: AudienceSegment[];
  availableAIAgents?: AIAgent[];
}

const DEFAULT_CAMPAIGN: EmailCampaign = {
  name: '',
  type: CampaignType.NEWSLETTER,
  status: CampaignStatus.DRAFT,
  subject: '',
  content: '',
  segmentId: '',
  organizationId: 'org-123', // This would come from app context
  schedule: {
    sendDate: new Date(),
    sendTime: '09:00',
    timezone: 'America/Mexico_City',
    recurringType: 'none'
  }
};

const EmailCampaignBuilder: React.FC<EmailCampaignBuilderProps> = ({
  campaign = DEFAULT_CAMPAIGN,
  onSave,
  onCancel,
  isLoading = false,
  availableTemplates = [],
  availableSegments = [],
  availableAIAgents = []
}) => {
  // Campaign state
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign>(campaign);
  const [activeTab, setActiveTab] = useState<'content' | 'audience' | 'schedule'>('content');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useTemplate, setUseTemplate] = useState<boolean>(!!campaign.templateId);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    campaign.templateId 
      ? availableTemplates.find(t => t.id === campaign.templateId) || null 
      : null
  );
  const [useAI, setUseAI] = useState<boolean>(!!campaign.aiGenerated);
  const [selectedAIAgent, setSelectedAIAgent] = useState<AIAgent | null>(
    campaign.aiAgentId
      ? availableAIAgents.find(a => a.id === campaign.aiAgentId) || null
      : null
  );
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);

  // Handle basic field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle schedule field changes
  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCampaign(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        [name]: value
      }
    }));
  };

  // Handle date selection for scheduling
  const handleDateChange = (date: Date) => {
    setCurrentCampaign(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        sendDate: date
      }
    }));
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate | null) => {
    setSelectedTemplate(template);
    
    if (template) {
      setCurrentCampaign(prev => ({
        ...prev,
        templateId: template.id,
        subject: template.subject,
        content: template.content
      }));
    } else {
      setCurrentCampaign(prev => ({
        ...prev,
        templateId: undefined
      }));
    }
  };

  // Handle segment selection
  const handleSegmentSelect = (segmentId: string) => {
    const segment = availableSegments.find(s => s.id === segmentId);
    
    setCurrentCampaign(prev => ({
      ...prev,
      segmentId,
      segmentName: segment?.name
    }));
  };

  // Generate email content with AI
  const generateContentWithAI = async () => {
    if (!selectedAIAgent || !aiPrompt.trim()) {
      setErrors(prev => ({
        ...prev,
        aiPrompt: 'Se requiere un agente de IA y un prompt para generar contenido'
      }));
      return;
    }

    setIsGeneratingContent(true);
    setErrors({});

    try {
      // Import aiService
      const aiService = (await import('../../services/ai/aiService')).default;
      
      // Get the selected segment name if segmentId is set
      const segmentName = currentCampaign.segmentId 
        ? availableSegments.find(s => s.id === currentCampaign.segmentId)?.name 
        : undefined;
      
      // Call the AI service
      const generatedContent = await aiService.generateEmailContent(
        selectedAIAgent.id, 
        aiPrompt,
        { 
          type: currentCampaign.type,
          existingSubject: currentCampaign.subject,
          segmentName: segmentName,
          tone: 'professional',
          includeImages: true,
          callToAction: 'Comprar ahora'
        }
      );
      
      // If we're in development/test mode and the API is not available,
      // fall back to mock response for demonstration
      if (!generatedContent) {
        // Demo generated content based on prompt and campaign type
        const sampleSubject = `${currentCampaign.type === CampaignType.NEWSLETTER ? 'Boletín' : 
                                currentCampaign.type === CampaignType.PROMOTIONAL ? 'Oferta Especial' :
                                currentCampaign.type === CampaignType.ANNOUNCEMENT ? 'Anuncio Importante' :
                                currentCampaign.type === CampaignType.FOLLOW_UP ? 'Seguimiento' :
                                currentCampaign.type === CampaignType.SURVEY ? 'Encuesta de Satisfacción' :
                                'Mensaje'}: ${aiPrompt.substring(0, 30)}...`;
        
        const sampleContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #2c3e50;">${sampleSubject}</h1>
  </div>
  <div style="padding: 20px; background-color: #ffffff; border: 1px solid #eaeaea;">
    <p>Estimado cliente,</p>
    <p>${aiPrompt}</p>
    <p>Esta es una demostración de contenido generado automáticamente basado en su solicitud. En una implementación real, utilizaríamos los modelos de IA más avanzados para crear contenido personalizado y atractivo para su campaña de correo electrónico.</p>
    <p>El contenido se adaptaría al tipo de campaña (${currentCampaign.type}) y al segmento de audiencia seleccionado${segmentName ? ` (${segmentName})` : ''}.</p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="#" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Botón de Acción</a>
    </div>
  </div>
  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;">
    <p>© 2025 Su Empresa. Todos los derechos reservados.</p>
    <p><a href="#" style="color: #3498db;">Cancelar suscripción</a> | <a href="#" style="color: #3498db;">Ver en navegador</a></p>
  </div>
</div>
        `;
        
        setCurrentCampaign(prev => ({
          ...prev,
          subject: sampleSubject,
          content: sampleContent,
          aiGenerated: true,
          aiAgentId: selectedAIAgent.id
        }));
      } else {
        // Use the content from the AI service
        setCurrentCampaign(prev => ({
          ...prev,
          subject: generatedContent.subject,
          content: generatedContent.content,
          aiGenerated: true,
          aiAgentId: selectedAIAgent.id
        }));
      }
    } catch (error) {
      console.error('Error generating content with AI:', error);
      setErrors(prev => ({
        ...prev,
        ai: 'Error al generar contenido con IA. Por favor, intenta de nuevo.'
      }));
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentCampaign.name.trim()) {
      newErrors.name = 'El nombre de la campaña es obligatorio';
    }
    
    if (!currentCampaign.subject.trim()) {
      newErrors.subject = 'El asunto del correo es obligatorio';
    }
    
    if (!currentCampaign.content.trim()) {
      newErrors.content = 'El contenido del correo es obligatorio';
    }
    
    if (!currentCampaign.segmentId) {
      newErrors.segmentId = 'Debes seleccionar un segmento de audiencia';
    }
    
    if (currentCampaign.status === CampaignStatus.SCHEDULED) {
      if (!currentCampaign.schedule?.sendDate) {
        newErrors.sendDate = 'La fecha de envío es obligatoria';
      }
      
      if (!currentCampaign.schedule?.sendTime) {
        newErrors.sendTime = 'La hora de envío es obligatoria';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(currentCampaign);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {campaign.id ? 'Editar Campaña de Email' : 'Crear Nueva Campaña de Email'}
            </h2>
            
            {/* Basic information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Campaña *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentCampaign.name}
                  onChange={handleChange}
                  className={`w-full border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ej.: Newsletter Mayo 2025"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Campaña *
                </label>
                <select
                  id="type"
                  name="type"
                  value={currentCampaign.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={CampaignType.NEWSLETTER}>Boletín (Newsletter)</option>
                  <option value={CampaignType.PROMOTIONAL}>Promocional</option>
                  <option value={CampaignType.ANNOUNCEMENT}>Anuncio</option>
                  <option value={CampaignType.FOLLOW_UP}>Seguimiento</option>
                  <option value={CampaignType.AUTOMATED}>Automatizado</option>
                  <option value={CampaignType.SURVEY}>Encuesta</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={currentCampaign.description || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe brevemente el propósito de esta campaña..."
              />
            </div>
            
            {/* Tabs for content, audience, schedule */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  type="button"
                  className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                    activeTab === 'content'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('content')}
                >
                  <DocumentTextIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                  Contenido
                </button>
                <button
                  type="button"
                  className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                    activeTab === 'audience'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('audience')}
                >
                  <UsersIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                  Audiencia
                </button>
                <button
                  type="button"
                  className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                    activeTab === 'schedule'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <CalendarIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
                  Programación
                </button>
              </nav>
            </div>
            
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div className="flex space-x-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useTemplate"
                      checked={useTemplate}
                      onChange={(e) => {
                        setUseTemplate(e.target.checked);
                        if (!e.target.checked) {
                          handleTemplateSelect(null);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="useTemplate" className="ml-2 block text-sm text-gray-700">
                      Usar plantilla
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useAI"
                      checked={useAI}
                      onChange={(e) => {
                        setUseAI(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedAIAgent(null);
                          setAiPrompt('');
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="useAI" className="ml-2 block text-sm text-gray-700">
                      Generar con IA
                    </label>
                  </div>
                </div>
                
                {/* Template selector */}
                {useTemplate && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Plantilla</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                      {availableTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`border ${
                            selectedTemplate?.id === template.id
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200'
                          } rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          {template.thumbnailUrl ? (
                            <div className="h-24 bg-gray-100 overflow-hidden">
                              <img
                                src={template.thumbnailUrl}
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-24 bg-gray-100 flex items-center justify-center">
                              <DocumentDuplicateIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{template.name}</p>
                            <p className="text-xs text-gray-500 truncate">{template.category}</p>
                          </div>
                        </div>
                      ))}
                      
                      {availableTemplates.length === 0 && (
                        <div className="col-span-3 p-4 text-center text-gray-500">
                          No hay plantillas disponibles
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* AI content generation */}
                {useAI && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Generar Contenido con IA</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="aiAgent" className="block text-sm font-medium text-gray-700 mb-1">
                          Agente de IA
                        </label>
                        <select
                          id="aiAgent"
                          value={selectedAIAgent?.id || ''}
                          onChange={(e) => {
                            const agent = availableAIAgents.find(a => a.id === e.target.value);
                            setSelectedAIAgent(agent || null);
                          }}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar agente</option>
                          {availableAIAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                          Instrucciones para la IA
                        </label>
                        <textarea
                          id="aiPrompt"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                          className={`w-full border ${
                            errors.aiPrompt ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Ej.: Crear una campaña de promoción para nuestros productos de verano con descuentos del 20%. Incluir imágenes de playa y lenguaje fresco."
                        />
                        {errors.aiPrompt && <p className="mt-1 text-sm text-red-500">{errors.aiPrompt}</p>}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          type="button"
                          onClick={generateContentWithAI}
                          disabled={isGeneratingContent || !selectedAIAgent || !aiPrompt.trim()}
                        >
                          {isGeneratingContent ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generando...
                            </>
                          ) : (
                            <>Generar Contenido</>
                          )}
                        </Button>
                      </div>
                      
                      {errors.ai && <p className="mt-1 text-sm text-red-500">{errors.ai}</p>}
                    </div>
                  </div>
                )}
                
                {/* Email subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto del Email *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={currentCampaign.subject}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ej.: Nuevas ofertas de verano - ¡Descuentos exclusivos!"
                  />
                  {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                </div>
                
                {/* Email content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido del Email *
                  </label>
                  <div className="border border-gray-300 rounded-md mb-1">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">Editor HTML</span>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {/* Preview function would go here */}}
                          >
                            Vista previa
                          </button>
                        </div>
                      </div>
                    </div>
                    <textarea
                      id="content"
                      name="content"
                      rows={12}
                      value={currentCampaign.content}
                      onChange={handleChange}
                      className={`w-full border-0 p-3 focus:outline-none focus:ring-0 font-mono text-sm ${
                        errors.content ? 'bg-red-50' : ''
                      }`}
                      placeholder="<h1>Título del Email</h1><p>Contenido del email...</p>"
                    />
                  </div>
                  {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                  <p className="text-xs text-gray-500">
                    Puedes usar HTML para dar formato a tu email. En una implementación real, aquí habría un editor WYSIWYG.
                  </p>
                </div>
              </div>
            )}
            
            {/* Audience Tab */}
            {activeTab === 'audience' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Seleccionar Segmento de Audiencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableSegments.map((segment) => (
                      <div
                        key={segment.id}
                        className={`border ${
                          currentCampaign.segmentId === segment.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        } rounded-md p-4 cursor-pointer hover:bg-gray-50 transition-colors`}
                        onClick={() => handleSegmentSelect(segment.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{segment.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {segment.count.toLocaleString()} contactos
                          </span>
                        </div>
                        
                        {segment.criteria.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">Criterios:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {segment.criteria.map((criterion, idx) => (
                                <li key={idx}>
                                  • {criterion.field} {criterion.operator} {criterion.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {availableSegments.length === 0 && (
                      <div className="col-span-2 p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                        No hay segmentos disponibles. Debes crear un segmento de audiencia antes de enviar una campaña.
                      </div>
                    )}
                  </div>
                  {errors.segmentId && <p className="mt-1 text-sm text-red-500">{errors.segmentId}</p>}
                </div>
              </div>
            )}
            
            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado de la Campaña
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentCampaign.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={CampaignStatus.DRAFT}>Borrador</option>
                    <option value={CampaignStatus.SCHEDULED}>Programada</option>
                  </select>
                </div>
                
                {currentCampaign.status === CampaignStatus.SCHEDULED && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sendDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Envío *
                        </label>
                        <input
                          type="date"
                          id="sendDate"
                          name="sendDate"
                          value={currentCampaign.schedule?.sendDate ? new Date(currentCampaign.schedule.sendDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateChange(new Date(e.target.value))}
                          className={`w-full border ${
                            errors.sendDate ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.sendDate && <p className="mt-1 text-sm text-red-500">{errors.sendDate}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="sendTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Hora de Envío *
                        </label>
                        <input
                          type="time"
                          id="sendTime"
                          name="sendTime"
                          value={currentCampaign.schedule?.sendTime || ''}
                          onChange={handleScheduleChange}
                          className={`w-full border ${
                            errors.sendTime ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.sendTime && <p className="mt-1 text-sm text-red-500">{errors.sendTime}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                        Zona Horaria
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={currentCampaign.schedule?.timezone || 'America/Mexico_City'}
                        onChange={handleScheduleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                        <option value="America/New_York">Nueva York (UTC-5)</option>
                        <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
                        <option value="Europe/Madrid">Madrid (UTC+1)</option>
                        <option value="America/Bogota">Bogotá (UTC-5)</option>
                        <option value="America/Santiago">Santiago (UTC-4)</option>
                        <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="recurringType" className="block text-sm font-medium text-gray-700 mb-1">
                        Recurrencia
                      </label>
                      <select
                        id="recurringType"
                        name="recurringType"
                        value={currentCampaign.schedule?.recurringType || 'none'}
                        onChange={handleScheduleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="none">Una sola vez</option>
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensualmente</option>
                      </select>
                    </div>
                    
                    {currentCampaign.schedule?.recurringType !== 'none' && (
                      <div>
                        <label htmlFor="recurringInterval" className="block text-sm font-medium text-gray-700 mb-1">
                          Intervalo de Recurrencia
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            id="recurringInterval"
                            name="recurringInterval"
                            min={1}
                            max={31}
                            value={currentCampaign.schedule?.recurringInterval || 1}
                            onChange={handleScheduleChange}
                            className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {currentCampaign.schedule?.recurringType === 'daily' && 'día(s)'}
                            {currentCampaign.schedule?.recurringType === 'weekly' && 'semana(s)'}
                            {currentCampaign.schedule?.recurringType === 'monthly' && 'mes(es)'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {currentCampaign.schedule?.recurringType !== 'none' && (
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Finalización
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={currentCampaign.schedule?.endDate ? new Date(currentCampaign.schedule.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            setCurrentCampaign(prev => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule!,
                                endDate: date
                              }
                            }));
                          }}
                          min={currentCampaign.schedule?.sendDate ? new Date(currentCampaign.schedule.sendDate).toISOString().split('T')[0] : ''}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Dejar en blanco para que la campaña se repita indefinidamente
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setCurrentCampaign({
                  ...currentCampaign,
                  status: CampaignStatus.DRAFT
                });
                handleSubmit(new Event('submit') as any);
              }}
              disabled={isLoading}
            >
              Guardar como Borrador
            </Button>
            
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : currentCampaign.status === CampaignStatus.SCHEDULED ? (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                  Programar Envío
                </>
              ) : (
                'Guardar Campaña'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailCampaignBuilder;