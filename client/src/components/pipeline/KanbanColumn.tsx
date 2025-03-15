import React, { ReactNode } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  children: ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id, 
  title, 
  count, 
  color,
  children,
  onDragOver,
  onDrop
}) => {
  // Estilo para el borde superior de la columna, usando el color proporcionado
  const headerStyle = {
    borderTop: `4px solid ${color}`
  };

  return (
    <div 
      className="flex flex-col w-72 bg-gray-100 rounded-md shadow-sm"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Encabezado de la columna */}
      <div 
        className="p-3 bg-white rounded-t-md shadow-sm"
        style={headerStyle}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <div className="mt-1 text-xs text-gray-500">
              {count} contacto{count !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Contenedor para las tarjetas */}
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <div className="space-y-2">
          {children}
        </div>

        {/* Área para soltar cuando no hay tarjetas */}
        {!React.Children.count(children) && (
          <div className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm">
            Arrastra contactos aquí
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;