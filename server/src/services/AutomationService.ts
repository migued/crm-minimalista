import Automation, { TriggerEventType, ActionType, IAutomation } from '../models/Automation';
import Contact from '../models/Contact';
import Conversation from '../models/Conversation';
import { AIAgent } from '../models/AIAgent';
import User from '../models/User';
import openAIService from './OpenAIService';
import whatsAppService from './WhatsAppService';
import mongoose from 'mongoose';

class AutomationService {
  /**
   * Procesa un evento para verificar y ejecutar automatizaciones
   */
  public async processEvent(
    eventType: TriggerEventType,
    payload: Record<string, any>,
    organizationId: string
  ): Promise<{
    automationsTriggered: number;
    automationsExecuted: number;
    errors: string[];
  }> {
    try {
      // Buscar automatizaciones activas para este tipo de evento
      const automations = await Automation.find({
        organizationId,
        isActive: true,
        'trigger.type': eventType
      });

      if (!automations || automations.length === 0) {
        return {
          automationsTriggered: 0,
          automationsExecuted: 0,
          errors: []
        };
      }

      const results = {
        automationsTriggered: 0,
        automationsExecuted: 0,
        errors: [] as string[]
      };

      // Verificar cada automatización
      for (const automation of automations) {
        try {
          const shouldTrigger = await this.evaluateTriggerConditions(
            automation,
            payload
          );

          if (shouldTrigger) {
            results.automationsTriggered++;
            await this.executeAutomation(automation, payload);
            results.automationsExecuted++;
          }
        } catch (error) {
          console.error(`Error processing automation ${automation._id}:`, error);
          results.errors.push(
            `Error en automatización "${automation.name}": ${(error as Error).message}`
          );
        }
      }

      return results;
    } catch (error) {
      console.error('Error in processEvent:', error);
      throw error;
    }
  }

  /**
   * Evalúa si se cumplen las condiciones para disparar la automatización
   */
  private async evaluateTriggerConditions(
    automation: IAutomation,
    payload: Record<string, any>
  ): Promise<boolean> {
    const { trigger } = automation;
    
    // Si no hay condiciones, se dispara siempre
    if (!trigger.conditions) {
      return true;
    }

    // Comprobar canal si está especificado
    if (
      trigger.conditions.channel &&
      trigger.conditions.channel.length > 0 &&
      payload.channel &&
      !trigger.conditions.channel.includes(payload.channel)
    ) {
      return false;
    }

    // Comprobar tags si están especificados
    if (
      trigger.conditions.tags &&
      trigger.conditions.tags.length > 0 &&
      payload.tags
    ) {
      const hasMatchingTag = trigger.conditions.tags.some((tag) =>
        payload.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Comprobar condición de campo si está especificada
    if (trigger.conditions.field && trigger.conditions.operator) {
      const fieldValue = this.getValueFromPath(payload, trigger.conditions.field);
      const targetValue = trigger.conditions.value;

      // Si el campo no existe en el payload, no se cumple la condición
      if (fieldValue === undefined) {
        return false;
      }

      // Evaluar según el operador
      switch (trigger.conditions.operator) {
        case 'equals':
          return fieldValue === targetValue;
        case 'notEquals':
          return fieldValue !== targetValue;
        case 'contains':
          return String(fieldValue).includes(String(targetValue));
        case 'notContains':
          return !String(fieldValue).includes(String(targetValue));
        case 'greaterThan':
          return Number(fieldValue) > Number(targetValue);
        case 'lessThan':
          return Number(fieldValue) < Number(targetValue);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        case 'notExists':
          return fieldValue === undefined || fieldValue === null;
        default:
          return false;
      }
    }

    // Si se llega aquí, se cumplen todas las condiciones
    return true;
  }

  /**
   * Ejecuta una automatización con sus acciones
   */
  private async executeAutomation(
    automation: IAutomation,
    payload: Record<string, any>
  ): Promise<void> {
    // Aumentar el contador de ejecuciones
    automation.totalExecutions += 1;
    automation.lastExecutedAt = new Date();

    try {
      // Ordenar acciones por su orden
      const sortedActions = [...automation.actions].sort((a, b) => a.order - b.order);
      
      // Variables para guardar resultado de acciones
      const results: Record<string, any> = {};
      let actionIndex = 0;

      // Ejecutar acciones en orden
      for (const action of sortedActions) {
        // Ejecutar acción
        try {
          const result = await this.executeAction(action, payload, results);
          results[`action_${actionIndex}`] = result;
          actionIndex++;
        } catch (error) {
          console.error(`Error executing action ${action.name}:`, error);
          throw new Error(`Error en acción "${action.name}": ${(error as Error).message}`);
        }
      }

      // Actualizar stats de éxito
      automation.successfulExecutions += 1;
      await automation.save();
    } catch (error) {
      // Actualizar stats de fallo
      automation.failedExecutions += 1;
      await automation.save();
      throw error;
    }
  }

  /**
   * Ejecuta una acción individual de la automatización
   */
  private async executeAction(
    action: any,
    payload: Record<string, any>,
    previousResults: Record<string, any>
  ): Promise<any> {
    // Comprobar condiciones si existen
    if (action.conditions && action.conditions.length > 0) {
      const conditionsMet = this.evaluateActionConditions(action.conditions, payload, previousResults);
      if (!conditionsMet) {
        return { skipped: true, reason: 'Conditions not met' };
      }
    }

    // Ejecutar según el tipo de acción
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return this.executeSendMessage(action.config, payload);
      
      case ActionType.ASSIGN_AGENT:
        return this.executeAssignAgent(action.config, payload);
      
      case ActionType.UPDATE_CONTACT:
        return this.executeUpdateContact(action.config, payload);
      
      case ActionType.ADD_TAG:
        return this.executeAddTag(action.config, payload);
      
      case ActionType.REMOVE_TAG:
        return this.executeRemoveTag(action.config, payload);
      
      case ActionType.MOVE_PIPELINE:
        return this.executeMovePipeline(action.config, payload);
      
      case ActionType.WAIT:
        return this.executeWait(action.config);
      
      case ActionType.RUN_AI_AGENT:
        return this.executeRunAIAgent(action.config, payload);
      
      case ActionType.WEBHOOK:
        return this.executeWebhook(action.config, payload);
      
      default:
        throw new Error(`Tipo de acción no soportado: ${action.type}`);
    }
  }

  /**
   * Evalúa las condiciones para ejecutar una acción
   */
  private evaluateActionConditions(
    conditions: Array<{field: string; operator: string; value: any}>,
    payload: Record<string, any>,
    previousResults: Record<string, any>
  ): boolean {
    // Todas las condiciones deben cumplirse (AND lógico)
    for (const condition of conditions) {
      let fieldValue;

      // Comprobar si el campo hace referencia a resultados previos
      if (condition.field.startsWith('results.')) {
        const resultPath = condition.field.substring(8);
        fieldValue = this.getValueFromPath(previousResults, resultPath);
      } else {
        fieldValue = this.getValueFromPath(payload, condition.field);
      }

      // Evaluar según el operador
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'notEquals':
          if (fieldValue === condition.value) return false;
          break;
        case 'contains':
          if (!String(fieldValue).includes(String(condition.value))) return false;
          break;
        case 'notContains':
          if (String(fieldValue).includes(String(condition.value))) return false;
          break;
        case 'greaterThan':
          if (Number(fieldValue) <= Number(condition.value)) return false;
          break;
        case 'lessThan':
          if (Number(fieldValue) >= Number(condition.value)) return false;
          break;
        case 'exists':
          if (fieldValue === undefined || fieldValue === null) return false;
          break;
        case 'notExists':
          if (fieldValue !== undefined && fieldValue !== null) return false;
          break;
        default:
          return false;
      }
    }

    // Si se llega aquí, se cumplen todas las condiciones
    return true;
  }

  /**
   * Ejecuta la acción de enviar un mensaje
   */
  private async executeSendMessage(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { channel, messageType, content, templateId, contactId } = config;
    
    // Obtener el ID del contacto del payload o de la configuración
    const targetContactId = payload.contactId || contactId;
    
    if (!targetContactId) {
      throw new Error('No se especificó un contacto para enviar el mensaje');
    }

    // Obtener el contacto
    const contact = await Contact.findById(targetContactId);
    if (!contact) {
      throw new Error(`Contacto no encontrado: ${targetContactId}`);
    }

    // Procesar el contenido del mensaje con variables
    const processedContent = this.processTemplate(content, { payload, contact });

    // Enviar mensaje según el canal
    switch (channel) {
      case 'whatsapp':
        if (!contact.phone) {
          throw new Error('El contacto no tiene número de teléfono para WhatsApp');
        }

        if (messageType === 'template' && templateId) {
          // Enviar mensaje de plantilla
          return await whatsAppService.sendTemplateMessage(
            contact.phone,
            templateId,
            config.language || 'es',
            config.components || []
          );
        } else {
          // Enviar mensaje de texto
          return await whatsAppService.sendTextMessage(
            contact.phone,
            processedContent
          );
        }
      
      case 'email':
        if (!contact.email) {
          throw new Error('El contacto no tiene email');
        }
        
        // Aquí iría la lógica para enviar email (no implementada)
        return { status: 'not_implemented', message: 'Envío de email no implementado' };
      
      case 'sms':
        if (!contact.phone) {
          throw new Error('El contacto no tiene número de teléfono para SMS');
        }
        
        // Aquí iría la lógica para enviar SMS (no implementada)
        return { status: 'not_implemented', message: 'Envío de SMS no implementado' };
      
      default:
        throw new Error(`Canal de mensaje no soportado: ${channel}`);
    }
  }

  /**
   * Ejecuta la acción de asignar un agente a un contacto o conversación
   */
  private async executeAssignAgent(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { agentId, contactId, conversationId } = config;
    
    // Obtener IDs del payload o de la configuración
    const targetAgentId = payload.agentId || agentId;
    const targetContactId = payload.contactId || contactId;
    const targetConversationId = payload.conversationId || conversationId;
    
    if (!targetAgentId) {
      throw new Error('No se especificó un agente para asignar');
    }

    // Verificar que el agente existe
    const agent = await User.findById(targetAgentId);
    if (!agent) {
      throw new Error(`Agente no encontrado: ${targetAgentId}`);
    }

    const updates: any = {
      assignedTo: new mongoose.Types.ObjectId(targetAgentId)
    };

    // Actualizar conversación si se especifica
    if (targetConversationId) {
      const conversation = await Conversation.findByIdAndUpdate(
        targetConversationId,
        { $set: updates },
        { new: true }
      );
      
      if (!conversation) {
        throw new Error(`Conversación no encontrada: ${targetConversationId}`);
      }
      
      return { updated: 'conversation', id: conversation._id };
    }
    
    // Actualizar contacto si se especifica
    if (targetContactId) {
      const contact = await Contact.findByIdAndUpdate(
        targetContactId,
        { $set: updates },
        { new: true }
      );
      
      if (!contact) {
        throw new Error(`Contacto no encontrado: ${targetContactId}`);
      }
      
      return { updated: 'contact', id: contact._id };
    }
    
    throw new Error('No se especificó un contacto o conversación para asignar');
  }

  /**
   * Ejecuta la acción de actualizar un contacto
   */
  private async executeUpdateContact(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { contactId, fields } = config;
    
    // Obtener el ID del contacto del payload o de la configuración
    const targetContactId = payload.contactId || contactId;
    
    if (!targetContactId) {
      throw new Error('No se especificó un contacto para actualizar');
    }
    
    if (!fields || Object.keys(fields).length === 0) {
      throw new Error('No se especificaron campos para actualizar');
    }

    // Procesar los valores de los campos con variables
    const processedFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'string') {
        processedFields[key] = this.processTemplate(value, { payload });
      } else {
        processedFields[key] = value;
      }
    }

    // Actualizar el contacto
    const contact = await Contact.findByIdAndUpdate(
      targetContactId,
      { $set: processedFields },
      { new: true }
    );
    
    if (!contact) {
      throw new Error(`Contacto no encontrado: ${targetContactId}`);
    }
    
    return { updated: contact._id, fields: Object.keys(processedFields) };
  }

  /**
   * Ejecuta la acción de añadir etiquetas a un contacto
   */
  private async executeAddTag(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { contactId, tags } = config;
    
    // Obtener el ID del contacto del payload o de la configuración
    const targetContactId = payload.contactId || contactId;
    
    if (!targetContactId) {
      throw new Error('No se especificó un contacto para añadir etiquetas');
    }
    
    if (!tags || tags.length === 0) {
      throw new Error('No se especificaron etiquetas para añadir');
    }

    // Añadir las etiquetas al contacto
    const contact = await Contact.findByIdAndUpdate(
      targetContactId,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );
    
    if (!contact) {
      throw new Error(`Contacto no encontrado: ${targetContactId}`);
    }
    
    return { updated: contact._id, addedTags: tags };
  }

  /**
   * Ejecuta la acción de eliminar etiquetas de un contacto
   */
  private async executeRemoveTag(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { contactId, tags } = config;
    
    // Obtener el ID del contacto del payload o de la configuración
    const targetContactId = payload.contactId || contactId;
    
    if (!targetContactId) {
      throw new Error('No se especificó un contacto para eliminar etiquetas');
    }
    
    if (!tags || tags.length === 0) {
      throw new Error('No se especificaron etiquetas para eliminar');
    }

    // Eliminar las etiquetas del contacto
    const contact = await Contact.findByIdAndUpdate(
      targetContactId,
      { $pullAll: { tags } },
      { new: true }
    );
    
    if (!contact) {
      throw new Error(`Contacto no encontrado: ${targetContactId}`);
    }
    
    return { updated: contact._id, removedTags: tags };
  }

  /**
   * Ejecuta la acción de mover a una etapa del pipeline
   */
  private async executeMovePipeline(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { contactId, pipelineId, stageId } = config;
    
    // Obtener el ID del contacto del payload o de la configuración
    const targetContactId = payload.contactId || contactId;
    
    if (!targetContactId) {
      throw new Error('No se especificó un contacto para mover en el pipeline');
    }
    
    if (!pipelineId || !stageId) {
      throw new Error('Se requiere el ID del pipeline y de la etapa');
    }

    // Actualizar la etapa del pipeline del contacto
    const contact = await Contact.findByIdAndUpdate(
      targetContactId,
      { 
        $set: { 
          pipelineId: pipelineId,
          pipelineStageId: stageId,
          pipelineUpdatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!contact) {
      throw new Error(`Contacto no encontrado: ${targetContactId}`);
    }
    
    return { 
      updated: contact._id, 
      pipelineId, 
      stageId 
    };
  }

  /**
   * Ejecuta la acción de esperar
   */
  private async executeWait(config: any): Promise<any> {
    const { duration, unit } = config;
    
    if (!duration || !unit) {
      throw new Error('Se requiere duración y unidad para la espera');
    }

    let milliseconds = 0;
    
    switch (unit) {
      case 'seconds':
        milliseconds = duration * 1000;
        break;
      case 'minutes':
        milliseconds = duration * 60 * 1000;
        break;
      case 'hours':
        milliseconds = duration * 60 * 60 * 1000;
        break;
      case 'days':
        milliseconds = duration * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error(`Unidad de tiempo no válida: ${unit}`);
    }

    // Limitar el tiempo de espera a 30 segundos para evitar bloqueos
    const maxWait = 30 * 1000;
    const actualWait = Math.min(milliseconds, maxWait);
    
    // Esperar
    await new Promise(resolve => setTimeout(resolve, actualWait));
    
    return { 
      waited: actualWait,
      unit: 'milliseconds',
      wasLimited: actualWait < milliseconds
    };
  }

  /**
   * Ejecuta la acción de ejecutar un agente de IA
   */
  private async executeRunAIAgent(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { agentId, input, conversationId } = config;
    
    // Obtener IDs del payload o de la configuración
    const targetAgentId = payload.agentId || agentId;
    const targetInput = payload.message || input;
    const targetConversationId = payload.conversationId || conversationId;
    
    if (!targetAgentId) {
      throw new Error('No se especificó un agente de IA para ejecutar');
    }
    
    if (!targetInput) {
      throw new Error('No se especificó un texto de entrada para el agente de IA');
    }

    // Verificar que el agente existe
    const agent = await AIAgent.findById(targetAgentId);
    if (!agent) {
      throw new Error(`Agente de IA no encontrado: ${targetAgentId}`);
    }

    // Si hay una conversación, obtener sus mensajes
    let conversationHistory: any[] = [];
    if (targetConversationId) {
      const conversation = await Conversation.findById(targetConversationId);
      if (!conversation) {
        throw new Error(`Conversación no encontrada: ${targetConversationId}`);
      }
      
      // Obtener los últimos 10 mensajes
      conversationHistory = conversation.messages.slice(-10);
    }

    // Procesar el mensaje con el agente de IA
    const response = await openAIService.processMessage(
      conversationHistory,
      targetInput,
      {
        systemPrompt: agent.systemPrompt,
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens
      }
    );

    return {
      agentId: targetAgentId,
      response: response.content,
      type: response.type
    };
  }

  /**
   * Ejecuta la acción de llamar a un webhook
   */
  private async executeWebhook(
    config: any,
    payload: Record<string, any>
  ): Promise<any> {
    const { url, method, headers, body } = config;
    
    if (!url) {
      throw new Error('No se especificó una URL para el webhook');
    }

    // Método por defecto
    const httpMethod = method || 'POST';
    
    // Procesar el cuerpo con variables
    let processedBody: any = body;
    if (typeof body === 'string') {
      processedBody = this.processTemplate(body, { payload });
    } else if (body && typeof body === 'object') {
      processedBody = JSON.parse(
        this.processTemplate(JSON.stringify(body), { payload })
      );
    }

    try {
      // Llamar al webhook
      const response = await fetch(url, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: processedBody ? JSON.stringify(processedBody) : undefined
      });

      // Comprobar si la respuesta es correcta
      if (!response.ok) {
        throw new Error(`Error en la llamada al webhook: ${response.status} ${response.statusText}`);
      }

      // Intentar parsear la respuesta como JSON
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }

      return {
        status: response.status,
        data: responseData
      };
    } catch (error) {
      throw new Error(`Error al llamar al webhook: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene un valor de un objeto usando un path (ej. "contact.name")
   */
  private getValueFromPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }

  /**
   * Procesa una plantilla reemplazando variables
   */
  private processTemplate(template: string, context: Record<string, any>): string {
    if (!template) return '';
    
    // Patrón para buscar variables {{ nombreVariable }}
    return template.replace(/\{\{\s*(.+?)\s*\}\}/g, (match, path) => {
      // Buscar si la variable empieza con un contexto específico
      const [context, ...parts] = path.split('.');
      
      if (context && parts.length > 0) {
        const contextObj = context.toLowerCase();
        if (contextObj in this) {
          return this.getValueFromPath(this[contextObj], parts.join('.')) || match;
        }
      }
      
      // Intentar buscar en todos los contextos
      for (const [key, value] of Object.entries(context)) {
        const found = this.getValueFromPath(value, path);
        if (found !== undefined) {
          return String(found);
        }
      }
      
      // Si no se encuentra, devolver la variable original
      return match;
    });
  }

  /**
   * Programa automatizaciones para ejecutarse en el futuro
   */
  public async scheduleAutomations(): Promise<{
    scheduled: number;
    errors: string[];
  }> {
    try {
      // Buscar automatizaciones programadas activas
      const automations = await Automation.find({
        isActive: true,
        'trigger.type': TriggerEventType.SCHEDULED
      });

      const results = {
        scheduled: 0,
        errors: [] as string[]
      };

      // Verificar cada automatización
      for (const automation of automations) {
        try {
          if (automation.trigger.schedule) {
            const shouldExecute = this.shouldExecuteSchedule(
              automation.trigger.schedule,
              automation.lastExecutedAt
            );

            if (shouldExecute) {
              // Ejecutar la automatización
              await this.executeAutomation(automation, {});
              results.scheduled++;
            }
          }
        } catch (error) {
          console.error(`Error scheduling automation ${automation._id}:`, error);
          results.errors.push(
            `Error en automatización "${automation.name}": ${(error as Error).message}`
          );
        }
      }

      return results;
    } catch (error) {
      console.error('Error in scheduleAutomations:', error);
      throw error;
    }
  }

  /**
   * Determina si una automatización programada debe ejecutarse
   */
  private shouldExecuteSchedule(
    schedule: any,
    lastExecutedAt?: Date
  ): boolean {
    const now = new Date();
    
    // Verificar fechas de inicio y fin
    if (schedule.startDate && new Date(schedule.startDate) > now) {
      return false;
    }
    
    if (schedule.endDate && new Date(schedule.endDate) < now) {
      return false;
    }
    
    // Verificar última ejecución
    if (lastExecutedAt) {
      const lastExecution = new Date(lastExecutedAt);
      
      switch (schedule.frequency) {
        case 'once':
          // Si es una sola vez y ya se ejecutó, no volver a ejecutar
          return false;
        
        case 'daily':
          // Si es diario, verificar si ya se ejecutó hoy
          if (
            lastExecution.getDate() === now.getDate() &&
            lastExecution.getMonth() === now.getMonth() &&
            lastExecution.getFullYear() === now.getFullYear()
          ) {
            return false;
          }
          break;
        
        case 'weekly':
          // Si es semanal, verificar si ya se ejecutó esta semana
          if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
            if (!schedule.daysOfWeek.includes(now.getDay())) {
              return false;
            }
          }
          
          // Verificar si ya se ejecutó hoy
          if (
            lastExecution.getDate() === now.getDate() &&
            lastExecution.getMonth() === now.getMonth() &&
            lastExecution.getFullYear() === now.getFullYear()
          ) {
            return false;
          }
          break;
        
        case 'monthly':
          // Si es mensual, verificar si ya se ejecutó este mes en el día especificado
          if (schedule.dayOfMonth) {
            if (now.getDate() !== schedule.dayOfMonth) {
              return false;
            }
          }
          
          // Verificar si ya se ejecutó hoy
          if (
            lastExecution.getDate() === now.getDate() &&
            lastExecution.getMonth() === now.getMonth() &&
            lastExecution.getFullYear() === now.getFullYear()
          ) {
            return false;
          }
          break;
      }
    }
    
    // Verificar la hora si está especificada
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      
      // Comprobar si estamos en la hora indicada (con margen de 5 minutos)
      const nowHours = now.getHours();
      const nowMinutes = now.getMinutes();
      
      if (
        nowHours !== hours || 
        Math.abs(nowMinutes - minutes) > 5
      ) {
        return false;
      }
    }
    
    // Si llega hasta aquí, debe ejecutarse
    return true;
  }
}

export default new AutomationService();