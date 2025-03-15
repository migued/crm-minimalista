import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  ArrowPathIcon,
  AcademicCapIcon,
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types for analytics data
interface TimeSeriesData {
  label: string;
  value: number;
}

interface IndustryAnalyticsProps {
  organizationId: string;
  industry: 'education' | 'real_estate';
}

// Education specific metrics
interface EducationMetrics {
  totalStudents: number;
  activeStudents: number;
  conversionRate: number;
  totalCourses: number;
  totalLeads: number;
  enrollmentsByMonth: TimeSeriesData[];
  leadsBySource: { name: string; count: number; percentage: number }[];
  coursePopularity: { name: string; students: number; percentage: number }[];
  campaignEffectiveness: { name: string; leads: number; enrollments: number; conversionRate: number }[];
  studentRetention: { period: string; rate: number }[];
}

// Real Estate specific metrics
interface RealEstateMetrics {
  totalProperties: number;
  activeListings: number;
  totalClients: number;
  totalSales: number;
  totalRevenue: number;
  avgPropertyValue: number;
  salesByMonth: TimeSeriesData[];
  propertiesByType: { name: string; count: number; percentage: number }[];
  leadsBySource: { name: string; count: number; percentage: number }[];
  propertiesByStatus: { status: string; count: number; percentage: number }[];
  salesByAgent: { name: string; sales: number; revenue: number }[];
}

type TimePeriod = '30days' | '90days' | '6months' | 'year';

const IndustryAnalytics: React.FC<IndustryAnalyticsProps> = ({ 
  organizationId,
  industry
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('90days');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [educationData, setEducationData] = useState<EducationMetrics | null>(null);
  const [realEstateData, setRealEstateData] = useState<RealEstateMetrics | null>(null);

  useEffect(() => {
    fetchIndustryData();
  }, [industry, selectedPeriod]);

  const fetchIndustryData = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API
      // const response = await fetch(`/api/organizations/${organizationId}/analytics/${industry}?period=${selectedPeriod}`);
      // const data = await response.json();
      
      // Simulated data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (industry === 'education') {
        const data = generateEducationMockData();
        setEducationData(data);
      } else {
        const data = generateRealEstateMockData();
        setRealEstateData(data);
      }
    } catch (error) {
      console.error('Error fetching industry analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data for education industry
  const generateEducationMockData = (): EducationMetrics => {
    // Base multipliers for different time periods
    const timeMultiplier = 
      selectedPeriod === '30days' ? 1 :
      selectedPeriod === '90days' ? 3 :
      selectedPeriod === '6months' ? 6 : 12;
      
    // Generate time series data points
    const generateMonthlyData = (): TimeSeriesData[] => {
      const points: TimeSeriesData[] = [];
      const months = 
        selectedPeriod === '30days' ? 1 :
        selectedPeriod === '90days' ? 3 :
        selectedPeriod === '6months' ? 6 : 12;
      
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - 1 - i));
        
        // Add seasonal variations (higher in January, September)
        let seasonality = 1;
        const month = date.getMonth();
        if (month === 0 || month === 8) { // January or September
          seasonality = 1.5;
        } else if (month === 1 || month === 9) { // February or October
          seasonality = 1.3;
        } else if (month === 6 || month === 7) { // July or August
          seasonality = 0.7;
        }
        
        const value = Math.floor(25 + Math.random() * 15) * seasonality;
        
        points.push({
          label: date.toLocaleDateString('es-ES', { month: 'short' }),
          value: Math.round(value)
        });
      }
      
      return points;
    };
    
    const enrollmentsByMonth = generateMonthlyData();
    const totalEnrollments = enrollmentsByMonth.reduce((sum, item) => sum + item.value, 0);
    
    // Student and conversion metrics
    const totalStudents = 250 + Math.floor(Math.random() * 100) + (totalEnrollments * 0.8);
    const activeStudents = Math.floor(totalStudents * (0.7 + Math.random() * 0.2));
    const totalLeads = Math.floor(totalEnrollments / (0.15 + Math.random() * 0.1));
    const conversionRate = (totalEnrollments / totalLeads) * 100;
    
    return {
      totalStudents: Math.round(totalStudents),
      activeStudents: Math.round(activeStudents),
      conversionRate: conversionRate,
      totalCourses: 12 + Math.floor(Math.random() * 8),
      totalLeads: Math.round(totalLeads),
      enrollmentsByMonth: enrollmentsByMonth,
      leadsBySource: [
        { name: 'Sitio Web', count: Math.floor(totalLeads * 0.35), percentage: 35 },
        { name: 'Referencia', count: Math.floor(totalLeads * 0.25), percentage: 25 },
        { name: 'Campaña Email', count: Math.floor(totalLeads * 0.20), percentage: 20 },
        { name: 'Redes Sociales', count: Math.floor(totalLeads * 0.15), percentage: 15 },
        { name: 'Otros', count: Math.floor(totalLeads * 0.05), percentage: 5 }
      ],
      coursePopularity: [
        { name: 'Desarrollo Web', students: Math.floor(totalStudents * 0.25), percentage: 25 },
        { name: 'Ciencia de Datos', students: Math.floor(totalStudents * 0.20), percentage: 20 },
        { name: 'Diseño UX/UI', students: Math.floor(totalStudents * 0.18), percentage: 18 },
        { name: 'Marketing Digital', students: Math.floor(totalStudents * 0.15), percentage: 15 },
        { name: 'Inglés de Negocios', students: Math.floor(totalStudents * 0.12), percentage: 12 },
        { name: 'Otros Cursos', students: Math.floor(totalStudents * 0.10), percentage: 10 }
      ],
      campaignEffectiveness: [
        { 
          name: 'Descuento Verano', 
          leads: Math.floor(100 + Math.random() * 50), 
          enrollments: Math.floor(25 + Math.random() * 15),
          conversionRate: 25 + Math.random() * 5
        },
        { 
          name: 'Webinar Gratuito', 
          leads: Math.floor(80 + Math.random() * 40), 
          enrollments: Math.floor(20 + Math.random() * 10),
          conversionRate: 20 + Math.random() * 5
        },
        { 
          name: 'Clase de Prueba', 
          leads: Math.floor(60 + Math.random() * 30), 
          enrollments: Math.floor(18 + Math.random() * 12),
          conversionRate: 30 + Math.random() * 5
        },
        { 
          name: 'Paquete 2x1', 
          leads: Math.floor(40 + Math.random() * 20), 
          enrollments: Math.floor(12 + Math.random() * 8),
          conversionRate: 28 + Math.random() * 5
        }
      ],
      studentRetention: [
        { period: '30 días', rate: 92 + Math.random() * 5 },
        { period: '90 días', rate: 85 + Math.random() * 5 },
        { period: '6 meses', rate: 74 + Math.random() * 6 },
        { period: '1 año', rate: 65 + Math.random() * 8 }
      ]
    };
  };
  
  // Generate mock data for real estate industry
  const generateRealEstateMockData = (): RealEstateMetrics => {
    // Base multipliers for different time periods
    const timeMultiplier = 
      selectedPeriod === '30days' ? 1 :
      selectedPeriod === '90days' ? 3 :
      selectedPeriod === '6months' ? 6 : 12;
    
    // Generate time series data points
    const generateMonthlyData = (): TimeSeriesData[] => {
      const points: TimeSeriesData[] = [];
      const months = 
        selectedPeriod === '30days' ? 1 :
        selectedPeriod === '90days' ? 3 :
        selectedPeriod === '6months' ? 6 : 12;
      
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - 1 - i));
        
        // Add seasonal variations (higher in spring and summer)
        let seasonality = 1;
        const month = date.getMonth();
        if (month >= 3 && month <= 7) { // April to August
          seasonality = 1.3;
        } else if (month === 11 || month === 0) { // December or January
          seasonality = 0.7;
        }
        
        const value = Math.floor(10 + Math.random() * 8) * seasonality;
        
        points.push({
          label: date.toLocaleDateString('es-ES', { month: 'short' }),
          value: Math.round(value)
        });
      }
      
      return points;
    };
    
    const salesByMonth = generateMonthlyData();
    const totalSales = salesByMonth.reduce((sum, item) => sum + item.value, 0);
    
    // Property and client metrics
    const avgPropertyValue = 250000 + Math.random() * 150000;
    const totalRevenue = totalSales * avgPropertyValue;
    const totalProperties = Math.floor(totalSales * (2 + Math.random()));
    const activeListings = Math.floor(totalProperties * (0.3 + Math.random() * 0.2));
    const totalClients = Math.floor(totalSales * (1.2 + Math.random() * 0.4));
    
    return {
      totalProperties: totalProperties,
      activeListings: activeListings,
      totalClients: totalClients,
      totalSales: totalSales,
      totalRevenue: totalRevenue,
      avgPropertyValue: avgPropertyValue,
      salesByMonth: salesByMonth,
      propertiesByType: [
        { name: 'Apartamento', count: Math.floor(totalProperties * 0.40), percentage: 40 },
        { name: 'Casa', count: Math.floor(totalProperties * 0.30), percentage: 30 },
        { name: 'Terreno', count: Math.floor(totalProperties * 0.15), percentage: 15 },
        { name: 'Oficina', count: Math.floor(totalProperties * 0.10), percentage: 10 },
        { name: 'Otros', count: Math.floor(totalProperties * 0.05), percentage: 5 }
      ],
      leadsBySource: [
        { name: 'Portales Inmobiliarios', count: Math.floor(totalClients * 0.35), percentage: 35 },
        { name: 'Sitio Web', count: Math.floor(totalClients * 0.25), percentage: 25 },
        { name: 'Referencia', count: Math.floor(totalClients * 0.20), percentage: 20 },
        { name: 'Redes Sociales', count: Math.floor(totalClients * 0.15), percentage: 15 },
        { name: 'Otros', count: Math.floor(totalClients * 0.05), percentage: 5 }
      ],
      propertiesByStatus: [
        { status: 'En Venta', count: activeListings, percentage: Math.round((activeListings / totalProperties) * 100) },
        { status: 'Vendida', count: totalSales, percentage: Math.round((totalSales / totalProperties) * 100) },
        { status: 'Reservada', count: Math.floor(totalProperties * 0.05), percentage: 5 },
        { status: 'Inactiva', count: totalProperties - activeListings - totalSales - Math.floor(totalProperties * 0.05), percentage: Math.round(((totalProperties - activeListings - totalSales - Math.floor(totalProperties * 0.05)) / totalProperties) * 100) }
      ],
      salesByAgent: [
        { name: 'Ana García', sales: Math.floor(totalSales * 0.30), revenue: totalRevenue * 0.30 },
        { name: 'Juan Pérez', sales: Math.floor(totalSales * 0.25), revenue: totalRevenue * 0.25 },
        { name: 'María López', sales: Math.floor(totalSales * 0.20), revenue: totalRevenue * 0.20 },
        { name: 'Carlos Rodríguez', sales: Math.floor(totalSales * 0.15), revenue: totalRevenue * 0.15 },
        { name: 'Otros Agentes', sales: Math.floor(totalSales * 0.10), revenue: totalRevenue * 0.10 }
      ]
    };
  };
  
  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage for display
  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };
  
  // Format number for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  // Loading state
  if (isLoading && (!educationData && !realEstateData)) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with industry icon and period selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          {industry === 'education' ? (
            <AcademicCapIcon className="h-8 w-8 text-blue-500 mr-3" />
          ) : (
            <HomeIcon className="h-8 w-8 text-blue-500 mr-3" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Análisis de {industry === 'education' ? 'Educación' : 'Bienes Raíces'}
            </h2>
            <p className="text-sm text-gray-600">
              Métricas específicas para tu sector
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="border border-gray-300 rounded-md overflow-hidden flex">
            {(['30days', '90days', '6months', 'year'] as TimePeriod[]).map(period => (
              <button
                key={period}
                className={`px-3 py-1.5 text-sm ${
                  selectedPeriod === period 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '30days' ? '30 días' : 
                 period === '90days' ? '90 días' : 
                 period === '6months' ? '6 meses' : '1 año'}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIndustryData}
            title="Actualizar datos"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Education Analytics */}
      {industry === 'education' && educationData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1 text-blue-500" />
                      Estudiantes
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatNumber(educationData.totalStudents)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                    {formatNumber(educationData.activeStudents)} activos
                  </span>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1 text-green-500" />
                      Leads
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatNumber(educationData.totalLeads)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {formatPercentage(educationData.conversionRate)} conversión
                  </span>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-1 text-purple-500" />
                      Cursos
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatNumber(educationData.totalCourses)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {formatNumber(educationData.enrollmentsByMonth.reduce((a, b) => a + b.value, 0))} inscripciones
                  </span>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-orange-500" />
                      Retención
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatPercentage(educationData.studentRetention[0].rate)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    30 días
                  </span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Inscripciones por Mes</h3>
              </Card.Header>
              <Card.Body>
                <div className="h-60">
                  <BarChart data={educationData.enrollmentsByMonth} color="blue" />
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Popularidad de Cursos</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {educationData.coursePopularity.map((course, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{course.name}</span>
                        <span className="text-gray-600">{formatNumber(course.students)} ({course.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${course.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Retención de Estudiantes</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-5 p-4">
                  {educationData.studentRetention.map((period, index) => (
                    <div key={index} className="relative pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{period.period}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${
                            period.rate >= 85 ? 'text-green-600' :
                            period.rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(period.rate)}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            period.rate >= 85 ? 'bg-green-500' :
                            period.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${period.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Fuentes de Leads</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {educationData.leadsBySource.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{source.name}</span>
                        <span className="text-gray-600">{formatNumber(source.count)} ({source.percentage}%)</span>
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
          </div>
          
          {/* Campaign Effectiveness */}
          <Card>
            <Card.Header>
              <h3 className="font-medium text-gray-700">Efectividad de Campañas</h3>
            </Card.Header>
            <Card.Body>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaña
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leads
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscripciones
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tasa de Conversión
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {educationData.campaignEffectiveness.map((campaign, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {campaign.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatNumber(campaign.leads)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatNumber(campaign.enrollments)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${
                            campaign.conversionRate >= 25 ? 'text-green-600' : 
                            campaign.conversionRate >= 15 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {formatPercentage(campaign.conversionRate)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Real Estate Analytics */}
      {industry === 'real_estate' && realEstateData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <HomeIcon className="h-4 w-4 mr-1 text-blue-500" />
                      Propiedades
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatNumber(realEstateData.totalProperties)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">
                    {formatNumber(realEstateData.activeListings)} activas
                  </span>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1 text-green-500" />
                      Clientes
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatNumber(realEstateData.totalClients)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {formatNumber(realEstateData.totalSales)} ventas
                  </span>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <BanknotesIcon className="h-4 w-4 mr-1 text-purple-500" />
                      Ingresos
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatCurrency(realEstateData.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <HomeIcon className="h-4 w-4 mr-1 text-orange-500" />
                      Valor Promedio
                    </h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {formatCurrency(realEstateData.avgPropertyValue)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Ventas por Mes</h3>
              </Card.Header>
              <Card.Body>
                <div className="h-60">
                  <BarChart data={realEstateData.salesByMonth} color="green" />
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Propiedades por Tipo</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {realEstateData.propertiesByType.map((type, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{type.name}</span>
                        <span className="text-gray-600">{formatNumber(type.count)} ({type.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Estado de Propiedades</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {realEstateData.propertiesByStatus.map((status, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{status.status}</span>
                        <span className="text-gray-600">{formatNumber(status.count)} ({status.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status.status === 'En Venta' ? 'bg-blue-600' :
                            status.status === 'Vendida' ? 'bg-green-600' :
                            status.status === 'Reservada' ? 'bg-orange-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="font-medium text-gray-700">Fuentes de Leads</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {realEstateData.leadsBySource.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{source.name}</span>
                        <span className="text-gray-600">{formatNumber(source.count)} ({source.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
          
          {/* Sales by Agent */}
          <Card>
            <Card.Header>
              <h3 className="font-medium text-gray-700">Ventas por Agente</h3>
            </Card.Header>
            <Card.Body>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agente
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ventas
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {realEstateData.salesByAgent.map((agent, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {agent.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatNumber(agent.sales)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(agent.revenue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(agent.revenue / agent.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

// Bar Chart Component
const BarChart: React.FC<{
  data: TimeSeriesData[];
  color: string;
}> = ({ data, color }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end space-x-1">
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-xs text-gray-600 mb-1">{item.value}</div>
              <div 
                className={`w-full rounded-t-sm bg-${color}-500`} 
                style={{ height: `${heightPercentage}%`, maxWidth: '30px' }}
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

export default IndustryAnalytics;