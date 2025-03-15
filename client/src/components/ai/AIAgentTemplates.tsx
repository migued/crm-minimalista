import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AIAgent, AIAgentType, OpenAIModel } from './AIAgentForm';

// Interfaz para templates de agentes
interface AIAgentTemplate {
  id: string;
  name: string;
  description: string;
  type: AIAgentType;
  systemPrompt: string;
  tags: string[];
  recommended: boolean;
}

interface AIAgentTemplatesProps {
  onSelectTemplate: (template: AIAgentTemplate) => void;
  onCancel: () => void;
}

// Templates predefinidos
const predefinedTemplates: AIAgentTemplate[] = [
  {
    id: 'template-service-basic',
    name: 'Asistente de Servicio al Cliente',
    description: 'Un agente amigable para responder preguntas frecuentes y atender consultas generales de clientes.',
    type: AIAgentType.CHATBOT,
    tags: ['Atención al Cliente', 'Principiante'],
    recommended: true,
    systemPrompt: `Eres un asistente de servicio al cliente amigable y profesional.
Tu objetivo es ayudar a los clientes respondiendo sus preguntas de manera clara y concisa.
Siempre mantén un tono cordial y positivo.

Cuando los clientes hagan preguntas:
- Responde con información precisa y útil
- Si no conoces la respuesta, ofrece pasar al cliente con un agente humano
- Evita usar jerga técnica compleja
- Muestra empatía ante sus preocupaciones

Para preguntas comunes, puedes ofrecer:
- Información sobre nuestros productos/servicios
- Estado de pedidos/reservas
- Políticas de devolución
- Horarios de atención

Si el cliente muestra frustración o el problema es complejo, ofrece escalarlo a un agente humano.`,
  },
  {
    id: 'template-sales-assistant',
    name: 'Asistente de Ventas',
    description: 'Agente diseñado para calificar prospectos, responder preguntas de productos y guiar el proceso de ventas.',
    type: AIAgentType.CHATBOT,
    tags: ['Ventas', 'Calificación'],
    recommended: true,
    systemPrompt: `Eres un asistente de ventas experto.
Tu objetivo es ayudar a identificar las necesidades de los clientes potenciales y guiarlos en el proceso de compra.

Responsabilidades:
1. Preguntar sobre las necesidades específicas del cliente
2. Proporcionar información relevante sobre nuestros productos/servicios
3. Responder preguntas sobre precios, características y comparativas
4. Capturar información clave para la calificación (nombre, correo, presupuesto, plazo)
5. Identificar objeciones de venta y abordarlas profesionalmente

Cuando identifiques un prospecto calificado (tiene presupuesto, autoridad y necesidad inmediata),
ofrece conectarlo con un asesor de ventas. Si el cliente no está listo, 
ofrece enviar más información o programar un seguimiento posterior.`,
  },
  {
    id: 'template-real-estate',
    name: 'Agente Inmobiliario Virtual',
    description: 'Especializado en responder consultas sobre propiedades, programar visitas y calificar leads inmobiliarios.',
    type: AIAgentType.CHATBOT,
    tags: ['Inmobiliario', 'Especializado'],
    recommended: false,
    systemPrompt: `Eres un agente inmobiliario virtual profesional y conocedor.
Tu objetivo es ayudar a clientes interesados en propiedades, responder sus preguntas
y capturar su información para seguimiento.

Responsabilidades:
1. Responder preguntas sobre propiedades (ubicación, precio, características)
2. Recopilar requisitos de los clientes (presupuesto, zona, tipo de propiedad)
3. Programar visitas a propiedades
4. Explicar el proceso de compra/alquiler
5. Capturar información de contacto para seguimiento

Siempre sé cortés y profesional. Cuando un cliente muestre interés concreto en una propiedad,
ofrece conectarlo con un asesor inmobiliario. Si necesitan más tiempo, ofrece enviarles
un catálogo de propiedades que coincidan con sus requisitos.`,
  },
  {
    id: 'template-edu-assistant',
    name: 'Asistente Educativo',
    description: 'Diseñado para instituciones educativas, responde consultas sobre programas, admisiones y fechas clave.',
    type: AIAgentType.CHATBOT,
    tags: ['Educación', 'Especializado'],
    recommended: false,
    systemPrompt: `Eres un asistente educativo para nuestra institución.
Tu objetivo es responder preguntas de estudiantes y padres sobre nuestros
programas educativos, proceso de admisión y servicios.

Responsabilidades:
1. Proporcionar información sobre programas académicos
2. Explicar el proceso de admisión y requisitos
3. Informar sobre fechas importantes (inscripciones, exámenes, etc.)
4. Responder preguntas sobre costos y becas
5. Programar citas con asesores educativos

Mantén un tono profesional pero amigable. Asegúrate de capturar información
de contacto para seguimiento. Cuando alguien muestre interés serio en inscribirse,
ofrece conectarlo con un asesor de admisiones.`,
  },
  {
    id: 'template-message-classifier',
    name: 'Clasificador de Mensajes',
    description: 'Categoriza automáticamente los mensajes entrantes según su intención para enrutarlos correctamente.',
    type: AIAgentType.CLASSIFIER,
    tags: ['Clasificación', 'Avanzado'],
    recommended: false,
    systemPrompt: `Tu función es clasificar mensajes entrantes de clientes en una de las siguientes categorías:
- CONSULTA_PRODUCTO: Preguntas sobre productos, disponibilidad, características
- CONSULTA_PRECIO: Preguntas específicas sobre precios, descuentos, promociones
- SOPORTE_TECNICO: Problemas con productos, solicitudes de ayuda
- QUEJA: Expresiones de insatisfacción, reclamos, problemas con servicio
- SEGUIMIENTO_PEDIDO: Preguntas sobre estado de pedidos, entregas
- SOLICITUD_INFORMACION: Peticiones de catálogos, folletos u otra información
- OTRO: Cualquier mensaje que no encaje en las categorías anteriores

Analiza cuidadosamente cada mensaje y devuelve solamente la categoría más adecuada.
Si un mensaje podría pertenecer a múltiples categorías, elige la más relevante según
el foco principal del mensaje.`,
  },
  {
    id: 'template-conversation-summarizer',
    name: 'Resumidor de Conversaciones',
    description: 'Resume automáticamente conversaciones largas, identificando puntos clave y próximos pasos.',
    type: AIAgentType.SUMMARIZER,
    tags: ['Resumen', 'Avanzado'],
    recommended: false,
    systemPrompt: `Tu tarea es crear resúmenes concisos pero completos de conversaciones entre clientes y agentes.
Para cada resumen, identifica y estructura la siguiente información:

1. CONTEXTO: Breve descripción del motivo de contacto del cliente
2. PROBLEMAS: Lista de problemas o consultas planteadas
3. SOLUCIONES: Acciones tomadas o soluciones propuestas por el agente
4. COMPROMISOS: Cualquier promesa o compromiso hecho al cliente
5. ACCIONES_PENDIENTES: Tareas que requieren seguimiento
6. ESTADO: Estado final de la conversación (Resuelto, Pendiente, Escalado)

El formato del resumen debe ser estructurado con estos encabezados.
Asegúrate de capturar todos los detalles importantes mientras mantienes
el resumen conciso y orientado a la acción.`,
  },
];

const AIAgentTemplates: React.FC<AIAgentTemplatesProps> = ({ onSelectTemplate, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Filtrar templates según la búsqueda y tipo seleccionado
  const filteredTemplates = predefinedTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || template.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Manejar la selección de un template
  const handleSelectTemplate = (template: AIAgentTemplate) => {
    setSelectedTemplate(template.id);
    onSelectTemplate(template);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Plantillas de Agentes de IA
          </h2>
          <p className="text-sm text-gray-600">
            Selecciona una plantilla predefinida para comenzar rápidamente con un agente de IA.
            Podrás personalizarla según tus necesidades específicas.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:w-64">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value={AIAgentType.CHATBOT}>Chatbots</option>
              <option value={AIAgentType.CLASSIFIER}>Clasificadores</option>
              <option value={AIAgentType.SUMMARIZER}>Resumidores</option>
              <option value={AIAgentType.TRANSLATOR}>Traductores</option>
            </select>
          </div>
        </div>

        {/* Lista de templates */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-md">
              No se encontraron plantillas que coincidan con tu búsqueda.
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`border ${
                  selectedTemplate === template.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                } rounded-md p-4 cursor-pointer transition-all`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                  </div>
                  {template.recommended && (
                    <Badge color="green" size="sm">Recomendado</Badge>
                  )}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge color="blue" size="sm">
                    {template.type === AIAgentType.CHATBOT && 'Chatbot'}
                    {template.type === AIAgentType.CLASSIFIER && 'Clasificador'}
                    {template.type === AIAgentType.SUMMARIZER && 'Resumidor'}
                    {template.type === AIAgentType.TRANSLATOR && 'Traductor'}
                  </Badge>
                  
                  {template.tags.map(tag => (
                    <Badge key={tag} color="gray" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!selectedTemplate}
            onClick={() => {
              const template = predefinedTemplates.find(t => t.id === selectedTemplate);
              if (template) onSelectTemplate(template);
            }}
          >
            Usar Plantilla Seleccionada
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAgentTemplates;