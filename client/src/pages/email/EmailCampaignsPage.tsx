import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { 
  PlusIcon, 
  EnvelopeIcon, 
  ChartBarIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import emailService from '../../services/email/emailService';
import { EmailCampaign, CampaignStatus, CampaignType } from '../../services/email/types';

const MOCK_ORGANIZATION_ID = 'org-123'; // En una implementación real, esto vendría del contexto de la app

const EmailCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // En una implementación real, se haría una llamada a la API
      // Por ahora, simulamos datos
      const mockCampaigns: EmailCampaign[] = [
        {
          id: 'camp-1',
          name: 'Boletín Mensual - Agosto 2025',
          description: 'Actualizaciones y noticias de agosto',
          type: CampaignType.NEWSLETTER,
          status: CampaignStatus.COMPLETED,
          subject: 'Novedades de Agosto 2025',
          content: '<h1>Boletín de Agosto</h1><p>Contenido del boletín</p>',
          segmentId: 'seg-1',
          segmentName: 'Todos los contactos',
          organizationId: MOCK_ORGANIZATION_ID,
          createdAt: new Date('2025-07-25'),
          sentAt: new Date('2025-08-01'),
          stats: {
            totalSent: 5243,
            delivered: 5102,
            opened: 2340,
            clicked: 876,
            bounced: 141,
            unsubscribed: 28,
            openRate: 45.8,
            clickRate: 17.2
          }
        },
        {
          id: 'camp-2',
          name: 'Promoción Verano 2025',
          description: 'Oferta especial para nuevos clientes',
          type: CampaignType.PROMOTIONAL,
          status: CampaignStatus.SCHEDULED,
          subject: '¡Oferta especial de verano! 30% de descuento',
          content: '<h1>Oferta de Verano</h1><p>Contenido de la promoción</p>',
          segmentId: 'seg-2',
          segmentName: 'Prospectos nuevos',
          organizationId: MOCK_ORGANIZATION_ID,
          createdAt: new Date('2025-08-10'),
          schedule: {
            sendDate: new Date('2025-08-15'),
            sendTime: '09:00',
            timezone: 'America/Mexico_City',
            recurringType: 'none'
          }
        },
        {
          id: 'camp-3',
          name: 'Encuesta de Satisfacción Q3',
          description: 'Encuesta trimestral para clientes activos',
          type: CampaignType.SURVEY,
          status: CampaignStatus.DRAFT,
          subject: 'Valoramos tu opinión - Encuesta rápida',
          content: '<h1>Encuesta de Satisfacción</h1><p>Contenido de la encuesta</p>',
          segmentId: 'seg-3',
          segmentName: 'Clientes activos',
          organizationId: MOCK_ORGANIZATION_ID,
          createdAt: new Date('2025-08-05')
        },
        {
          id: 'camp-4',
          name: 'Anuncio Nuevo Producto',
          description: 'Lanzamiento de nueva característica premium',
          type: CampaignType.ANNOUNCEMENT,
          status: CampaignStatus.PAUSED,
          subject: 'Presentamos nuestra nueva característica premium',
          content: '<h1>Nuevo Producto</h1><p>Contenido del anuncio</p>',
          segmentId: 'seg-4',
          segmentName: 'Todos los clientes',
          organizationId: MOCK_ORGANIZATION_ID,
          createdAt: new Date('2025-07-30')
        }
      ];

      // Descomentar esta línea en producción
      // const response = await emailService.getCampaignsByOrganization(MOCK_ORGANIZATION_ID);
      // setCampaigns(response);
      
      setCampaigns(mockCampaigns);
    } catch (err) {
      setError('Error al cargar las campañas de email');
      console.error('Error fetching email campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    navigate('/email/campaigns/new');
  };

  const handleEditCampaign = (id: string) => {
    navigate(`/email/campaigns/edit/${id}`);
  };

  const handleViewStats = (id: string) => {
    navigate(`/email/campaigns/stats/${id}`);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta campaña de email?')) {
      try {
        // En una implementación real, se llamaría a la API
        // await emailService.deleteCampaign(id);
        
        // Por ahora, actualizamos el estado local
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('Error al eliminar la campaña');
      }
    }
  };

  // Función para mostrar el ícono de estado
  const renderStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case CampaignStatus.SCHEDULED:
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case CampaignStatus.RUNNING:
        return <PaperAirplaneIcon className="h-5 w-5 text-yellow-500" />;
      case CampaignStatus.DRAFT:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      case CampaignStatus.PAUSED:
        return <PauseIcon className="h-5 w-5 text-orange-500" />;
      case CampaignStatus.CANCELED:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Función para mostrar el texto de estado
  const getStatusText = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.COMPLETED:
        return 'Enviada';
      case CampaignStatus.SCHEDULED:
        return 'Programada';
      case CampaignStatus.RUNNING:
        return 'En proceso';
      case CampaignStatus.DRAFT:
        return 'Borrador';
      case CampaignStatus.PAUSED:
        return 'Pausada';
      case CampaignStatus.CANCELED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Función para mostrar el texto de tipo
  const getTypeText = (type: CampaignType) => {
    switch (type) {
      case CampaignType.NEWSLETTER:
        return 'Boletín';
      case CampaignType.PROMOTIONAL:
        return 'Promoción';
      case CampaignType.ANNOUNCEMENT:
        return 'Anuncio';
      case CampaignType.FOLLOW_UP:
        return 'Seguimiento';
      case CampaignType.AUTOMATED:
        return 'Automatizada';
      case CampaignType.SURVEY:
        return 'Encuesta';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <PageHeader 
        title="Campañas de Email" 
        description="Gestiona tus campañas de correo electrónico"
        actions={
          <Button 
            variant="primary" 
            onClick={handleCreateCampaign}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Campaña
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay campañas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primera campaña de email.
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={handleCreateCampaign}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Campaña
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Segmento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creada
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estadísticas
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                            <EnvelopeIcon className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.description || 'Sin descripción'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTypeText(campaign.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStatusIcon(campaign.status)}
                          <span className="ml-1.5 text-sm text-gray-700">
                            {getStatusText(campaign.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {campaign.segmentName || 'Segmento desconocido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {campaign.stats ? (
                          <div className="text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-700">Apertura:</span>
                              <span className="ml-2 font-medium text-green-600">{campaign.stats.openRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-gray-700">Clics:</span>
                              <span className="ml-2 font-medium text-blue-600">{campaign.stats.clickRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No hay datos</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {campaign.status === CampaignStatus.COMPLETED && (
                            <button 
                              onClick={() => handleViewStats(campaign.id!)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Ver estadísticas"
                            >
                              <ChartBarIcon className="h-5 w-5" />
                            </button>
                          )}
                          {campaign.status !== CampaignStatus.COMPLETED && (
                            <button 
                              onClick={() => handleEditCampaign(campaign.id!)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Editar campaña"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          )}
                          {campaign.status !== CampaignStatus.COMPLETED && (
                            <button 
                              onClick={() => handleDeleteCampaign(campaign.id!)}
                              className="text-red-600 hover:text-red-800"
                              title="Eliminar campaña"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignsPage;