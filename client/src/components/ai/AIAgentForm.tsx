import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Tipos de agentes de IA
export enum AIAgentType {
  CHATBOT = 'chatbot',
  CLASSIFIER = 'classifier',
  SUMMARIZER = 'summarizer',
  TRANSLATOR = 'translator',
}

// Modelos de OpenAI disponibles
export enum OpenAIModel {
  GPT_4 = 'gpt-4-turbo',
  GPT_3_5 = 'gpt-3.5-turbo',
}

// Interfaz para las condiciones de activación del agente
export interface AgentTriggerCondition {
  type: 'message_contains' | 'message_starts_with' | 'message_intent' | 'contact_tag' | 'always';
  value?: string;
  tags?: string[];
  confidence?: number;
}

// Interfaz para las condiciones de entrega a un humano
export interface HandoffCondition {
  type: 'user_request' | 'low_confidence' | 'sensitive_topic' | 'max_iterations' | 'schedule';
  value?: string | number;
  topics?: string[];
  schedule?: {
    days: number[];
    hours: { start: string; end: string };
  };
}

// Interfaz del Agente de IA
export interface AIAgent {
  id?: string;
  name: string;
  description: string;
  type: AIAgentType;
  organizationId: string;
  isActive: boolean;
  model: OpenAIModel;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  triggerConditions: AgentTriggerCondition[];
  handoffConditions: HandoffCondition[];
  createdAt?: Date;
  updatedAt?: Date;
  trainingData?: string;
}

// Props del componente
interface AIAgentFormProps {
  agent?: AIAgent;
  onSubmit: (agent: AIAgent) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DEFAULT_AGENT: AIAgent = {
  name: '',
  description: '',
  type: AIAgentType.CHATBOT,
  organizationId: 'org-123', // Esto debe venir del contexto de la aplicación
  isActive: true,
  model: OpenAIModel.GPT_3_5,
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 1024,
  triggerConditions: [{ type: 'always' }],
  handoffConditions: [{ type: 'user_request' }],
};

// Ejemplos de prompts para cada tipo de agente
const EXAMPLE_PROMPTS = {
  [AIAgentType.CHATBOT]: `Eres un asistente amigable que representa a nuestra empresa. 
Responde preguntas sobre nuestros servicios, horarios y políticas de manera cortés.
Si te preguntan algo que no sabes, ofrece poner en contacto al cliente con un agente humano.
Mantén un tono conversacional y amigable en todo momento.`,

  [AIAgentType.CLASSIFIER]: `Tu tarea es clasificar mensajes entrantes según su intención o categoría.
Las categorías posibles son: consulta de precio, soporte técnico, queja, consulta general, solicitud de información.
Analiza cada mensaje y determina a qué categoría pertenece basándote en su contenido y contexto.`,

  [AIAgentType.SUMMARIZER]: `Tu tarea es resumir conversaciones entre clientes y agentes.
Identifica los puntos clave, problemas mencionados, soluciones propuestas y cualquier seguimiento necesario.
El resumen debe ser conciso pero incluir toda la información importante de la conversación.`,

  [AIAgentType.TRANSLATOR]: `Tu tarea es traducir mensajes entre diferentes idiomas. 
Mantén el tono y significado original del mensaje.
Si hay términos técnicos o culturales específicos, asegúrate de que la traducción sea apropiada en el contexto de destino.`,
};

const AIAgentForm: React.FC<AIAgentFormProps> = ({
  agent = DEFAULT_AGENT,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [currentAgent, setCurrentAgent] = useState<AIAgent>({ ...agent });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manejar cambios en campos básicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAgent(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar cambios en campos numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAgent(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Aplicar prompt de ejemplo
  const applyExamplePrompt = () => {
    setCurrentAgent(prev => ({
      ...prev,
      systemPrompt: EXAMPLE_PROMPTS[prev.type],
    }));
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentAgent.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!currentAgent.systemPrompt.trim()) {
      newErrors.systemPrompt = 'El prompt del sistema es obligatorio';
    }

    if (currentAgent.temperature < 0 || currentAgent.temperature > 1) {
      newErrors.temperature = 'La temperatura debe estar entre 0 y 1';
    }

    if (currentAgent.maxTokens < 1) {
      newErrors.maxTokens = 'El número máximo de tokens debe ser mayor que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(currentAgent);
    }
  };

  // Usar prompt de ejemplo
  const handleUseExamplePrompt = () => {
    applyExamplePrompt();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {agent.id ? 'Editar Agente de IA' : 'Crear Nuevo Agente de IA'}
          </h2>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Agente *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={currentAgent.name}
                onChange={handleChange}
                className={`w-full border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ej.: Asistente de Ventas"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Agente *
              </label>
              <select
                id="type"
                name="type"
                value={currentAgent.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={AIAgentType.CHATBOT}>Chatbot - Conversacional</option>
                <option value={AIAgentType.CLASSIFIER}>Clasificador - Categoriza mensajes</option>
                <option value={AIAgentType.SUMMARIZER}>Resumidor - Sintetiza conversaciones</option>
                <option value={AIAgentType.TRANSLATOR}>Traductor - Traduce mensajes</option>
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
              value={currentAgent.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describa brevemente el propósito de este agente..."
            />
          </div>

          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt del Sistema *
            </label>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">Define el comportamiento y capacidades del agente</p>
              <button
                type="button"
                onClick={handleUseExamplePrompt}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Usar Ejemplo
              </button>
            </div>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={5}
              value={currentAgent.systemPrompt}
              onChange={handleChange}
              className={`w-full border ${
                errors.systemPrompt ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm`}
              placeholder="Eres un asistente que representa a nuestra empresa..."
            />
            {errors.systemPrompt && <p className="mt-1 text-sm text-red-500">{errors.systemPrompt}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={currentAgent.isActive}
              onChange={e => setCurrentAgent(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Agente Activo
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showAdvancedSettings ? 'Ocultar Configuración Avanzada' : 'Mostrar Configuración Avanzada'}
              <svg
                className={`ml-1 h-4 w-4 transform ${showAdvancedSettings ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Configuración avanzada */}
          {showAdvancedSettings && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo de IA
                  </label>
                  <select
                    id="model"
                    name="model"
                    value={currentAgent.model}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={OpenAIModel.GPT_3_5}>GPT-3.5 Turbo (Rápido, Económico)</option>
                    <option value={OpenAIModel.GPT_4}>GPT-4 Turbo (Avanzado, Preciso)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                    Máx. Tokens
                  </label>
                  <input
                    type="number"
                    id="maxTokens"
                    name="maxTokens"
                    min={1}
                    max={4096}
                    value={currentAgent.maxTokens}
                    onChange={handleNumberChange}
                    className={`w-full border ${
                      errors.maxTokens ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.maxTokens && <p className="mt-1 text-sm text-red-500">{errors.maxTokens}</p>}
                  <p className="mt-1 text-xs text-gray-500">Limita la longitud de las respuestas generadas</p>
                </div>
              </div>

              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura: {currentAgent.temperature}
                </label>
                <input
                  type="range"
                  id="temperature"
                  name="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentAgent.temperature}
                  onChange={handleNumberChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Preciso (0)</span>
                  <span>Balanceado (0.5)</span>
                  <span>Creativo (1)</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Condiciones de Activación</h3>
                <div className="mb-2 p-3 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">Actualmente: Responder siempre</p>
                  <p className="text-xs text-gray-500">
                    La configuración avanzada de condiciones de activación estará disponible próximamente
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Condiciones de Entrega a Humano</h3>
                <div className="mb-2 p-3 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">Actualmente: Cuando el usuario lo solicite</p>
                  <p className="text-xs text-gray-500">
                    La configuración avanzada de condiciones de entrega estará disponible próximamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
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
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : agent.id ? 'Actualizar Agente' : 'Crear Agente'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIAgentForm;