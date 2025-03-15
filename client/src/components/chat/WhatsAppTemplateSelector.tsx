import React, { useState, useEffect } from 'react';
import { WhatsAppTemplate } from '../../types/chat';
import { Contact } from '../../types/chat';
import whatsappService from '../../services/whatsapp/whatsappService';
import Button from '../ui/Button';

interface WhatsAppTemplateSelectorProps {
  onSelect: (templateId: string, variables: Record<string, string>) => void;
  onCancel: () => void;
  contact: Contact;
}

const WhatsAppTemplateSelector: React.FC<WhatsAppTemplateSelectorProps> = ({
  onSelect,
  onCancel,
  contact
}) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cargar plantillas al montar el componente
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError('');
        const templatesData = await whatsappService.getTemplates();
        setTemplates(templatesData);
      } catch (err) {
        setError('Error al cargar plantillas');
        console.error('Error loading templates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Inicializar variables cuando se selecciona una plantilla
  useEffect(() => {
    if (selectedTemplate) {
      const newVariables: Record<string, string> = {};
      
      // Recopilar todos los parámetros de todos los componentes
      selectedTemplate.components.forEach(component => {
        if (component.parameters) {
          component.parameters.forEach(param => {
            // Establecer valores iniciales para algunos parámetros comunes
            if (param.type === 'text') {
              if (param.text === 'nombre_cliente') {
                newVariables[param.text] = contact.name;
              } else {
                newVariables[param.text] = '';
              }
            }
          });
        }
      });
      
      setVariables(newVariables);
    }
  }, [selectedTemplate, contact]);
  
  const handleTemplateClick = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
  };
  
  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSubmit = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate.id, variables);
    }
  };
  
  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Vista previa:</h4>
        
        {selectedTemplate.components.map((component, index) => {
          // Reemplazar los marcadores de posición con valores reales
          let text = component.text || '';
          
          if (component.parameters) {
            component.parameters.forEach((param, paramIndex) => {
              if (param.type === 'text') {
                const value = variables[param.text || ''] || `{{${paramIndex + 1}}}`;
                text = text.replace(`{{${paramIndex + 1}}}`, value);
              }
            });
          }
          
          return (
            <div key={index} className="mb-2">
              {component.type === 'HEADER' && (
                <div className="font-bold text-gray-800">{text}</div>
              )}
              {component.type === 'BODY' && (
                <div className="text-gray-700 whitespace-pre-wrap">{text}</div>
              )}
              {component.type === 'FOOTER' && (
                <div className="text-sm text-gray-500 mt-2">{text}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Seleccionar Plantilla</h3>
        <p className="text-sm text-gray-500">
          Estas plantillas están aprobadas por WhatsApp y pueden ser enviadas en cualquier momento.
        </p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando plantillas...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <>
          {!selectedTemplate ? (
            <div className="max-h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {templates.map(template => (
                  <li 
                    key={template.id}
                    className="py-3 px-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">
                          {template.components.find(c => c.type === 'BODY')?.text?.substring(0, 50)}...
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{selectedTemplate.name}</h4>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cambiar
                  </button>
                </div>
                
                {/* Vista previa de la plantilla */}
                {renderTemplatePreview()}
                
                {/* Formulario para editar variables */}
                {Object.keys(variables).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Variables:</h4>
                    <div className="space-y-3">
                      {Object.entries(variables).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {key}
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={value}
                            onChange={e => handleVariableChange(key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedTemplate}
            >
              Enviar Plantilla
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppTemplateSelector;