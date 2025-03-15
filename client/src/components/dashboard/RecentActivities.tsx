import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../ui/Card';

// Datos de ejemplo para actividades recientes
const MOCK_ACTIVITIES = [
  {
    id: '1',
    type: 'contact_added',
    user: 'María González',
    target: 'Roberto Gómez',
    timestamp: '2023-04-20T14:30:00',
    details: 'Contacto añadido desde formulario web'
  },
  {
    id: '2',
    type: 'email_sent',
    user: 'Sistema',
    target: 'Ana Rodríguez',
    timestamp: '2023-04-20T12:15:00',
    details: 'Email automático de seguimiento enviado'
  },
  {
    id: '3',
    type: 'stage_change',
    user: 'Carlos López',
    target: 'Juan Pérez',
    timestamp: '2023-04-20T10:45:00',
    details: 'Movido de "Propuesta" a "Negociación"'
  },
  {
    id: '4',
    type: 'note_added',
    user: 'María González',
    target: 'Laura Martínez',
    timestamp: '2023-04-20T09:20:00',
    details: 'Añadida nota sobre preferencias del cliente'
  },
  {
    id: '5',
    type: 'task_completed',
    user: 'Carlos López',
    target: 'Proyecto XYZ',
    timestamp: '2023-04-19T16:30:00',
    details: 'Completada tarea "Enviar propuesta final"'
  }
];

// Íconos y colores para cada tipo de actividad
const activityTypeConfig: { [key: string]: { icon: string; bgColor: string; textColor: string } } = {
  contact_added: {
    icon: '👤',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  email_sent: {
    icon: '✉️',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800'
  },
  stage_change: {
    icon: '🔄',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  note_added: {
    icon: '📝',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  task_completed: {
    icon: '✅',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  }
};

const RecentActivities: React.FC = () => {
  // Función para formatear la hora
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'HH:mm', { locale: es });
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return format(date, 'dd MMM', { locale: es });
    }
  };

  // Agrupar actividades por fecha
  const groupedActivities = MOCK_ACTIVITIES.reduce((acc, activity) => {
    const dateKey = formatDate(activity.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {} as Record<string, typeof MOCK_ACTIVITIES>);

  return (
    <Card title="Actividad Reciente">
      <div className="flow-root">
        <ul className="-mb-8">
          {Object.entries(groupedActivities).map(([date, activities], groupIndex) => (
            <React.Fragment key={date}>
              <li className="relative pb-2">
                <div className="relative flex items-center space-x-3">
                  <div>
                    <span className="bg-gray-200 h-8 w-20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">{date}</span>
                    </span>
                  </div>
                </div>
              </li>
              {activities.map((activity, activityIndex) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIndex !== activities.length - 1 || groupIndex !== Object.keys(groupedActivities).length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`${
                            activityTypeConfig[activity.type]?.bgColor || 'bg-gray-100'
                          } h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}
                        >
                          <span className="text-lg">
                            {activityTypeConfig[activity.type]?.icon || '🔵'}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{activity.user}</span> {activity.type === 'email_sent' && 'envió un correo a'}
                            {activity.type === 'contact_added' && 'agregó el contacto'}
                            {activity.type === 'stage_change' && 'cambió la etapa de'}
                            {activity.type === 'note_added' && 'agregó una nota para'}
                            {activity.type === 'task_completed' && 'completó una tarea en'}
                            {' '}
                            <a href="#" className="font-medium text-gray-900">
                              {activity.target}
                            </a>
                          </p>
                          {activity.details && (
                            <p className="mt-0.5 text-sm text-gray-500">
                              {activity.details}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-center">
        <a
          href="#"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ver todas las actividades
        </a>
      </div>
    </Card>
  );
};

export default RecentActivities;