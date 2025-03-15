import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import ContactsTable from '../../components/contacts/ContactsTable';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ContactsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  const handleAddContact = () => {
    // Aquí iría la lógica para añadir un contacto
    console.log('Añadir contacto');
  };

  const handleEditContact = (id: string) => {
    // Aquí iría la lógica para editar un contacto
    console.log('Editar contacto', id);
  };

  const handleDeleteContact = (id: string) => {
    // Aquí iría la lógica para eliminar un contacto
    console.log('Eliminar contacto', id);
  };

  const handleViewContact = (id: string) => {
    // Aquí iría la lógica para ver un contacto
    console.log('Ver contacto', id);
  };

  const handleExportContacts = () => {
    // Aquí iría la lógica para exportar contactos
    console.log('Exportar contactos');
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contactos" 
        subtitle="Gestiona tus contactos y leads"
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleExportContacts}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleToggleFilters}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddContact}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        }
      />
      
      {/* Filtros (ocultos por defecto) */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <select
                id="tag-filter"
                name="tag-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todas las etiquetas</option>
                <option value="cliente">Cliente</option>
                <option value="prospecto">Prospecto</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label htmlFor="stage-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Etapa
              </label>
              <select
                id="stage-filter"
                name="stage-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todas las etapas</option>
                <option value="contacto-inicial">Contacto Inicial</option>
                <option value="calificacion">Calificación</option>
                <option value="propuesta">Propuesta</option>
                <option value="negociacion">Negociación</option>
                <option value="cerrado-ganado">Cerrado Ganado</option>
                <option value="cerrado-perdido">Cerrado Perdido</option>
              </select>
            </div>
            <div>
              <label htmlFor="assigned-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Asignado a
              </label>
              <select
                id="assigned-filter"
                name="assigned-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todos los agentes</option>
                <option value="maria-gonzalez">María González</option>
                <option value="carlos-lopez">Carlos López</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="mr-2">
              Limpiar filtros
            </Button>
            <Button variant="primary" size="sm">
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}
      
      {/* Tabla de contactos */}
      <ContactsTable 
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        onView={handleViewContact}
      />
    </div>
  );
};

export default ContactsPage;