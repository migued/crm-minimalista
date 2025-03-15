import React, { useState, useRef } from 'react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

// Tipos
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

interface KanbanStage {
  id: string;
  name: string;
  color: string;
  contacts: Contact[];
}

// Datos de ejemplo
const MOCK_STAGES: KanbanStage[] = [
  {
    id: 'stage-1',
    name: 'Contacto Inicial',
    color: '#3B82F6', // blue-500
    contacts: [
      {
        id: 'contact-1',
        firstName: 'Ana',
        lastName: 'Rodríguez',
        email: 'ana.rodriguez@ejemplo.com',
        phone: '+521098765432',
        tags: ['Prospecto'],
        assignedTo: 'Carlos López',
        createdAt: '2023-02-05T11:20:00',
        company: 'ABC Corp'
      },
      {
        id: 'contact-2',
        firstName: 'Miguel',
        lastName: 'Torres',
        email: 'miguel.torres@ejemplo.com',
        phone: '+525551234567',
        tags: ['Prospecto', 'Referido'],
        assignedTo: 'María González',
        createdAt: '2023-03-15T09:30:00',
        company: 'XYZ Inc'
      }
    ]
  },
  {
    id: 'stage-2',
    name: 'Calificación',
    color: '#8B5CF6', // purple-500
    contacts: [
      {
        id: 'contact-3',
        firstName: 'Pedro',
        lastName: 'Álvarez',
        email: 'pedro.alvarez@ejemplo.com',
        phone: '+527778889999',
        tags: ['Prospecto', 'Calificado'],
        assignedTo: 'Carlos López',
        createdAt: '2023-03-01T14:20:00',
        value: 5000,
        company: 'LMN Solutions'
      }
    ]
  },
  {
    id: 'stage-3',
    name: 'Propuesta',
    color: '#EAB308', // yellow-500
    contacts: [
      {
        id: 'contact-4',
        firstName: 'Laura',
        lastName: 'Martínez',
        email: 'laura.martinez@ejemplo.com',
        phone: '+527778889999',
        tags: ['Prospecto', 'Calificado'],
        assignedTo: 'Carlos López',
        createdAt: '2023-03-01T10:45:00',
        value: 15000,
        company: 'PQR Industries'
      }
    ]
  },
  {
    id: 'stage-4',
    name: 'Negociación',
    color: '#F97316', // orange-500
    contacts: [
      {
        id: 'contact-5',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@ejemplo.com',
        phone: '+521234567890',
        tags: ['Cliente', 'VIP'],
        assignedTo: 'María González',
        createdAt: '2023-01-10T08:15:00',
        value: 25000,
        company: 'ABC Corp'
      }
    ]
  },
  {
    id: 'stage-5',
    name: 'Cerrado Ganado',
    color: '#22C55E', // green-500
    contacts: [
      {
        id: 'contact-6',
        firstName: 'Roberto',
        lastName: 'Gómez',
        email: 'roberto.gomez@ejemplo.com',
        phone: '+525556667777',
        tags: ['Cliente', 'Recurrente'],
        assignedTo: 'María González',
        createdAt: '2022-11-15T16:30:00',
        value: 30000,
        company: 'DEF Ltd'
      }
    ]
  },
  {
    id: 'stage-6',
    name: 'Cerrado Perdido',
    color: '#EF4444', // red-500
    contacts: [
      {
        id: 'contact-7',
        firstName: 'Claudia',
        lastName: 'Herrera',
        email: 'claudia.herrera@ejemplo.com',
        phone: '+526665554444',
        tags: ['Perdido'],
        assignedTo: 'Carlos López',
        createdAt: '2022-12-10T11:20:00',
        value: 10000,
        company: 'GHI Enterprises'
      }
    ]
  }
];

const KanbanBoard: React.FC = () => {
  const [stages, setStages] = useState<KanbanStage[]>(MOCK_STAGES);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [sourceStage, setSourceStage] = useState<string | null>(null);
  
  const dragContact = useRef<Contact | null>(null);
  const dragStage = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, contact: Contact, stageId: string) => {
    dragContact.current = contact;
    dragStage.current = stageId;
    setActiveContact(contact);
    setSourceStage(stageId);
    
    // Agregar estilo al elemento arrastrado
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', contact.id);
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('text/plain');
    
    if (dragContact.current && dragStage.current && dragStage.current !== targetStageId) {
      // Actualizar stages
      setStages(prev => {
        const newStages = [...prev];
        
        // Encontrar los índices de los stages de origen y destino
        const sourceStageIndex = newStages.findIndex(s => s.id === dragStage.current);
        const targetStageIndex = newStages.findIndex(s => s.id === targetStageId);
        
        if (sourceStageIndex !== -1 && targetStageIndex !== -1) {
          // Eliminar el contacto del stage de origen
          const contactIndex = newStages[sourceStageIndex].contacts.findIndex(c => c.id === dragContact.current?.id);
          if (contactIndex !== -1) {
            const [removedContact] = newStages[sourceStageIndex].contacts.splice(contactIndex, 1);
            // Añadir el contacto al stage de destino
            newStages[targetStageIndex].contacts.push(removedContact);
          }
        }
        
        return newStages;
      });
    }
    
    setActiveContact(null);
    setSourceStage(null);
    dragContact.current = null;
    dragStage.current = null;
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="inline-flex gap-4 p-4 min-w-full">
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            title={stage.name}
            count={stage.contacts.length}
            color={stage.color}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {stage.contacts.map(contact => (
              <KanbanCard
                key={contact.id}
                contact={contact}
                isActive={activeContact?.id === contact.id}
                onDragStart={(e) => handleDragStart(e, contact, stage.id)}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;