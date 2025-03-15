# Documentación del CRM Minimalista

Bienvenido a la documentación oficial del CRM Minimalista. Esta sección contiene información detallada sobre la arquitectura, configuración y uso del sistema.

## Contenido

1. [Arquitectura](#arquitectura)
2. [Modelos de datos](#modelos-de-datos)
3. [API RESTful](#api-restful)
4. [Autenticación](#autenticación)
5. [Integración con WhatsApp](#integración-con-whatsapp)
6. [Chatbots con IA](#chatbots-con-ia)
7. [Automatizaciones](#automatizaciones)
8. [Verticales específicas](#verticales-específicas)

## Arquitectura

El CRM Minimalista está construido siguiendo una arquitectura monorepo con separación clara entre cliente y servidor. La aplicación utiliza un enfoque RESTful para la comunicación entre el frontend y el backend.

### Tecnologías principales

- **Frontend**: React.js con TypeScript
- **Backend**: Node.js con Express
- **Base de datos**: MongoDB (NoSQL)
- **Autenticación**: Firebase Auth

## Modelos de datos

El sistema utiliza los siguientes modelos principales:

### Organizations

Modelo multi-tenant que representa una organización cliente del CRM.

```typescript
{
  name: string;                  // Nombre de la organización
  industry: 'education' | 'real_estate' | 'general';  // Vertical
  logoUrl?: string;              // URL del logo
  primaryColor?: string;         // Color principal para personalización
  secondaryColor?: string;       // Color secundario para personalización
  settings: {                    // Configuraciones
    whatsappIntegration: boolean;  // Integración con WhatsApp habilitada
    emailCampaigns: boolean;       // Campañas de email habilitadas
    aiChatbots: boolean;           // Chatbots de IA habilitados
  };
}
```

### Users

Usuarios del sistema con diferentes roles y permisos.

```typescript
{
  email: string;                 // Email del usuario
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  role: 'admin' | 'agent' | 'supervisor';  // Rol
  organizationId: ObjectId;      // Organización a la que pertenece
  firebaseUid: string;           // ID de Firebase Auth
  permissions: {                 // Permisos específicos
    canManageUsers: boolean;
    canManageSettings: boolean;
    canManagePipelines: boolean;
    canManageCampaigns: boolean;
    canManageWhatsApp: boolean;
    canManageContacts: boolean;
  };
}
```

### Contacts

Contactos o prospectos en el CRM.

```typescript
{
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  email?: string;                // Email
  phone?: string;                // Teléfono
  whatsappId?: string;           // ID de WhatsApp
  organizationId: ObjectId;      // Organización
  tags: string[];                // Etiquetas
  assignedTo?: ObjectId;         // Usuario asignado
  pipelineStage?: ObjectId;      // Etapa actual en el pipeline
  customFields: {                // Campos personalizados
    key: string;
    label: string;
    value: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  }[];
}
```

## Continúa en la documentación específica...

Para más detalles sobre cada componente del sistema, consulta los documentos específicos en las subcarpetas de documentación.