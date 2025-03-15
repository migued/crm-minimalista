import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  ArrowPathIcon,
  CalendarIcon,
  EnvelopeIcon,
  UsersIcon,
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Types for analytics data
interface OverviewMetrics {
  totalContacts: number;
  activeContacts: number;
  contactsGrowth: number;
  totalEmails: number;
  emailsOpened: number;
  emailOpenRate: number;
  totalMessages: number;
  messageResponseRate: number;
  activePipelines: number;
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
}

interface TimeSeriesData {
  label: string;
  value: number;
}

interface PeriodData {
  current: number;
  previous: number;
  percentChange: number;
}

interface AnalyticsData {
  overview: OverviewMetrics;
  contactsGrowth: TimeSeriesData[];
  emailPerformance: {
    sent: TimeSeriesData[];
    opened: TimeSeriesData[];
    clicked: TimeSeriesData[];
  };
  messageVolume: TimeSeriesData[];
  pipelineHealth: {
    deals: PeriodData;
    revenue: PeriodData;
    conversion: PeriodData;
  };
  topSources: { name: string; count: number; percentage: number }[];
  topCampaigns: { name: string; sent: number; opened: number; clicked: number; rate: number }[];
  topAutomations: { name: string; executions: number; success: number; rate: number }[];
}

// Time period options
type TimePeriod = 'today' | '7days' | '30days' | '90days' | 'year';

interface AnalyticsDashboardProps {
  organizationId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ organizationId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30days');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API
      // const response = await fetch(`/api/organizations/${organizationId}/analytics?period=${selectedPeriod}`);
      // const data = await response.json();
      
      // Simulated data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateMockData(selectedPeriod);
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock data based on selected period
  const generateMockData = (period: TimePeriod): AnalyticsData => {
    // Base multipliers for different time periods
    const multiplier = 
      period === 'today' ? 1 :
      period === '7days' ? 7 :
      period === '30days' ? 30 :
      period === '90days' ? 90 : 365;
    
    // Generate time series data points based on period
    const generateTimePoints = (period: TimePeriod, baseValue: number, variance: number = 0.2): TimeSeriesData[] => {
      const points: TimeSeriesData[] = [];
      
      let count = 
        period === 'today' ? 24 : // hours
        period === '7days' ? 7 : // days
        period === '30days' ? 30 : // days
        period === '90days' ? 12 : // weeks
        period === 'year' ? 12 : 12; // months
      
      for (let i = 0; i < count; i++) {
        // Add some randomness within the variance range
        const randomFactor = 1 + (Math.random() * variance * 2 - variance);
        const value = Math.round(baseValue * randomFactor);
        
        let label = '';
        if (period === 'today') {
          label = `${i}:00`;
        } else if (period === '7days') {
          const day = new Date();
          day.setDate(day.getDate() - (6 - i));
          label = day.toLocaleDateString('es-ES', { weekday: 'short' });
        } else if (period === '30days') {
          const day = new Date();
          day.setDate(day.getDate() - (29 - i));
          label = `${day.getDate()}/${day.getMonth() + 1}`;
        } else if (period === '90days' || period === 'year') {
          const month = new Date();
          month.setMonth(month.getMonth() - (count - 1 - i));
          label = month.toLocaleDateString('es-ES', { month: 'short' });
        }
        
        points.push({ label, value });
      }
      
      return points;
    };
    
    // Overview metrics
    const totalContacts = 1200 + Math.floor(Math.random() * 300);
    const activeContacts = Math.floor(totalContacts * (0.7 + Math.random() * 0.2));
    const contactsGrowth = 5 + Math.random() * 10;
    
    const totalEmails = 5000 * multiplier / 30;
    const emailsOpened = Math.floor(totalEmails * (0.2 + Math.random() * 0.3));
    const emailOpenRate = (emailsOpened / totalEmails) * 100;
    
    const totalMessages = 2500 * multiplier / 30;
    const messageResponseRate = 75 + Math.random() * 15;
    
    const activePipelines = 3 + Math.floor(Math.random() * 2);
    const totalDeals = 25 * multiplier / 30;
    const totalRevenue = 50000 * multiplier / 30;
    const avgDealSize = totalRevenue / totalDeals;
    const conversionRate = 15 + Math.random() * 10;
    
    // Generate period comparison data
    const generatePeriodData = (baseValue: number): PeriodData => {
      const current = Math.round(baseValue * (0.9 + Math.random() * 0.4));
      const previous = Math.round(baseValue * (0.7 + Math.random() * 0.3));
      const percentChange = ((current - previous) / previous) * 100;
      
      return { current, previous, percentChange };
    };
    
    return {
      overview: {
        totalContacts,
        activeContacts,
        contactsGrowth,
        totalEmails,
        emailsOpened,
        emailOpenRate,
        totalMessages,
        messageResponseRate,
        activePipelines,
        totalDeals,
        totalRevenue,
        avgDealSize,
        conversionRate
      },
      contactsGrowth: generateTimePoints(period, 20 * multiplier / 30),
      emailPerformance: {
        sent: generateTimePoints(period, 167 * multiplier / 30),
        opened: generateTimePoints(period, 50 * multiplier / 30),
        clicked: generateTimePoints(period, 15 * multiplier / 30)
      },
      messageVolume: generateTimePoints(period, 83 * multiplier / 30),
      pipelineHealth: {
        deals: generatePeriodData(totalDeals),
        revenue: generatePeriodData(totalRevenue),
        conversion: generatePeriodData(conversionRate)
      },
      topSources: [
        { name: 'Referencia', count: 45, percentage: 45 },
        { name: 'Sitio Web', count: 30, percentage: 30 },
        { name: 'Redes Sociales', count: 15, percentage: 15 },
        { name: 'Campaña Email', count: 10, percentage: 10 }
      ],
      topCampaigns: [
        { name: 'Oferta Agosto', sent: 1500, opened: 450, clicked: 180, rate: 30 },
        { name: 'Newsletter Mensual', sent: 2000, opened: 520, clicked: 130, rate: 26 },
        { name: 'Productos Nuevos', sent: 1200, opened: 360, clicked: 108, rate: 30 }
      ],
      topAutomations: [
        { name: 'Bienvenida Contacto', executions: 350, success: 348, rate: 99.4 },
        { name: 'Seguimiento Negocio', executions: 280, success: 273, rate: 97.5 },
        { name: 'Reactivación Clientes', executions: 150, success: 142, rate: 94.7 }
      ]
    };
  };
  
  // Format numbers for display
  const formatNumber = (num: number, fixed: number = 0): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(fixed)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(fixed)}K`;
    }
    return num.toFixed(fixed);
  };
  
  // Format currency for display
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  };
  
  // Format percentage for display
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };
  
  // Render loading state
  if (isLoading && !analyticsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  // Early return if no data
  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        No hay datos disponibles para mostrar
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Análisis y Estadísticas</h2>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <div className="border border-gray-300 rounded-md overflow-hidden flex">
            {(['today', '7days', '30days', '90days', 'year'] as TimePeriod[]).map(period => (
              <button
                key={period}
                className={`px-3 py-1.5 text-sm ${
                  selectedPeriod === period 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'today' ? 'Hoy' : 
                 period === '7days' ? '7 días' : 
                 period === '30days' ? '30 días' : 
                 period === '90days' ? '90 días' : 'Año'}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            title="Actualizar datos"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contacts overview */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Contactos
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(analyticsData.overview.totalContacts)}
                  </p>
                  <p className="ml-2 text-sm font-medium text-green-600">
                    +{analyticsData.overview.contactsGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Activos</span>
                <p className="text-lg font-medium text-gray-700">
                  {formatNumber(analyticsData.overview.activeContacts)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Email overview */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Emails
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(analyticsData.overview.totalEmails)}
                  </p>
                  <p className="ml-2 text-sm font-medium">
                    enviados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Tasa de apertura</span>
                <p className="text-lg font-medium text-gray-700">
                  {formatPercentage(analyticsData.overview.emailOpenRate)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Sales overview */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Ventas
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(analyticsData.overview.totalRevenue)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Conversión</span>
                <p className="text-lg font-medium text-gray-700">
                  {formatPercentage(analyticsData.overview.conversionRate)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts growth chart */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Crecimiento de Contactos</h3>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <BarChart 
                data={analyticsData.contactsGrowth}
                color="blue"
                showValues
              />
            </div>
          </Card.Body>
        </Card>
        
        {/* Email performance chart */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Rendimiento de Email</h3>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <MultiLineChart 
                data={[
                  {
                    name: 'Enviados',
                    color: 'blue',
                    values: analyticsData.emailPerformance.sent
                  },
                  {
                    name: 'Abiertos',
                    color: 'green',
                    values: analyticsData.emailPerformance.opened
                  },
                  {
                    name: 'Clicks',
                    color: 'orange',
                    values: analyticsData.emailPerformance.clicked
                  }
                ]}
              />
            </div>
          </Card.Body>
        </Card>
        
        {/* Pipeline health */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Salud del Pipeline</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                title="Negocios"
                value={analyticsData.pipelineHealth.deals.current}
                prevValue={analyticsData.pipelineHealth.deals.previous}
                percentChange={analyticsData.pipelineHealth.deals.percentChange}
                formatter={formatNumber}
              />
              <MetricCard
                title="Ingresos"
                value={analyticsData.pipelineHealth.revenue.current}
                prevValue={analyticsData.pipelineHealth.revenue.previous}
                percentChange={analyticsData.pipelineHealth.revenue.percentChange}
                formatter={formatCurrency}
              />
              <MetricCard
                title="Conversión"
                value={analyticsData.pipelineHealth.conversion.current}
                prevValue={analyticsData.pipelineHealth.conversion.previous}
                percentChange={analyticsData.pipelineHealth.conversion.percentChange}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución por Etapa</h4>
              <div className="w-full h-6 rounded-full overflow-hidden bg-gray-200 flex">
                <div className="bg-green-500 h-full" style={{ width: '35%' }}></div>
                <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                <div className="bg-yellow-500 h-full" style={{ width: '20%' }}></div>
                <div className="bg-orange-500 h-full" style={{ width: '15%' }}></div>
                <div className="bg-red-500 h-full" style={{ width: '5%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Nuevos (35%)</span>
                <span>Calificados (25%)</span>
                <span>Propuesta (20%)</span>
                <span>Negociación (15%)</span>
                <span>Cerrado (5%)</span>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        {/* Top sources */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Principales Fuentes de Contactos</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {analyticsData.topSources.map((source, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{source.name}</span>
                    <span className="text-gray-600">{source.count} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
        
        {/* Message volume */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Volumen de Mensajes</h3>
          </Card.Header>
          <Card.Body>
            <div className="h-64">
              <AreaChart 
                data={analyticsData.messageVolume}
                color="green"
              />
            </div>
          </Card.Body>
        </Card>
        
        {/* Automation effectiveness */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Efectividad de Automatizaciones</h3>
          </Card.Header>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Automatización
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejecuciones
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Éxito
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topAutomations.map((automation, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {automation.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {automation.executions}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {automation.success}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          automation.rate >= 98 ? 'text-green-600' : 
                          automation.rate >= 95 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {automation.rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        
        {/* Campaign performance */}
        <Card>
          <Card.Header>
            <h3 className="font-medium text-gray-700">Rendimiento de Campañas</h3>
          </Card.Header>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaña
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enviados
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abiertos
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topCampaigns.map((campaign, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {campaign.sent}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {campaign.opened}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {campaign.clicked}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          campaign.rate >= 25 ? 'text-green-600' : 
                          campaign.rate >= 15 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {campaign.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

// Bar Chart Component 
const BarChart: React.FC<{
  data: TimeSeriesData[];
  color: string;
  showValues?: boolean;
}> = ({ data, color, showValues = false }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              {showValues && (
                <div className="text-xs text-gray-600 mb-1">{item.value}</div>
              )}
              <div 
                className={`w-4/5 rounded-t-sm bg-${color}-500`} 
                style={{ height: `${heightPercentage}%` }}
              ></div>
              <div className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Area Chart Component
const AreaChart: React.FC<{
  data: TimeSeriesData[];
  color: string;
}> = ({ data, color }) => {
  // Find max and min values for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  
  // Create SVG points
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    
    return `${x},${y}`;
  }).join(' ');
  
  // Create area fill points (add bottom corners)
  const areaPoints = `${points} 100,100 0,100`;
  
  return (
    <div className="h-full w-full relative">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Area fill */}
        <polygon 
          points={areaPoints} 
          className={`fill-${color}-100`} 
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          className={`stroke-${color}-500`}
          strokeWidth="2"
        />
      </svg>
      
      {/* X axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

// Multi-line Chart Component
const MultiLineChart: React.FC<{
  data: {
    name: string;
    color: string;
    values: TimeSeriesData[];
  }[];
}> = ({ data }) => {
  // Find max value across all datasets for scaling
  const allValues = data.flatMap(d => d.values.map(v => v.value));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue;
  
  return (
    <div className="h-full w-full relative">
      {/* Chart */}
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {data.map((dataset, datasetIndex) => {
          // Create SVG points for this line
          const points = dataset.values.map((item, index) => {
            const x = (index / (dataset.values.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <polyline
              key={datasetIndex}
              points={points}
              fill="none"
              className={`stroke-${dataset.color}-500`}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      {/* X axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data[0].values.filter((_, i) => i % Math.ceil(data[0].values.length / 5) === 0 || i === data[0].values.length - 1).map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
      
      {/* Legend */}
      <div className="absolute top-0 right-0 flex flex-col items-end space-y-1">
        {data.map((dataset, index) => (
          <div key={index} className="flex items-center text-xs">
            <div className={`h-2 w-4 bg-${dataset.color}-500 mr-1 rounded-sm`}></div>
            <span>{dataset.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number;
  prevValue: number;
  percentChange: number;
  formatter: (value: number) => string;
}> = ({ title, value, prevValue, percentChange, formatter }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <h3 className="text-xs font-medium text-gray-500">{title}</h3>
      <p className="text-lg font-semibold text-gray-900 mt-1">
        {formatter(value)}
      </p>
      <div className={`flex items-center text-xs mt-1 ${
        percentChange >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {percentChange >= 0 ? (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {Math.abs(percentChange).toFixed(1)}%
      </div>
    </div>
  );
};

export default AnalyticsDashboard;