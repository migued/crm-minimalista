import { CustomField } from '../types';

/**
 * Formatea un número de teléfono para asegurar que incluya el código de país
 * @param phone El número de teléfono a formatear
 * @param defaultCountryCode Código de país por defecto si no está incluido (Por defecto: +52 para México)
 * @returns Número de teléfono formateado
 */
export const formatPhoneNumber = (phone: string, defaultCountryCode = '+52'): string => {
  if (!phone) return '';
  
  // Eliminar espacios, guiones y paréntesis
  let formatted = phone.replace(/[\s\-()]/g, '');
  
  // Si no comienza con +, agregar el código de país por defecto
  if (!formatted.startsWith('+')) {
    // Si comienza con 0, eliminar el 0 inicial
    if (formatted.startsWith('0')) {
      formatted = formatted.substring(1);
    }
    
    // Agregar el código de país
    formatted = `${defaultCountryCode}${formatted}`;
  }
  
  return formatted;
};

/**
 * Obtiene el valor de un campo personalizado por su clave
 * @param customFields Lista de campos personalizados
 * @param key Clave del campo personalizado a buscar
 * @returns Valor del campo personalizado o undefined si no existe
 */
export const getCustomFieldValue = (customFields: CustomField[], key: string): string | undefined => {
  const field = customFields.find(field => field.key === key);
  return field?.value;
};

/**
 * Obtiene el nombre completo formateado de una persona
 * @param firstName Nombre
 * @param lastName Apellido(s)
 * @returns Nombre completo formateado
 */
export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Trunca un texto a una longitud máxima y agrega puntos suspensivos
 * @param text Texto a truncar
 * @param maxLength Longitud máxima permitida
 * @returns Texto truncado
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Calcula la diferencia de tiempo en formato legible
 * @param date Fecha para calcular la diferencia
 * @returns Texto con el tiempo transcurrido (ej. "hace 2 horas")
 */
export const timeAgo = (date: Date | string): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'hace unos segundos';
  } else if (diffMinutes < 60) {
    return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 30) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else {
    // Para fechas más antiguas, mostrar la fecha formateada
    return new Date(date).toLocaleDateString();
  }
};