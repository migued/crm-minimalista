import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivities from '../../components/dashboard/RecentActivities';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  EnvelopeIcon, 
  PhoneIcon 
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Resumen de rendimiento y actividad reciente"
      />
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Contactos" 
          value="256" 
          icon={<UserGroupIcon className="h-5 w-5 text-blue-600" />}
          change={5.3}
          color="blue"
        />
        <StatCard 
          title="Valor del Pipeline" 
          value="$1,250,000" 
          icon={<CurrencyDollarIcon className="h-5 w-5 text-green-600" />}
          change={-2.4}
          color="green"
        />
        <StatCard 
          title="Correos Enviados" 
          value="843" 
          icon={<EnvelopeIcon className="h-5 w-5 text-purple-600" />}
          change={12.7}
          color="purple"
        />
        <StatCard 
          title="Conversaciones WhatsApp" 
          value="152" 
          icon={<PhoneIcon className="h-5 w-5 text-yellow-600" />}
          change={8.1}
          color="yellow"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline de ventas */}
        <div className="lg:col-span-2">
          <Card title="Estado del Pipeline">
            <div className="h-80">
              <div className="h-full flex items-center justify-center text-gray-500">
                Aquí irá el gráfico de pipeline
              </div>
            </div>
          </Card>
        </div>

        {/* Actividad reciente */}
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>

      {/* Próximas tareas y contactos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas pendientes */}
        <Card title="Tareas Pendientes">
          <div className="h-60">
            <div className="h-full flex items-center justify-center text-gray-500">
              Aquí irá la lista de tareas
            </div>
          </div>
        </Card>

        {/* Contactos recientes */}
        <Card title="Contactos Recientes">
          <div className="h-60">
            <div className="h-full flex items-center justify-center text-gray-500">
              Aquí irá la lista de contactos recientes
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;