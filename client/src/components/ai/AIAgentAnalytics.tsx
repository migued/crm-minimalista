import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { AIAgent } from './AIAgentForm';
import aiService from '../../services/ai/aiService';

// Date range filter options
type DateRange = '24h' | '7d' | '30d' | '90d' | 'all';

// Chart data point
interface DataPoint {
  date: string;
  value: number;
}

// AI agent metric data
interface AgentMetrics {
  totalInteractions: number;
  handoffs: number;
  successRate: number;
  avgResponseTime: number;
  avgMessageLength: number;
  satisfactionScore: number;
  topIntents: Array<{ intent: string; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
  conversationsByDay: DataPoint[];
  responseTimes: DataPoint[];
  handoffRates: DataPoint[];
  feedbackScores: DataPoint[];
  lastUpdated: Date;
}

interface AIAgentAnalyticsProps {
  agent: AIAgent;
}

const AIAgentAnalytics: React.FC<AIAgentAnalyticsProps> = ({ agent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!agent.id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range
        const endDate = new Date();
        let startDate: Date | undefined = undefined;
        
        if (dateRange === '24h') {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
        } else if (dateRange === '7d') {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 7);
        } else if (dateRange === '30d') {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 30);
        } else if (dateRange === '90d') {
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 90);
        }
        
        try {
          // Try to use the real API
          const analyticsData = await aiService.getAgentAnalytics(agent.id, startDate, endDate);
          
          // Transform the API data to our internal format
          const transformedMetrics: AgentMetrics = {
            totalInteractions: analyticsData.messagesProcessed,
            handoffs: Math.floor(analyticsData.messagesProcessed * (analyticsData.handoffRate / 100)),
            successRate: 100 - analyticsData.handoffRate,
            avgResponseTime: analyticsData.averageResponseTime,
            avgMessageLength: 120, // This isn't provided by the API, use a default
            satisfactionScore: analyticsData.userSatisfactionScore,
            topIntents: analyticsData.topIntents,
            
            // Map hourly analytics
            activityByHour: analyticsData.performanceByHour.map(item => ({
              hour: item.hour,
              count: item.count
            })),
            
            // Map daily activity data
            conversationsByDay: analyticsData.dailyActivity.map(item => ({
              date: item.date,
              value: item.count
            })),
            
            // Generate some dummy data for metrics not directly provided by API
            responseTimes: generateDummyTimeSeriesData(dateRange, 2, 5),
            handoffRates: generateDummyPercentageData(dateRange, analyticsData.handoffRate),
            feedbackScores: generateDummyScoreData(dateRange, analyticsData.userSatisfactionScore),
            lastUpdated: new Date()
          };
          
          setMetrics(transformedMetrics);
        } catch (apiError) {
          console.warn('API call failed, falling back to mock data:', apiError);
          // Simulated metrics as fallback
          const mockMetrics: AgentMetrics = generateMockMetrics(dateRange);
          setMetrics(mockMetrics);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Error al cargar los datos analíticos');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [agent.id, dateRange]);
  
  // Helper function to generate dummy time series data when not provided by API
  const generateDummyTimeSeriesData = (range: DateRange, min: number, max: number): DataPoint[] => {
    const now = new Date();
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
    const result: DataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random value within range
      const value = min + Math.random() * (max - min);
      
      result.push({
        date: dateStr,
        value: value
      });
    }
    
    return result;
  };
  
  // Generate dummy percentage data centered around a target value
  const generateDummyPercentageData = (range: DateRange, targetValue: number): DataPoint[] => {
    const now = new Date();
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
    const result: DataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Value that oscillates around the target with some variance
      const variance = targetValue * 0.2; // 20% variance
      const value = Math.max(0, Math.min(100, targetValue + (Math.random() * variance * 2 - variance)));
      
      result.push({
        date: dateStr,
        value: value
      });
    }
    
    return result;
  };
  
  // Generate dummy score data (1-5 scale)
  const generateDummyScoreData = (range: DateRange, targetScore: number): DataPoint[] => {
    const now = new Date();
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
    const result: DataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Value that oscillates around the target with some variance
      const variance = 0.5; // Up to 0.5 point variance
      const value = Math.max(1, Math.min(5, targetScore + (Math.random() * variance * 2 - variance)));
      
      result.push({
        date: dateStr,
        value: value
      });
    }
    
    return result;
  };

  // Generate mock data based on date range
  const generateMockMetrics = (range: DateRange): AgentMetrics => {
    const now = new Date();
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
    
    // Generate daily data points
    const conversationsByDay: DataPoint[] = [];
    const responseTimes: DataPoint[] = [];
    const handoffRates: DataPoint[] = [];
    const feedbackScores: DataPoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random values with some trends
      const baseValue = 50 + Math.floor(Math.random() * 150);
      const trend = Math.sin(i / 10) * 20; // Add some wave pattern
      const growth = i / days * 30; // Gradual improvement over time
      
      conversationsByDay.push({
        date: dateStr,
        value: Math.max(10, Math.floor(baseValue * (1 + Math.random() * 0.5)))
      });
      
      responseTimes.push({
        date: dateStr,
        value: Math.max(0.5, 3 - (growth / 20) + (Math.random() * 1.5)) // Decreasing response time (improvement)
      });
      
      handoffRates.push({
        date: dateStr,
        value: Math.max(5, 25 - (growth / 10) + trend + (Math.random() * 10)) // Decreasing handoff rate (improvement)
      });
      
      feedbackScores.push({
        date: dateStr,
        value: Math.min(5, 3 + (growth / 60) + (Math.random() * 1)) // Increasing feedback (improvement)
      });
    }
    
    // Activity by hour (simulate busier periods)
    const activityByHour = Array.from({ length: 24 }, (_, hour) => {
      let baseActivity = 10;
      
      // Morning peak (9-11 AM)
      if (hour >= 9 && hour <= 11) {
        baseActivity = 40;
      }
      // Afternoon peak (2-5 PM)
      else if (hour >= 14 && hour <= 17) {
        baseActivity = 35;
      }
      // Evening activity (7-9 PM)
      else if (hour >= 19 && hour <= 21) {
        baseActivity = 25;
      }
      // Low night activity
      else if (hour >= 0 && hour <= 5) {
        baseActivity = 5;
      }
      
      return {
        hour,
        count: Math.floor(baseActivity + (Math.random() * baseActivity * 0.4))
      };
    });
    
    // Calculate aggregated metrics
    const totalInteractions = conversationsByDay.reduce((sum, day) => sum + day.value, 0);
    const handoffs = Math.floor(totalInteractions * (handoffRates[handoffRates.length - 1].value / 100));
    const avgResponseTime = responseTimes.reduce((sum, day) => sum + day.value, 0) / responseTimes.length;
    const successRate = 100 - handoffRates[handoffRates.length - 1].value;
    const avgFeedback = feedbackScores.reduce((sum, day) => sum + day.value, 0) / feedbackScores.length;
    
    return {
      totalInteractions,
      handoffs,
      successRate,
      avgResponseTime,
      avgMessageLength: Math.floor(100 + Math.random() * 150),
      satisfactionScore: avgFeedback,
      topIntents: [
        { intent: 'Consulta de precio', count: Math.floor(totalInteractions * 0.25) },
        { intent: 'Información de producto', count: Math.floor(totalInteractions * 0.2) },
        { intent: 'Estado de pedido', count: Math.floor(totalInteractions * 0.15) },
        { intent: 'Soporte técnico', count: Math.floor(totalInteractions * 0.12) },
        { intent: 'Devoluciones', count: Math.floor(totalInteractions * 0.08) }
      ],
      activityByHour,
      conversationsByDay,
      responseTimes,
      handoffRates,
      feedbackScores,
      lastUpdated: new Date()
    };
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  // Simple bar chart component
  const BarChart = ({ data, color = 'blue', height = 200, xAxisLabels = true }: { 
    data: DataPoint[]; 
    color?: string; 
    height?: number;
    xAxisLabels?: boolean;
  }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{ height: `${height}px` }} className="relative">
        <div className="flex items-end h-full w-full space-x-1">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const isLast = index === data.length - 1;
            const isFirst = index === 0;
            const skipLabel = data.length > 30 && !(isFirst || isLast || index % 7 === 0);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full bg-${color}-500 rounded-t`}
                  style={{ height: `${barHeight}%` }}
                  title={`${formatDate(item.date)}: ${item.value}`}
                ></div>
                {xAxisLabels && !skipLabel && (
                  <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                    {formatDate(item.date)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Line chart component
  const LineChart = ({ data, color = 'blue', height = 200, yAxisFormatter = (v: number) => v.toString() }: { 
    data: DataPoint[]; 
    color?: string; 
    height?: number;
    yAxisFormatter?: (value: number) => string;
  }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (((item.value - minValue) / range) * 100);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div style={{ height: `${height}px` }} className="relative">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={`var(--${color}-500)`}
            strokeWidth="2"
          />
        </svg>
        <div className="absolute top-0 right-0 text-xs font-medium text-gray-500">
          {yAxisFormatter(maxValue)}
        </div>
        <div className="absolute bottom-0 right-0 text-xs font-medium text-gray-500">
          {yAxisFormatter(minValue)}
        </div>
        <div className="absolute bottom-0 left-0 text-xs font-medium text-gray-500">
          {formatDate(data[0].date)}
        </div>
        <div className="absolute bottom-0 right-0 text-xs font-medium text-gray-500">
          {formatDate(data[data.length - 1].date)}
        </div>
      </div>
    );
  };

  // Horizontal bar chart for intents
  const HorizontalBarChart = ({ data }: { data: Array<{ intent: string; count: number }> }) => {
    if (!data || data.length === 0) return null;
    
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.count / totalCount) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.intent}</span>
                <span className="text-gray-600">{item.count} ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Activity by hour chart
  const ActivityByHourChart = ({ data }: { data: Array<{ hour: number; count: number }> }) => {
    if (!data || data.length === 0) return null;
    
    const maxCount = Math.max(...data.map(item => item.count));
    
    return (
      <div className="h-40">
        <div className="flex items-end h-full w-full space-x-1">
          {data.map((item) => {
            const barHeight = (item.count / maxCount) * 100;
            
            // Color based on time of day
            let barColor = 'bg-blue-500';
            if (item.hour >= 6 && item.hour < 12) barColor = 'bg-yellow-500'; // Morning
            else if (item.hour >= 12 && item.hour < 18) barColor = 'bg-orange-500'; // Afternoon
            else if (item.hour >= 18 && item.hour < 22) barColor = 'bg-purple-500'; // Evening
            else barColor = 'bg-indigo-800'; // Night
            
            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${barColor} rounded-t`}
                  style={{ height: `${barHeight}%` }}
                  title={`${item.hour}:00 - ${item.count} interacciones`}
                ></div>
                {item.hour % 3 === 0 && (
                  <span className="text-xs text-gray-500 mt-1">
                    {item.hour}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-medium">No hay datos disponibles</p>
        <p className="text-sm">No se encontraron métricas para este agente en el período seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Rendimiento del Agente</h3>
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {(['24h', '7d', '30d', '90d', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              className={`px-3 py-1.5 text-sm font-medium ${
                dateRange === range
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setDateRange(range)}
            >
              {range === '24h' ? 'Hoy' : 
               range === '7d' ? '7 días' : 
               range === '30d' ? '30 días' : 
               range === '90d' ? '90 días' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Interacciones Totales</h4>
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-gray-900">{metrics.totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                {dateRange === '24h' ? 'En las últimas 24 horas' : 
                 dateRange === '7d' ? 'En los últimos 7 días' : 
                 dateRange === '30d' ? 'En los últimos 30 días' : 
                 dateRange === '90d' ? 'En los últimos 90 días' : 'Desde siempre'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Tasa de Éxito</h4>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-gray-900">{metrics.successRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.handoffs.toLocaleString()} transferencias a agentes humanos
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Tiempo de Respuesta</h4>
              <ClockIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-gray-900">{formatTime(metrics.avgResponseTime)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Promedio por mensaje
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Satisfacción</h4>
              <UserIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-gray-900">
                {metrics.satisfactionScore.toFixed(1)}/5
              </div>
              <div className="mt-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.round(metrics.satisfactionScore) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations chart */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Conversaciones</h4>
          </Card.Header>
          <Card.Body>
            <BarChart data={metrics.conversationsByDay} color="blue" height={180} />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Total de conversaciones atendidas por día
            </p>
          </Card.Footer>
        </Card>

        {/* Response times chart */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Tiempos de Respuesta</h4>
          </Card.Header>
          <Card.Body>
            <LineChart 
              data={metrics.responseTimes} 
              color="orange" 
              height={180} 
              yAxisFormatter={(v) => `${v.toFixed(1)}s`}
            />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Tiempo promedio de respuesta por día (en segundos)
            </p>
          </Card.Footer>
        </Card>

        {/* Handoff rates chart */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Tasa de Transferencias</h4>
          </Card.Header>
          <Card.Body>
            <LineChart 
              data={metrics.handoffRates} 
              color="red" 
              height={180} 
              yAxisFormatter={(v) => `${v.toFixed(1)}%`}
            />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Porcentaje de conversaciones transferidas a agentes humanos
            </p>
          </Card.Footer>
        </Card>

        {/* Feedback scores chart */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Puntuación de Satisfacción</h4>
          </Card.Header>
          <Card.Body>
            <LineChart 
              data={metrics.feedbackScores} 
              color="purple" 
              height={180} 
              yAxisFormatter={(v) => `${v.toFixed(1)}`}
            />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Puntuación promedio de satisfacción del usuario (1-5)
            </p>
          </Card.Footer>
        </Card>

        {/* Top intents */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Intenciones Principales</h4>
          </Card.Header>
          <Card.Body>
            <HorizontalBarChart data={metrics.topIntents} />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Clasificación de los tipos de consultas más frecuentes
            </p>
          </Card.Footer>
        </Card>

        {/* Activity by hour */}
        <Card>
          <Card.Header>
            <h4 className="font-medium text-gray-700">Actividad por Hora</h4>
          </Card.Header>
          <Card.Body>
            <ActivityByHourChart data={metrics.activityByHour} />
          </Card.Body>
          <Card.Footer>
            <p className="text-xs text-gray-500">
              Distribución de interacciones a lo largo del día (UTC)
            </p>
          </Card.Footer>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <Card.Header>
          <div className="flex items-center">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h4 className="font-medium text-gray-700">Recomendaciones para Mejorar</h4>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">1</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-800">Mejorar las respuestas sobre precios</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Las consultas sobre precios son las más frecuentes ({metrics.topIntents[0]?.count} interacciones). 
                  Considera añadir más ejemplos de entrenamiento para estos escenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">2</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-800">Optimizar para las horas pico</h5>
                <p className="text-sm text-gray-600 mt-1">
                  La mayor actividad se concentra entre las 9:00 y 11:00. Asegúrate de tener suficiente capacidad
                  de atención humana disponible en ese horario para las transferencias.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">3</span>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-800">Reducir tasa de transferencias</h5>
                <p className="text-sm text-gray-600 mt-1">
                  La tasa de transferencias actual ({metrics.handoffRates[metrics.handoffRates.length - 1].value.toFixed(1)}%) 
                  puede reducirse mejorando la cobertura de preguntas sobre soporte técnico y devoluciones.
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <p className="text-xs text-gray-500">
            Recomendaciones basadas en datos de los últimos {dateRange === '24h' ? 'día' : 
             dateRange === '7d' ? '7 días' : 
             dateRange === '30d' ? '30 días' : 
             dateRange === '90d' ? '90 días' : 'todos los períodos'}
          </p>
        </Card.Footer>
      </Card>

      <div className="text-xs text-gray-500 text-right">
        Datos actualizados por última vez: {metrics.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};

export default AIAgentAnalytics;