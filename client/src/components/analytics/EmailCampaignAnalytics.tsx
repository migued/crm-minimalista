import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  ArrowPathIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CampaignType } from '../email/EmailCampaignBuilder';

// Types
interface EmailMetric {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

interface TimeSeriesData {
  label: string;
  value: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: CampaignType;
  subject: string;
  sentDate: string;
  totalRecipients: number;
  metrics: EmailMetric;
  timeline?: {
    opens: TimeSeriesData[];
    clicks: TimeSeriesData[];
  };
  deviceStats?: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats?: {
    name: string;
    value: number;
    percentage: number;
  }[];
  linkPerformance?: {
    url: string;
    clicks: number;
    uniqueClicks: number;
    clickRate: number;
  }[];
}

interface EmailCampaignAnalyticsProps {
  campaignId?: string;
  organizationId: string;
}

const EmailCampaignAnalytics: React.FC<EmailCampaignAnalyticsProps> = ({ 
  campaignId,
  organizationId
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [campaignsList, setCampaignsList] = useState<{ id: string; name: string; sentDate: string }[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(campaignId || null);
  const [campaignData, setCampaignData] = useState<CampaignPerformance | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<EmailMetric | null>(null);

  // Load campaigns list
  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      
      try {
        // Normally we would call an API here
        // const response = await fetch(`/api/organizations/${organizationId}/email-campaigns`);
        // const data = await response.json();
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockCampaigns = [
          { id: 'camp-1', name: 'Promoción Verano 2025', sentDate: '2025-08-10' },
          { id: 'camp-2', name: 'Newsletter Agosto', sentDate: '2025-08-05' },
          { id: 'camp-3', name: 'Descuentos Exclusivos', sentDate: '2025-07-25' },
          { id: 'camp-4', name: 'Lanzamiento Nuevo Producto', sentDate: '2025-07-15' },
          { id: 'camp-5', name: 'Invitación Evento', sentDate: '2025-07-01' }
        ];
        
        setCampaignsList(mockCampaigns);
        
        // Select the first campaign if none is selected
        if (!selectedCampaign && mockCampaigns.length > 0) {
          setSelectedCampaign(mockCampaigns[0].id);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaigns();
  }, [organizationId]);
  
  // Load campaign data when a campaign is selected
  useEffect(() => {
    if (!selectedCampaign) return;
    
    const loadCampaignData = async () => {
      setIsLoading(true);
      
      try {
        // Normally we would call an API here
        // const response = await fetch(`/api/email-campaigns/${selectedCampaign}/analytics?period=${selectedPeriod}`);
        // const data = await response.json();
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const campaignInfo = campaignsList.find(c => c.id === selectedCampaign);
        const mockData: CampaignPerformance = {
          id: selectedCampaign,
          name: campaignInfo?.name || 'Campaign',
          type: CampaignType.NEWSLETTER,
          subject: campaignInfo?.name || 'Campaign Subject',
          sentDate: campaignInfo?.sentDate || '2025-07-01',
          totalRecipients: 5000 + Math.floor(Math.random() * 2000),
          metrics: generateMockMetrics()
        };
        
        // Generate time series data
        mockData.timeline = {
          opens: generateTimelineData(24, mockData.metrics.opened * 0.7, mockData.metrics.opened * 0.3),
          clicks: generateTimelineData(24, mockData.metrics.clicked * 0.7, mockData.metrics.clicked * 0.3)
        };
        
        // Generate device stats
        mockData.deviceStats = {
          desktop: 45 + Math.floor(Math.random() * 15),
          mobile: 35 + Math.floor(Math.random() * 15),
          tablet: 5 + Math.floor(Math.random() * 5)
        };
        
        // Generate location stats
        mockData.locationStats = [
          { name: 'México', value: 2500, percentage: 50 },
          { name: 'Estados Unidos', value: 1000, percentage: 20 },
          { name: 'Colombia', value: 750, percentage: 15 },
          { name: 'España', value: 500, percentage: 10 },
          { name: 'Otros', value: 250, percentage: 5 }
        ];
        
        // Generate link performance data
        mockData.linkPerformance = [
          { url: 'https://example.com/product1', clicks: 320, uniqueClicks: 280, clickRate: 5.6 },
          { url: 'https://example.com/product2', clicks: 245, uniqueClicks: 210, clickRate: 4.2 },
          { url: 'https://example.com/product3', clicks: 180, uniqueClicks: 165, clickRate: 3.3 },
          { url: 'https://example.com/product4', clicks: 150, uniqueClicks: 130, clickRate: 2.6 },
          { url: 'https://example.com/product5', clicks: 105, uniqueClicks: 95, clickRate: 1.9 }
        ];
        
        setCampaignData(mockData);
        
        // Generate comparison data (averages across campaigns)
        if (compareMode) {
          setComparisonData({
            sent: 4500,
            delivered: 4200,
            opened: 1470,
            clicked: 446,
            bounced: 300,
            unsubscribed: 45,
            openRate: 35.0,
            clickRate: 10.6,
            clickToOpenRate: 30.3,
            bounceRate: 6.7,
            unsubscribeRate: 1.1
          });
        } else {
          setComparisonData(null);
        }
      } catch (error) {
        console.error('Error loading campaign data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaignData();
  }, [selectedCampaign, selectedPeriod, compareMode]);
  
  // Generate mock email metrics
  const generateMockMetrics = (): EmailMetric => {
    // Start with total recipients between 3000-7000
    const sent = 3000 + Math.floor(Math.random() * 4000);
    
    // Delivered: 90-99% of sent
    const delivered = Math.floor(sent * (0.9 + Math.random() * 0.09));
    
    // Opened: 20-60% of delivered
    const opened = Math.floor(delivered * (0.2 + Math.random() * 0.4));
    
    // Clicked: 10-40% of opened
    const clicked = Math.floor(opened * (0.1 + Math.random() * 0.3));
    
    // Bounced: 100% - delivered rate
    const bounced = sent - delivered;
    
    // Unsubscribed: 0-3% of delivered
    const unsubscribed = Math.floor(delivered * (Math.random() * 0.03));
    
    // Calculate rates
    const openRate = (opened / delivered) * 100;
    const clickRate = (clicked / delivered) * 100;
    const clickToOpenRate = (clicked / opened) * 100;
    const bounceRate = (bounced / sent) * 100;
    const unsubscribeRate = (unsubscribed / delivered) * 100;
    
    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      openRate,
      clickRate,
      clickToOpenRate,
      bounceRate,
      unsubscribeRate
    };
  };
  
  // Generate timeline data for opens/clicks
  const generateTimelineData = (hours: number, primary: number, secondary: number): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    let remaining = primary;
    
    // First 6 hours get 70% of activity
    for (let i = 0; i < 6; i++) {
      const portion = Math.floor((Math.random() * 0.2 + 0.1) * primary);
      remaining -= portion;
      data.push({
        label: `${i}h`,
        value: portion
      });
    }
    
    // Remaining hours get the rest of primary + secondary
    const total = remaining + secondary;
    const perHour = total / (hours - 6);
    
    for (let i = 6; i < hours; i++) {
      const variance = Math.random() * 0.5 + 0.75; // 75%-125% variance
      data.push({
        label: `${i}h`,
        value: Math.floor(perHour * variance)
      });
    }
    
    return data;
  };
  
  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  // Format number for display
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };
  
  // Get comparison class (better/worse)
  const getComparisonClass = (current: number, benchmark: number, isRate: boolean = true): string => {
    // For rates like open rate, higher is better
    if (isRate) {
      return current > benchmark ? 'text-green-600' : 'text-red-600';
    }
    // For rates like bounce rate, lower is better
    else {
      return current < benchmark ? 'text-green-600' : 'text-red-600';
    }
  };
  
  // Get delta text
  const getDeltaText = (current: number, benchmark: number, isRate: boolean = true): string => {
    const delta = current - benchmark;
    const prefix = delta > 0 ? '+' : '';
    
    // For rates like open rate, higher is better
    if (isRate) {
      return `${prefix}${delta.toFixed(1)}%`;
    }
    // For rates like bounce rate, lower is better
    else {
      return `${prefix}${delta.toFixed(1)}%`;
    }
  };
  
  // Loading state
  if (isLoading && !campaignData) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  // No campaigns available
  if (campaignsList.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p className="font-medium">No hay campañas de email disponibles</p>
        <p className="mt-1">Crea y envía campañas de email para ver sus estadísticas aquí.</p>
      </div>
    );
  }
  
  // No campaign selected
  if (!selectedCampaign) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <p className="font-medium">Selecciona una campaña</p>
        <p className="mt-1">Elige una campaña de la lista para ver sus estadísticas.</p>
      </div>
    );
  }
  
  // No data available
  if (!campaignData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p className="font-medium">No hay datos disponibles</p>
        <p className="mt-1">No se pudieron cargar los datos para esta campaña.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with campaign selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Análisis de Campaña de Email</h2>
          <p className="text-sm text-gray-600">Métricas y rendimiento detallado</p>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {campaignsList.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="compareMode"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="compareMode" className="ml-2 block text-sm text-gray-700">
              Comparar con el promedio
            </label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 800);
            }}
            title="Actualizar datos"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Campaign Overview */}
      <Card>
        <Card.Header>
          <h3 className="font-medium text-gray-700">Resumen de la Campaña</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="text-sm font-medium">{campaignData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm font-medium">
                    {campaignData.type === CampaignType.NEWSLETTER ? 'Newsletter' :
                     campaignData.type === CampaignType.PROMOTIONAL ? 'Promocional' :
                     campaignData.type === CampaignType.ANNOUNCEMENT ? 'Anuncio' :
                     campaignData.type === CampaignType.FOLLOW_UP ? 'Seguimiento' :
                     'Otro'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Asunto:</span>
                  <span className="text-sm font-medium">{campaignData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de envío:</span>
                  <span className="text-sm font-medium">
                    {new Date(campaignData.sentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total destinatarios:</span>
                  <span className="text-sm font-medium">{formatNumber(campaignData.totalRecipients)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                label="Tasa de apertura"
                value={campaignData.metrics.openRate}
                benchmark={comparisonData?.openRate}
                isBetter={(a, b) => a > b}
                formatter={formatPercentage}
              />
              <MetricCard
                label="Tasa de clics"
                value={campaignData.metrics.clickRate}
                benchmark={comparisonData?.clickRate}
                isBetter={(a, b) => a > b}
                formatter={formatPercentage}
              />
              <MetricCard
                label="CTR (click a apertura)"
                value={campaignData.metrics.clickToOpenRate}
                benchmark={comparisonData?.clickToOpenRate}
                isBetter={(a, b) => a > b}
                formatter={formatPercentage}
              />
              <MetricCard
                label="Tasa de rebote"
                value={campaignData.metrics.bounceRate}
                benchmark={comparisonData?.bounceRate}
                isBetter={(a, b) => a < b}
                formatter={formatPercentage}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Embudo de Email</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <FunnelStep
                label="Enviados"
                value={campaignData.metrics.sent}
                percentage={100}
                color="blue"
              />
              <FunnelStep
                label="Entregados"
                value={campaignData.metrics.delivered}
                percentage={(campaignData.metrics.delivered / campaignData.metrics.sent) * 100}
                color="green"
              />
              <FunnelStep
                label="Abiertos"
                value={campaignData.metrics.opened}
                percentage={(campaignData.metrics.opened / campaignData.metrics.delivered) * 100}
                color="yellow"
              />
              <FunnelStep
                label="Clics"
                value={campaignData.metrics.clicked}
                percentage={(campaignData.metrics.clicked / campaignData.metrics.delivered) * 100}
                color="orange"
              />
            </div>
            
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Rebotados:</span>
                <span className="font-medium text-red-600">
                  {formatNumber(campaignData.metrics.bounced)} ({formatPercentage(campaignData.metrics.bounceRate)})
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Cancelados:</span>
                <span className="font-medium text-red-600">
                  {formatNumber(campaignData.metrics.unsubscribed)} ({formatPercentage(campaignData.metrics.unsubscribeRate)})
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        {/* Timeline */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Interacciones en el Tiempo</h3>
          </Card.Header>
          <Card.Body>
            <div className="h-60">
              <TimelineChart 
                opensData={campaignData.timeline?.opens || []}
                clicksData={campaignData.timeline?.clicks || []}
              />
            </div>
            <div className="mt-2 flex justify-center text-xs text-gray-500">
              <div className="flex items-center mr-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                <span>Aperturas</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-orange-500 mr-1"></div>
                <span>Clics</span>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        {/* Device Breakdown */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Dispositivos</h3>
          </Card.Header>
          <Card.Body>
            {campaignData.deviceStats && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs">
                  <PieChart
                    data={[
                      { label: 'Desktop', value: campaignData.deviceStats.desktop, color: 'blue' },
                      { label: 'Mobile', value: campaignData.deviceStats.mobile, color: 'green' },
                      { label: 'Tablet', value: campaignData.deviceStats.tablet, color: 'purple' }
                    ]}
                  />
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Desktop</span>
                    </div>
                    <span className="font-medium">{campaignData.deviceStats.desktop}%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                      <span>Mobile</span>
                    </div>
                    <span className="font-medium">{campaignData.deviceStats.mobile}%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Tablet</span>
                    </div>
                    <span className="font-medium">{campaignData.deviceStats.tablet}%</span>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
        
        {/* Locations */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Ubicaciones</h3>
          </Card.Header>
          <Card.Body>
            {campaignData.locationStats && (
              <div className="space-y-3">
                {campaignData.locationStats.map((location, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{location.name}</span>
                      <span className="text-gray-600">{formatNumber(location.value)} ({location.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      
      {/* Link Performance */}
      <Card>
        <Card.Header>
          <h3 className="font-medium text-gray-700">Rendimiento de Enlaces</h3>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics Únicos
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasa de Clics
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaignData.linkPerformance?.map((link, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-blue-600 truncate" style={{ maxWidth: '300px' }}>
                      {link.url}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatNumber(link.clicks)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatNumber(link.uniqueClicks)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatPercentage(link.clickRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  label: string;
  value: number;
  benchmark?: number;
  isBetter: (a: number, b: number) => boolean;
  formatter: (value: number) => string;
}> = ({ label, value, benchmark, isBetter, formatter }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h4 className="text-xs font-medium text-gray-600 mb-2">{label}</h4>
      <div className="flex justify-between items-baseline">
        <span className="text-lg font-semibold">{formatter(value)}</span>
        
        {benchmark !== undefined && (
          <div className={`flex items-center text-xs ${
            isBetter(value, benchmark) ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>
              {isBetter(value, benchmark) ? '↑' : '↓'}{' '}
              {Math.abs(value - benchmark).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Funnel Step Component
const FunnelStep: React.FC<{
  label: string;
  value: number;
  percentage: number;
  color: string;
}> = ({ label, value, percentage, color }) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`bg-${color}-500 h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-500 mt-0.5">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};

// Timeline Chart Component
const TimelineChart: React.FC<{
  opensData: TimeSeriesData[];
  clicksData: TimeSeriesData[];
}> = ({ opensData, clicksData }) => {
  // Find max value for scaling
  const maxOpens = Math.max(...opensData.map(d => d.value));
  const maxClicks = Math.max(...clicksData.map(d => d.value));
  const maxValue = Math.max(maxOpens, maxClicks);
  
  return (
    <div className="h-full w-full relative">
      {/* Opens Line */}
      <svg 
        viewBox={`0 0 ${opensData.length - 1} 100`} 
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <polyline
          points={opensData.map((point, index) => 
            `${index}, ${100 - (point.value / maxValue) * 100}`
          ).join(' ')}
          fill="none"
          stroke="#3b82f6" // blue-500
          strokeWidth="2"
        />
      </svg>
      
      {/* Clicks Line */}
      <svg 
        viewBox={`0 0 ${clicksData.length - 1} 100`} 
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <polyline
          points={clicksData.map((point, index) => 
            `${index}, ${100 - (point.value / maxValue) * 100}`
          ).join(' ')}
          fill="none"
          stroke="#f97316" // orange-500
          strokeWidth="2"
        />
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {opensData.filter((_, i) => i % 4 === 0 || i === opensData.length - 1).map((point, index) => (
          <span key={index} className="text-xs text-gray-500">{point.label}</span>
        ))}
      </div>
    </div>
  );
};

// Pie Chart Component
const PieChart: React.FC<{
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}> = ({ data }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate segments
  let cumulativePercentage = 0;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const startPercentage = cumulativePercentage;
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      startPercentage,
      endPercentage: cumulativePercentage
    };
  });
  
  return (
    <div className="relative w-full pt-[100%]">
      {/* SVG must have a 1:1 aspect ratio for the circular shape */}
      <svg 
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
      >
        {segments.map((segment, index) => {
          // Convert percentages to radians
          const startAngle = (segment.startPercentage / 100) * Math.PI * 2 - Math.PI / 2;
          const endAngle = (segment.endPercentage / 100) * Math.PI * 2 - Math.PI / 2;
          
          // Calculate path
          const x1 = 50 + 40 * Math.cos(startAngle);
          const y1 = 50 + 40 * Math.sin(startAngle);
          const x2 = 50 + 40 * Math.cos(endAngle);
          const y2 = 50 + 40 * Math.sin(endAngle);
          
          // Determine if the arc should be drawn the long way around
          const largeArcFlag = segment.percentage > 50 ? 1 : 0;
          
          // Path definition
          const path = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          return (
            <path
              key={index}
              d={path}
              className={`fill-${segment.color}-500`}
            />
          );
        })}
        
        {/* Inner white circle to create donut effect */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
    </div>
  );
};

export default EmailCampaignAnalytics;