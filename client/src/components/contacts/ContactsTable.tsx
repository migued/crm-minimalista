import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  PencilSquareIcon, 
  TrashIcon, 
  EllipsisVerticalIcon 
} from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';

// Simulación de datos de contactos
const MOCK_CONTACTS = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+521234567890',
    tags: ['Cliente', 'VIP'],
    pipelineStage: 'Negociación',
    assignedTo: 'María González',
    lastContactedAt: '2023-04-15T10:30:00',
    createdAt: '2023-01-10T08:15:00'
  },
  {
    id: '2',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    email: 'ana.rodriguez@ejemplo.com',
    phone: '+521098765432',
    tags: ['Prospecto'],
    pipelineStage: 'Contacto Inicial',
    assignedTo: 'Carlos López',
    lastContactedAt: '2023-04-18T14:45:00',
    createdAt: '2023-02-05T11:20:00'
  },
  {
    id: '3',
    firstName: 'Roberto',
    lastName: 'Gómez',
    email: 'roberto.gomez@ejemplo.com',
    phone: '+525556667777',
    tags: ['Cliente', 'Recurrente'],
    pipelineStage: 'Cerrado Ganado',
    assignedTo: 'María González',
    lastContactedAt: '2023-04-10T09:15:00',
    createdAt: '2022-11-15T16:30:00'
  },
  {
    id: '4',
    firstName: 'Laura',
    lastName: 'Martínez',
    email: 'laura.martinez@ejemplo.com',
    phone: '+527778889999',
    tags: ['Prospecto', 'Calificado'],
    pipelineStage: 'Propuesta',
    assignedTo: 'Carlos López',
    lastContactedAt: '2023-04-17T11:00:00',
    createdAt: '2023-03-01T10:45:00'
  },
  {
    id: '5',
    firstName: 'Miguel',
    lastName: 'Sánchez',
    email: 'miguel.sanchez@ejemplo.com',
    phone: '+524443332222',
    tags: ['Cliente', 'Inactivo'],
    pipelineStage: 'Cerrado Perdido',
    assignedTo: 'María González',
    lastContactedAt: '2023-03-05T15:30:00',
    createdAt: '2022-09-20T13:15:00'
  }
];

// Mapeo de etapas a colores
const stageBadgeColor: { [key: string]: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' } = {
  'Contacto Inicial': 'blue',
  'Calificación': 'purple',
  'Propuesta': 'yellow',
  'Negociación': 'yellow',
  'Cerrado Ganado': 'green',
  'Cerrado Perdido': 'red',
};

interface ContactsTableProps {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ContactsTable: React.FC<ContactsTableProps> = ({ onEdit, onDelete, onView }) => {
  const [contacts] = useState(MOCK_CONTACTS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastName', direction: 'asc' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedContacts = () => {
    const sortableContacts = [...contacts];
    if (sortConfig.key) {
      sortableContacts.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableContacts;
  };

  const sortedContacts = getSortedContacts();

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center">
                      Nombre
                      {sortConfig.key === 'lastName' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUpIcon className="w-4 h-4 ml-1" /> 
                          : <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Contacto
                      {sortConfig.key === 'email' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUpIcon className="w-4 h-4 ml-1" /> 
                          : <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('pipelineStage')}
                  >
                    <div className="flex items-center">
                      Etapa
                      {sortConfig.key === 'pipelineStage' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUpIcon className="w-4 h-4 ml-1" /> 
                          : <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastContactedAt')}
                  >
                    <div className="flex items-center">
                      Último Contacto
                      {sortConfig.key === 'lastContactedAt' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUpIcon className="w-4 h-4 ml-1" /> 
                          : <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">Creado el {formatDate(contact.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <Badge key={tag} text={tag} variant="gray" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        text={contact.pipelineStage} 
                        variant={stageBadgeColor[contact.pipelineStage] || 'gray'} 
                        size="md" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.lastContactedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Menu as="div" className="relative inline-block text-left">
                        <div>
                          <Menu.Button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                          </Menu.Button>
                        </div>

                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                              {onView && (
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onView(contact.id)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } block w-full text-left px-4 py-2 text-sm`}
                                    >
                                      Ver detalles
                                    </button>
                                  )}
                                </Menu.Item>
                              )}
                              {onEdit && (
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onEdit(contact.id)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } block w-full text-left px-4 py-2 text-sm`}
                                    >
                                      <PencilSquareIcon className="h-4 w-4 inline mr-2" />
                                      Editar
                                    </button>
                                  )}
                                </Menu.Item>
                              )}
                              {onDelete && (
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onDelete(contact.id)}
                                      className={`${
                                        active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                      } block w-full text-left px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4 inline mr-2" />
                                      Eliminar
                                    </button>
                                  )}
                                </Menu.Item>
                              )}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;