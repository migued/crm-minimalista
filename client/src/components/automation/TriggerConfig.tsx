import React, { useState, useEffect } from 'react';
import {
  Trigger,
  TriggerEventType,
  TriggerCondition,
  TriggerSchedule,
  ConditionOperator
} from './types';

interface TriggerConfigProps {
  trigger: Trigger;
  onChange: (updatedTrigger: Trigger) => void;
}

const TriggerConfig: React.FC<TriggerConfigProps> = ({ trigger, onChange }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TriggerEventType;
    onChange({
      ...trigger,
      type: newType,
      // Resetear condiciones si cambia el tipo
      conditions: newType === TriggerEventType.SCHEDULED 
        ? undefined 
        : (trigger.conditions || {}),
      // Resetear o inicializar schedule si es de tipo programado
      schedule: newType === TriggerEventType.SCHEDULED 
        ? (trigger.schedule || { frequency: 'daily', time: '09:00' }) 
        : undefined
    });
  };

  const handleConditionChange = (field: keyof TriggerCondition, value: any) => {
    onChange({
      ...trigger,
      conditions: {
        ...(trigger.conditions || {}),
        [field]: value
      }
    });
  };

  const handleScheduleChange = (field: keyof TriggerSchedule, value: any) => {
    if (!trigger.schedule) return;
    
    onChange({
      ...trigger,
      schedule: {
        ...trigger.schedule,
        [field]: value
      }
    });
  };

  // Renderizar configuración según el tipo de trigger
  const renderTriggerTypeConfig = () => {
    switch (trigger.type) {
      case TriggerEventType.NEW_MESSAGE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal
              </label>
              <select
                value={trigger.conditions?.channel?.join(',') || ''}
                onChange={(e) => {
                  const channels = e.target.value ? e.target.value.split(',') : [];
                  handleConditionChange('channel', channels);
                }}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                multiple={false}
              >
                <option value="">Cualquier canal</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="web_chat">Chat Web</option>
                <option value="sms">SMS</option>
                <option value="whatsapp,sms">WhatsApp y SMS</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Selecciona los canales que activarán esta automatización
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido del mensaje contiene
              </label>
              <div className="flex space-x-2">
                <select
                  value={trigger.conditions?.operator || ConditionOperator.CONTAINS}
                  onChange={(e) => 
                    handleConditionChange('operator', e.target.value as ConditionOperator)
                  }
                  className="w-44 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={ConditionOperator.CONTAINS}>Contiene</option>
                  <option value={ConditionOperator.NOT_CONTAINS}>No contiene</option>
                  <option value={ConditionOperator.EQUALS}>Es exactamente</option>
                  <option value={ConditionOperator.NOT_EQUALS}>No es exactamente</option>
                </select>
                <input
                  type="text"
                  value={trigger.conditions?.value || ''}
                  onChange={(e) => handleConditionChange('value', e.target.value)}
                  placeholder="Palabras clave"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Opcional: Filtra mensajes que contengan ciertas palabras
              </p>
            </div>
          </div>
        );

      case TriggerEventType.CONTACT_UPDATED:
      case TriggerEventType.NEW_CONTACT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo específico (opcional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={trigger.conditions?.field || ''}
                  onChange={(e) => handleConditionChange('field', e.target.value)}
                  placeholder="Nombre del campo"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Por ejemplo: name, email, phone, etc.
              </p>
            </div>

            {trigger.conditions?.field && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición del campo
                </label>
                <div className="flex space-x-2">
                  <select
                    value={trigger.conditions?.operator || ConditionOperator.EQUALS}
                    onChange={(e) => 
                      handleConditionChange('operator', e.target.value as ConditionOperator)
                    }
                    className="w-44 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={ConditionOperator.EQUALS}>Es igual a</option>
                    <option value={ConditionOperator.NOT_EQUALS}>No es igual a</option>
                    <option value={ConditionOperator.CONTAINS}>Contiene</option>
                    <option value={ConditionOperator.NOT_CONTAINS}>No contiene</option>
                    <option value={ConditionOperator.GREATER_THAN}>Mayor que</option>
                    <option value={ConditionOperator.LESS_THAN}>Menor que</option>
                    <option value={ConditionOperator.EXISTS}>Existe</option>
                    <option value={ConditionOperator.NOT_EXISTS}>No existe</option>
                  </select>
                  
                  {trigger.conditions?.operator !== ConditionOperator.EXISTS && 
                   trigger.conditions?.operator !== ConditionOperator.NOT_EXISTS && (
                    <input
                      type="text"
                      value={trigger.conditions?.value || ''}
                      onChange={(e) => handleConditionChange('value', e.target.value)}
                      placeholder="Valor"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case TriggerEventType.TAG_ADDED:
      case TriggerEventType.TAG_REMOVED:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas específicas (opcional)
            </label>
            <input
              type="text"
              value={(trigger.conditions?.tags || []).join(', ')}
              onChange={(e) => {
                const tagsString = e.target.value;
                const tags = tagsString
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                handleConditionChange('tags', tags);
              }}
              placeholder="Ej: cliente_potencial, seguimiento, urgente"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Deja en blanco para activar con cualquier etiqueta
            </p>
          </div>
        );

      case TriggerEventType.PIPELINE_STAGE_CHANGED:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline
              </label>
              <select
                value={trigger.conditions?.field || ''}
                onChange={(e) => handleConditionChange('field', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Cualquier pipeline</option>
                <option value="pipeline_ventas">Pipeline de Ventas</option>
                <option value="pipeline_soporte">Pipeline de Soporte</option>
                <option value="pipeline_onboarding">Pipeline de Onboarding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etapa
              </label>
              <select
                value={trigger.conditions?.value || ''}
                onChange={(e) => handleConditionChange('value', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Cualquier etapa</option>
                <option value="lead">Lead</option>
                <option value="qualified">Calificado</option>
                <option value="proposal">Propuesta</option>
                <option value="negotiation">Negociación</option>
                <option value="closed_won">Cerrado Ganado</option>
                <option value="closed_lost">Cerrado Perdido</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Se activará cuando un contacto sea movido a esta etapa
              </p>
            </div>
          </div>
        );

      case TriggerEventType.SCHEDULED:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <select
                value={trigger.schedule?.frequency || 'daily'}
                onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="once">Una sola vez</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensualmente</option>
              </select>
            </div>

            {trigger.schedule?.frequency === 'once' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={trigger.schedule?.startDate ? new Date(trigger.schedule.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleScheduleChange('startDate', new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            {trigger.schedule?.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días de la semana
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, index) => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={(trigger.schedule?.daysOfWeek || []).includes(index)}
                        onChange={(e) => {
                          const currentDays = [...(trigger.schedule?.daysOfWeek || [])];
                          if (e.target.checked) {
                            if (!currentDays.includes(index)) {
                              currentDays.push(index);
                            }
                          } else {
                            const dayIndex = currentDays.indexOf(index);
                            if (dayIndex !== -1) {
                              currentDays.splice(dayIndex, 1);
                            }
                          }
                          handleScheduleChange('daysOfWeek', currentDays);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {trigger.schedule?.frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día del mes
                </label>
                <select
                  value={trigger.schedule?.dayOfMonth || 1}
                  onChange={(e) => handleScheduleChange('dayOfMonth', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {trigger.schedule?.frequency !== 'once' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  value={trigger.schedule?.time || '09:00'}
                  onChange={(e) => handleScheduleChange('time', e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={trigger.schedule?.startDate ? new Date(trigger.schedule.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleScheduleChange('startDate', new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de fin (opcional)
                </label>
                <input
                  type="date"
                  value={trigger.schedule?.endDate ? new Date(trigger.schedule.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleScheduleChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            No hay configuración adicional para este tipo de evento
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Evento
        </label>
        <select
          value={trigger.type}
          onChange={handleTypeChange}
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value={TriggerEventType.NEW_MESSAGE}>Nuevo mensaje recibido</option>
          <option value={TriggerEventType.NEW_CONTACT}>Nuevo contacto creado</option>
          <option value={TriggerEventType.CONTACT_UPDATED}>Contacto actualizado</option>
          <option value={TriggerEventType.PIPELINE_STAGE_CHANGED}>Cambio de etapa en pipeline</option>
          <option value={TriggerEventType.TAG_ADDED}>Etiqueta añadida</option>
          <option value={TriggerEventType.TAG_REMOVED}>Etiqueta eliminada</option>
          <option value={TriggerEventType.FORM_SUBMITTED}>Formulario enviado</option>
          <option value={TriggerEventType.SCHEDULED}>Evento programado</option>
        </select>
      </div>

      {/* Renderizar configuración específica del tipo de trigger */}
      {renderTriggerTypeConfig()}
    </div>
  );
};

export default TriggerConfig;