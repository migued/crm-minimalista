# Integración con WhatsApp Business API

Esta documentación explica cómo configurar y utilizar la integración con WhatsApp Business API en el CRM Minimalista.

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Configuración en Meta Business](#configuración-en-meta-business)
3. [Configuración en el CRM](#configuración-en-el-crm)
4. [Funcionamiento de la integración](#funcionamiento-de-la-integración)
5. [Plantillas de mensajes](#plantillas-de-mensajes)
6. [Solución de problemas](#solución-de-problemas)

## Requisitos previos

Para utilizar la integración con WhatsApp Business API, necesitarás:

- Una cuenta de negocio en Meta Business/Facebook Business Manager
- Un número de teléfono verificado para WhatsApp Business
- Acceso a la API de WhatsApp Business Cloud
- Un servidor web con HTTPS para recibir webhooks

## Configuración en Meta Business

### 1. Crear una cuenta en Meta Business Manager

Si aún no tienes una cuenta en Meta Business Manager, puedes crear una en [business.facebook.com](https://business.facebook.com).

### 2. Configurar WhatsApp Business

1. Ve a [business.facebook.com](https://business.facebook.com)
2. Navega a "Todos los recursos" > "WhatsApp Accounts"
3. Sigue los pasos para agregar un número de teléfono a tu cuenta de WhatsApp Business

### 3. Configurar una aplicación de desarrollador

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una nueva aplicación de tipo "Business"
3. Agrega el producto "WhatsApp" a tu aplicación
4. En la sección de "Getting Started" de WhatsApp, encontrarás:
   - Phone Number ID
   - WhatsApp Business Account ID
   - Temporary Access Token

### 4. Configurar Webhooks

1. En la sección de "Webhooks" de tu aplicación de desarrollador
2. Haz clic en "Configure Webhooks"
3. Ingresa la URL del webhook: `https://tu-dominio.com/api/whatsapp/webhook`
4. Ingresa el token de verificación que definiste en el CRM
5. Selecciona los siguientes campos para suscribirse:
   - `messages`
   - `message_status`

## Configuración en el CRM

### 1. Acceder a la configuración de WhatsApp

1. Inicia sesión en el CRM Minimalista
2. Ve a "Configuración" > "Integraciones" > "WhatsApp"

### 2. Ingresar credenciales

Completa los siguientes campos:

- **ID de Número de Teléfono**: El Phone Number ID obtenido de la aplicación de desarrollador de Meta
- **ID de Cuenta de Negocio**: El WhatsApp Business Account ID obtenido de la aplicación de desarrollador de Meta
- **Token de Acceso**: El Access Token obtenido de la aplicación de desarrollador de Meta
- **Token de Verificación de Webhook**: Crea un token personalizado. Debe ser el mismo que configuraste en los webhooks de Meta

### 3. Guardar y probar la conexión

1. Haz clic en "Guardar Configuración"
2. Una vez guardada, haz clic en "Probar Conexión" para verificar que todo funcione correctamente

## Funcionamiento de la integración

### Envío de mensajes

El CRM puede enviar mensajes a través de WhatsApp de dos formas:

1. **Mensajes dentro de la ventana de 24 horas**: Después de recibir un mensaje de un contacto, se abre una "ventana de servicio" de 24 horas durante la cual puedes enviar cualquier tipo de mensaje.

2. **Mensajes de plantilla**: Fuera de la ventana de 24 horas, solo puedes enviar mensajes utilizando plantillas aprobadas por WhatsApp.

### Recepción de mensajes

Los mensajes recibidos a través de WhatsApp se muestran en la sección de "Conversaciones" del CRM. Cuando un contacto envía un mensaje:

1. Se crea automáticamente un contacto en el CRM si no existe
2. Se crea una conversación o se actualiza la existente
3. El mensaje aparece en tiempo real (si el CRM está abierto)
4. Se incrementa el contador de mensajes no leídos

## Plantillas de mensajes

### Creación de plantillas

Las plantillas deben crearse en la consola de Meta Business:

1. Ve a [business.facebook.com](https://business.facebook.com)
2. Navega a "Todos los recursos" > "WhatsApp Accounts" > Tu cuenta
3. Haz clic en "Message Templates"
4. Haz clic en "Create Template"

### Tipos de plantillas

- **Bienvenida**: Para dar la bienvenida a nuevos contactos
- **Actualizaciones**: Para enviar actualizaciones sobre un servicio o producto
- **Alertas**: Para enviar alertas importantes
- **Confirmación**: Para confirmar una acción o cita

### Uso de plantillas en el CRM

1. En una conversación de WhatsApp, haz clic en el icono de documento
2. Selecciona una plantilla de la lista
3. Completa las variables según sea necesario
4. Envía la plantilla

## Solución de problemas

### Mensajes no enviados

- Verifica que el token de acceso sea válido y no haya expirado
- Asegúrate de que estás usando plantillas aprobadas fuera de la ventana de 24 horas
- Comprueba que el número de teléfono del contacto esté en formato internacional

### Webhooks no funcionan

- Asegúrate de que la URL del webhook sea accesible públicamente y use HTTPS
- Verifica que el token de verificación configurado en Meta coincida con el configurado en el CRM
- Comprueba los logs del servidor para ver posibles errores

### Plantillas rechazadas

- Asegúrate de seguir las políticas de WhatsApp para plantillas
- Evita lenguaje promocional excesivo
- No incluyas información engañosa o sensible
- Proporciona valores de ejemplo claros para las variables

## Recursos adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Políticas de WhatsApp Business](https://www.whatsapp.com/legal/business-policy/)
- [Guía de plantillas de WhatsApp](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/)