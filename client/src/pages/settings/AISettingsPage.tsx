import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AIAgentForm from '../../components/ai/AIAgentForm';
import AIAgentTemplates from '../../components/ai/AIAgentTemplates';
import AIAgentTester from '../../components/ai/AIAgentTester';
import AIAgentAnalytics from '../../components/ai/AIAgentAnalytics';
import AutomationSettingsPage from './AutomationSettingsPage';
import aiService from '../../services/ai/aiService';
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon, 
  BeakerIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { AIAgent, AIAgentType, OpenAIModel } from '../../components/ai/AIAgentForm';

type ActiveView = 'list' | 'new' | 'edit' | 'templates' | 'test' | 'automations' | 'analytics';

const AISettingsPage: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAgentType, setShowAgentType] = useState('all');

  // Cargar agentes desde el API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener el organizationId del contexto o como valor predeterminado
        const organizationId = 'org-123'; // En implementación real, esto vendría del contexto de usuario
        
        // Llamar al servicio
        const agents = await aiService.getAgents(organizationId);
        setAgents(agents);
      } catch (err) {
        setError('Error al cargar los agentes de IA');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAgents();
  }, []);

  // Filtrar agentes por tipo
  const filteredAgents = agents.filter(agent => 
    showAgentType === 'all' || agent.type === showAgentType
  );

  // Crear un nuevo agente
  const handleCreateAgent = async (agent: AIAgent) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio para crear el agente
      const newAgent = await aiService.createAgent(agent);
      
      // Actualizar el estado local con el nuevo agente
      setAgents(prev => [...prev, newAgent]);
      setActiveView('list');
    } catch (err) {
      setError('Error al crear el agente de IA');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar un agente existente
  const handleUpdateAgent = async (agent: AIAgent) => {
    if (!agent.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio para actualizar el agente
      const updatedAgent = await aiService.updateAgent(agent);
      
      // Actualizar en el estado local
      setAgents(prev => 
        prev.map(a => a.id === agent.id ? updatedAgent : a)
      );
      
      setActiveView('list');
    } catch (err) {
      setError('Error al actualizar el agente de IA');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un agente
  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este agente de IA?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio para eliminar el agente
      const success = await aiService.deleteAgent(agentId);
      
      if (success) {
        // Eliminar del estado local si la eliminación fue exitosa
        setAgents(prev => prev.filter(a => a.id !== agentId));
      } else {
        throw new Error('No se pudo eliminar el agente');
      }
    } catch (err) {
      setError('Error al eliminar el agente de IA');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar el estado activo/inactivo de un agente
  const handleToggleActive = async (agentId: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Llamar al servicio para activar/desactivar el agente
      const updatedAgent = await aiService.toggleAgentActive(agentId, isActive);
      
      // Actualizar en el estado local
      setAgents(prev => 
        prev.map(a => a.id === agentId ? updatedAgent : a)
      );
    } catch (err) {
      setError('Error al actualizar el estado del agente');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la selección de una plantilla
  const handleSelectTemplate = async (template: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // En una implementación real, esto usaría el servicio directamente
      // const newAgent = await aiService.createAgentFromTemplate(
      //   template.id,
      //   'org-123', // Esto debería venir del contexto de la aplicación
      //   template.name,
      //   {
      //     description: `Basado en plantilla: ${template.name}`,
      //     isActive: true,
      //   }
      // );

      // Mientras tanto, crear un objeto de agente desde la plantilla
      const newAgent: AIAgent = {
        name: template.name,
        description: template.description,
        type: template.type,
        organizationId: 'org-123', // Esto debería venir del contexto de la aplicación
        isActive: true,
        model: template.type === AIAgentType.CLASSIFIER ? OpenAIModel.GPT_4 : OpenAIModel.GPT_3_5,
        systemPrompt: template.systemPrompt,
        temperature: template.type === AIAgentType.CLASSIFIER ? 0.3 : 0.7,
        maxTokens: template.type === AIAgentType.CLASSIFIER ? 256 : 1024,
        triggerConditions: [{ type: 'always' }],
        handoffConditions: [{ type: 'user_request' }],
      };
      
      setSelectedAgent(newAgent);
      setActiveView('new');
    } catch (err) {
      setError('Error al cargar la plantilla');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-gray-900">Agentes de IA</h2>
                <select
                  value={showAgentType}
                  onChange={e => setShowAgentType(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value={AIAgentType.CHATBOT}>Chatbots</option>
                  <option value={AIAgentType.CLASSIFIER}>Clasificadores</option>
                  <option value={AIAgentType.SUMMARIZER}>Resumidores</option>
                  <option value={AIAgentType.TRANSLATOR}>Traductores</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView('templates')}
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Usar Plantilla
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedAgent(null);
                    setActiveView('new');
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Agente
                </Button>
              </div>
            </div>

            {isLoading && agents.length === 0 ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay agentes de IA creados</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Los agentes de IA pueden automatizar conversaciones, clasificar mensajes y más.
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => setActiveView('templates')}
                  >
                    Comenzar con una Plantilla
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAgents.map(agent => (
                  <Card key={agent.id}>
                    <div className="flex justify-between items-start p-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-gray-900 mr-2">{agent.name}</h3>
                          <Badge
                            color={agent.isActive ? 'green' : 'gray'}
                            size="sm"
                          >
                            {agent.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge color="blue" size="sm">
                            {agent.type === AIAgentType.CHATBOT && 'Chatbot'}
                            {agent.type === AIAgentType.CLASSIFIER && 'Clasificador'}
                            {agent.type === AIAgentType.SUMMARIZER && 'Resumidor'}
                            {agent.type === AIAgentType.TRANSLATOR && 'Traductor'}
                          </Badge>
                          <Badge color="purple" size="sm">
                            {agent.model}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Última actualización: {agent.updatedAt?.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveView('test');
                          }}
                          title="Probar agente"
                        >
                          <BeakerIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveView('analytics');
                          }}
                          title="Ver analíticas"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(agent.id!, !agent.isActive)}
                        >
                          {agent.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveView('edit');
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.id!)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Sección de información sobre modelos */}
            <Card>
              <Card.Header>
                <h3 className="text-sm font-medium text-gray-700">Consumo de Modelos de IA</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">Tokens Utilizados (Mes Actual):</span>
                    </div>
                    <div className="text-gray-700">
                      <span className="font-medium">45,678</span> <span className="text-xs text-gray-500">de 100,000</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <div>GPT-3.5 Turbo: <span className="text-gray-700">32,450 tokens</span></div>
                    <div>GPT-4: <span className="text-gray-700">13,228 tokens</span></div>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <p className="text-xs text-gray-500">
                  Los modelos de IA utilizan tokens para procesar texto. Un token equivale aproximadamente a 0.75 palabras en español.
                </p>
              </Card.Footer>
            </Card>
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
            
            <AIAgentForm
              agent={selectedAgent || undefined}
              onSubmit={activeView === 'edit' ? handleUpdateAgent : handleCreateAgent}
              onCancel={() => setActiveView('list')}
              isLoading={isLoading}
            />
          </div>
        );
      
      case 'templates':
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
            
            <AIAgentTemplates
              onSelectTemplate={handleSelectTemplate}
              onCancel={() => setActiveView('list')}
            />
          </div>
        );
      
      case 'test':
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
            
            {selectedAgent && (
              <AIAgentTester
                agent={selectedAgent}
                onClose={() => setActiveView('list')}
              />
            )}
          </div>
        );
      
      case 'analytics':
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
            
            {selectedAgent && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Análisis de Rendimiento: {selectedAgent.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Métricas detalladas y estadísticas de rendimiento para este agente de IA
                  </p>
                </div>
                
                <AIAgentAnalytics agent={selectedAgent} />
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IA y Automatización"
        subtitle="Configura agentes de inteligencia artificial y automatizaciones para tu CRM"
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveView(activeView === 'automations' ? 'list' : 'automations')}
            >
              {activeView === 'automations' ? (
                <>
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Ver Agentes IA
                </>
              ) : (
                <>
                  <BoltIcon className="h-4 w-4 mr-2" />
                  Ver Automatizaciones
                </>
              )}
            </Button>
          </div>
        }
      />
      
      {error && activeView !== 'automations' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {activeView === 'automations' ? <AutomationSettingsPage /> : renderContent()}
    </div>
  );
};

export default AISettingsPage;