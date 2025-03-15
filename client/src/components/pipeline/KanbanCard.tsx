import React from 'react';
import Badge from '../ui/Badge';
import { CurrencyDollarIcon, BuildingOfficeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  assignedTo?: string;
  createdAt: string;
  value?: number;
  company?: string;
}

interface KanbanCardProps {
  contact: Contact;
  isActive: boolean;
  onDragStart: (e: React.DragEvent) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ contact, isActive, onDragStart }) => {
  const formatValue = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div
      className={`bg-white rounded-md shadow-sm p-3 cursor-move select-none ${
        isActive ? 'opacity-50' : ''
      }`}
      draggable
      onDragStart={onDragStart}
    >
      {/* Nombre y empresa */}
      <div className="mb-2">
        <h4 className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</h4>
        {contact.company && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
            {contact.company}
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {contact.tags.map(tag => (
            <Badge key={tag} text={tag} size="sm" variant={tag === 'VIP' ? 'purple' : 'gray'} />
          ))}
        </div>
      )}

      {/* Valor del negocio */}
      {contact.value && (
        <div className="flex items-center text-sm text-gray-700 font-medium mb-2">
          <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-600" />
          {formatValue(contact.value)}
        </div>
      )}

      {/* Asignado a */}
      {contact.assignedTo && (
        <div className="flex items-center text-xs text-gray-500">
          <UserCircleIcon className="h-3 w-3 mr-1" />
          {contact.assignedTo}
        </div>
      )}
    </div>
  );
};

export default KanbanCard;