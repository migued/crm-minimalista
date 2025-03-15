# Guía de Instalación del CRM Minimalista

Esta guía detalla el proceso para instalar y configurar correctamente el CRM Minimalista en un entorno de desarrollo local.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js (v18+)** - [Descargar e instalar Node.js](https://nodejs.org/)
2. **MongoDB (v6+)** - [Descargar e instalar MongoDB](https://www.mongodb.com/try/download/community)
3. **Git** - [Descargar e instalar Git](https://git-scm.com/downloads)

## Cuentas Necesarias

Para utilizar todas las funcionalidades del CRM, necesitarás cuentas en:

1. **Firebase** - Para autenticación de usuarios
2. **WhatsApp Business API** - Para integración con WhatsApp
3. **OpenAI** - Para funcionalidades de IA y chatbots

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/CRM-Minimalista.git
cd CRM-Minimalista
```

## Paso 2: Instalar Dependencias

Instala todas las dependencias del proyecto usando npm:

```bash
npm install
```

Este comando instalará las dependencias para todos los paquetes del monorepo (client, server y common).

## Paso 3: Configurar Variables de Entorno

1. En la carpeta `/server`, crea un archivo `.env` copiando el contenido de `.env.example`:

```bash
cd server
cp .env.example .env
```

2. Edita el archivo `.env` con tus propias variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-minimalista
JWT_SECRET=tu_clave_secreta_para_jwt
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=tu_clave_de_api_de_openai
WHATSAPP_API_KEY=tu_clave_de_api_de_whatsapp
```

## Paso 4: Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita la autenticación por email/password
3. Obtén las credenciales de la aplicación web
4. Crea un archivo de configuración en `/client/src/config/firebase.ts`:

```typescript
// client/src/config/firebase.ts
export const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket.appspot.com",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};
```

## Paso 5: Iniciar MongoDB

Asegúrate de que MongoDB esté ejecutándose en tu sistema:

```bash
# En Linux/Mac
sudo service mongod start
# o
mongod --dbpath /ruta/a/tu/data/db

# En Windows (desde PowerShell como administrador)
Start-Service MongoDB
```

## Paso 6: Iniciar la Aplicación en Modo Desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Este comando iniciará tanto el cliente (en el puerto 3000) como el servidor (en el puerto 5000) en modo desarrollo.

Para iniciar solo el cliente o el servidor:

```bash
# Solo cliente
npm run dev:client

# Solo servidor
npm run dev:server
```

## Paso 7: Inicializar la Base de Datos (Opcional)

Si deseas cargar datos de ejemplo para pruebas:

```bash
cd server
npm run seed
```

## Acceder a la Aplicación

Una vez que la aplicación esté en funcionamiento:

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000
- **Documentación API**: http://localhost:5000/api-docs

## Solución de Problemas Comunes

### Error de Conexión a MongoDB

Si ves un error como `MongoNetworkError: failed to connect to server`:

1. Verifica que MongoDB esté en ejecución
2. Confirma que la URL de conexión en el archivo `.env` sea correcta
3. Asegúrate de que no haya un firewall bloqueando la conexión

### Errores de Dependencias

Si encuentras errores relacionados con dependencias:

```bash
npm clean-install
```

### Puertos en Uso

Si los puertos 3000 o 5000 ya están en uso, puedes cambiarlos:

- Para el cliente: Modifica `PORT` en el archivo `/client/vite.config.ts`
- Para el servidor: Modifica `PORT` en el archivo `.env` del servidor

## Siguiente Paso

Una vez que tengas el entorno funcionando, consulta la [Guía de Desarrollo](./desarrollo.md) para comenzar a trabajar en el proyecto.