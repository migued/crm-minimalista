import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

// Este componente es parte de la implementación de la Fase 3 
// para la integración con WhatsApp Business API

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  isConfigured: boolean;
}

const WhatsAppConfigPage: React.FC = () => {
  // Estados
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: '',
    webhookVerifyToken: 'token_' + Math.random().toString(36).substring(2, 15),
    isConfigured: false
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'none' | 'testing' | 'success' | 'error'>('none');
  const [syncStatus, setSyncStatus] = useState<'none' | 'syncing' | 'success' | 'error'>('none');
  const [syncResult, setSyncResult] = useState<{ verified: number, total: number } | null>(null);
  
  // Cargar configuración existente
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // En un entorno real, se haría una petición a la API
        // const response = await fetch('/api/whatsapp/config/organization-id');
        // const data = await response.json();
        
        // Por ahora, simulamos la respuesta
        setTimeout(() => {
          const mockConfig = {
            isConfigured: false,
            phoneNumberId: '',
            businessAccountId: '',
            webhookVerifyToken: 'token_' + Math.random().toString(36).substring(2, 15)
          };
          
          setConfig(prev => ({
            ...prev,
            ...mockConfig,
            isConfigured: mockConfig.isConfigured
          }));
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Error al cargar la configuración');
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaveSuccess(false);
      
      // Validar campos requeridos
      if (!config.phoneNumberId || !config.accessToken || !config.businessAccountId) {
        setError('Todos los campos son obligatorios');
        setLoading(false);
        return;
      }
      
      // En un entorno real, se haría una petición a la API
      // const response = await fetch('/api/whatsapp/config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     organizationId: 'current-org-id',
      //     ...config
      //   })
      // });
      // const data = await response.json();
      
      // Por ahora, simulamos la respuesta
      setTimeout(() => {
        setConfig(prev => ({
          ...prev,
          isConfigured: true
        }));
        
        setSaveSuccess(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Error al guardar la configuración');
      setLoading(false);
    }
  };
  
  // Probar la conexión a WhatsApp
  const handleTestConnection = async () => {
    try {
      setTestStatus('testing');
      
      // En un entorno real, se haría una petición a la API
      // const response = await fetch('/api/whatsapp/test');
      // const data = await response.json();
      
      // Por ahora, simulamos la respuesta
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% de probabilidad de éxito
        
        setTestStatus(success ? 'success' : 'error');
        
        if (!success) {
          setError('Error al conectar con WhatsApp Business API');
        }
      }, 2000);
    } catch (err) {
      setTestStatus('error');
      setError('Error al probar la conexión');
    }
  };
  
  // Sincronizar contactos con WhatsApp
  const handleSyncContacts = async () => {
    try {
      setSyncStatus('syncing');
      
      // En un entorno real, se haría una petición a la API
      // const response = await fetch('/api/whatsapp/sync-contacts/organization-id', {
      //   method: 'POST'
      // });
      // const data = await response.json();
      
      // Por ahora, simulamos la respuesta
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% de probabilidad de éxito
        
        if (success) {
          setSyncStatus('success');
          setSyncResult({
            verified: Math.floor(Math.random() * 50) + 10,
            total: Math.floor(Math.random() * 100) + 50
          });
        } else {
          setSyncStatus('error');
          setError('Error al sincronizar contactos');
        }
      }, 3000);
    } catch (err) {
      setSyncStatus('error');
      setError('Error al sincronizar contactos');
    }
  };
  
  // Renderizar el estado de la conexión
  const renderConnectionStatus = () => {
    if (!config.isConfigured) {
      return (
        <div className="flex items-center text-yellow-600">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <span>WhatsApp no configurado</span>
        </div>
      );
    }
    
    if (testStatus === 'success') {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <span>Conectado a WhatsApp Business API</span>
        </div>
      );
    }
    
    if (testStatus === 'error') {
      return (
        <div className="flex items-center text-red-600">
          <XCircleIcon className="h-5 w-5 mr-2" />
          <span>Error de conexión con WhatsApp</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-blue-600">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
        <span>Configurado, pero no verificado</span>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Configuración de WhatsApp"
        subtitle="Conecta tu cuenta de WhatsApp Business API para habilitar la comunicación bidireccional"
        actions={
          <div className="flex space-x-3">
            {config.isConfigured && (
              <Button
                variant="outline"
                size="md"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing' || !config.isConfigured}
              >
                {testStatus === 'testing' ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Probar Conexión
              </Button>
            )}
            
            {config.isConfigured && (
              <Button
                variant="outline"
                size="md"
                onClick={handleSyncContacts}
                disabled={syncStatus === 'syncing' || !config.isConfigured}
              >
                {syncStatus === 'syncing' ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Sincronizar Contactos
              </Button>
            )}
          </div>
        }
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <XCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Configuración guardada</p>
            <p className="text-sm">La configuración de WhatsApp se ha guardado correctamente.</p>
          </div>
        </div>
      )}
      
      {syncStatus === 'success' && syncResult && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Sincronización completada</p>
            <p className="text-sm">
              Se han verificado {syncResult.verified} de {syncResult.total} contactos en WhatsApp.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de configuración principal */}
        <div className="md:col-span-2">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Configuración de WhatsApp Business API</h3>
              <p className="mt-1 text-sm text-gray-500">
                Proporciona tus credenciales de la API de WhatsApp Business para habilitar la integración.
              </p>
            </Card.Header>
            
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Número de Teléfono
                  </label>
                  <input
                    type="text"
                    name="phoneNumberId"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={config.phoneNumberId}
                    onChange={handleInputChange}
                    placeholder="Ejemplo: 123456789012345"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    El ID del número de teléfono de WhatsApp Business asignado a tu cuenta.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Cuenta de Negocio
                  </label>
                  <input
                    type="text"
                    name="businessAccountId"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={config.businessAccountId}
                    onChange={handleInputChange}
                    placeholder="Ejemplo: 123456789012345"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    El ID de tu cuenta de negocio de WhatsApp Business.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token de Acceso
                  </label>
                  <input
                    type="password"
                    name="accessToken"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={config.accessToken}
                    onChange={handleInputChange}
                    placeholder="Token de acceso de WhatsApp Business API"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    El token de acceso para autenticar las solicitudes a la API.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token de Verificación para Webhook
                  </label>
                  <input
                    type="text"
                    name="webhookVerifyToken"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={config.webhookVerifyToken}
                    onChange={handleInputChange}
                    placeholder="Token personalizado para verificar webhooks"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Un token secreto que se utilizará para verificar las solicitudes de webhook de WhatsApp.
                  </p>
                </div>
              </div>
            </Card.Body>
            
            <Card.Footer>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveConfig}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Card.Footer>
          </Card>
        </div>
        
        {/* Card de estado y webhooks */}
        <div className="md:col-span-1">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Estado de la Integración</h3>
              {renderConnectionStatus()}
            </Card.Header>
            
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Configuración de Webhook</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Configura los siguientes webhooks en tu panel de Facebook para Desarrolladores:
                  </p>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm break-all">
                    <p className="font-mono text-xs mb-1">URL del Webhook:</p>
                    <div className="bg-white p-2 rounded border border-gray-200 mb-2">
                      https://tu-dominio.com/api/whatsapp/webhook
                    </div>
                    
                    <p className="font-mono text-xs mb-1">Token de Verificación:</p>
                    <div className="bg-white p-2 rounded border border-gray-200 font-mono">
                      {config.webhookVerifyToken}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Plantillas Disponibles</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {config.isConfigured 
                      ? 'Plantillas aprobadas que puedes usar para enviar mensajes:'
                      : 'Configura la conexión para ver las plantillas disponibles.'}
                  </p>
                  
                  {config.isConfigured ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-xs font-medium text-blue-800">bienvenida</p>
                        <p className="text-xs text-blue-600 mt-1">Mensaje de bienvenida para nuevos contactos</p>
                      </div>
                      
                      <div className="p-2 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-xs font-medium text-blue-800">confirmacion_cita</p>
                        <p className="text-xs text-blue-600 mt-1">Confirmación de cita programada</p>
                      </div>
                      
                      <div className="p-2 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-xs font-medium text-blue-800">seguimiento</p>
                        <p className="text-xs text-blue-600 mt-1">Seguimiento post-interacción</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-400">Sin plantillas disponibles</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a 
                      href="https://business.facebook.com/wa/manage/message-templates/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <span>Administrar plantillas en Facebook</span>
                      <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Card.Body>
            
            {!config.isConfigured && (
              <Card.Footer>
                <div className="bg-yellow-50 p-3 rounded-md flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Configura tus credenciales para habilitar todas las funcionalidades de WhatsApp en el CRM.
                  </p>
                </div>
              </Card.Footer>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfigPage;