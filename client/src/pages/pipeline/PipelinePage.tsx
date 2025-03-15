import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import KanbanBoard from '../../components/pipeline/KanbanBoard';
import { 
  PlusIcon, 
  AdjustmentsVerticalIcon, 
  ChartBarIcon, 
  ViewColumnsIcon 
} from '@heroicons/react/24/outline';

// Simulación de datos de pipelines disponibles
const MOCK_PIPELINES = [
  { id: 'pipeline-1', name: 'Pipeline Principal' },
  { id: 'pipeline-2', name: 'Venta de Propiedades' },
  { id: 'pipeline-3', name: 'Matriculaciones' }
];

const PipelinePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'kanban' | 'list'>('kanban');
  const [selectedPipeline, setSelectedPipeline] = useState(MOCK_PIPELINES[0]);

  const handleAddContact = () => {
    console.log('Añadir contacto');
  };

  const handleAddStage = () => {
    console.log('Añadir etapa');
  };

  const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pipeline = MOCK_PIPELINES.find(p => p.id === e.target.value);
    if (pipeline) {
      setSelectedPipeline(pipeline);
    }
  };

  return (
    <div className="space-y-6 h-full">
      <PageHeader 
        title="Pipeline de Ventas" 
        subtitle="Gestiona tus oportunidades y visualiza el progreso"
        actions={
          <div className="flex space-x-3">
            <div>
              <select
                id="pipeline-select"
                name="pipeline-select"
                value={selectedPipeline.id}
                onChange={handlePipelineChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {MOCK_PIPELINES.map(pipeline => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentView(currentView === 'kanban' ? 'list' : 'kanban')}
            >
              {currentView === 'kanban' ? (
                <ViewColumnsIcon className="h-4 w-4 mr-2" />
              ) : (
                <ChartBarIcon className="h-4 w-4 mr-2" />
              )}
              {currentView === 'kanban' ? 'Ver Lista' : 'Ver Kanban'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleAddStage}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Etapa
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddContact}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Añadir Contacto
            </Button>
          </div>
        }
      />
      
      {/* Panel de configuración */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Total contactos:</span>
            <span className="ml-1 text-sm font-semibold text-gray-900">15</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Valor total:</span>
            <span className="ml-1 text-sm font-semibold text-gray-900">$85,000</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Filtrar:</span>
          <select
            id="filter-select"
            name="filter-select"
            className="block w-40 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Todos</option>
            <option value="assigned-me">Asignados a mí</option>
            <option value="recent">Recientes</option>
          </select>
          <Button variant="outline" size="sm" className="ml-2">
            <AdjustmentsVerticalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Vista principal */}
      <div className="flex-1 h-[calc(100vh-16rem)] overflow-hidden">
        {currentView === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <div className="h-full flex items-center justify-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">Vista de lista en construcción</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelinePage;