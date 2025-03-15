# CRM Minimalista

Un CRM minimalista con enfoque en automatizaciones, campañas de correo e integración de WhatsApp. Diseñado para ser versátil y adaptable a múltiples industrias, con configuraciones específicas para el sector educativo e inmobiliario.

## Características Principales

- 📊 **Sistema multi-tenant** con gestión de organizaciones y roles de usuarios
- 👥 **Gestión de contactos** con campos personalizables según industria
- 🔄 **Pipeline de ventas** visual con etapas personalizables
- 💬 **Integración con WhatsApp** para comunicación bidireccional
- 🤖 **Chatbots con IA** usando OpenAI API para automatización de conversaciones
- ⚡ **Automatizaciones** basadas en eventos y flujos de trabajo personalizables
- 📧 **Campañas de Email** con seguimiento de métricas

## Tecnologías Utilizadas

- **Frontend**: React.js con TypeScript
- **Backend**: Node.js con Express
- **Base de datos**: MongoDB
- **Autenticación**: Firebase Auth
- **API de WhatsApp**: WhatsApp Business API
- **IA**: OpenAI API
- **Estilizado**: Tailwind CSS

## Estructura del Proyecto

```
CRM-Minimalista/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── assets/       # Recursos estáticos
│   │   └── styles/       # Estilos y configuración Tailwind
│
├── server/               # Backend Node.js
│   ├── src/
│   │   ├── config/       # Configuración
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── middlewares/  # Middlewares
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Servicios
│   │   └── utils/        # Utilidades
│
├── common/               # Código compartido
│   ├── src/
│   │   ├── types/        # Definición de tipos
│   │   └── utils/        # Utilidades compartidas
│
└── docs/                 # Documentación
```

## Requisitos

- Node.js 18+
- MongoDB 6+
- Cuenta en Firebase
- Cuenta en WhatsApp Business API
- Cuenta en OpenAI

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/CRM-Minimalista.git
   cd CRM-Minimalista
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en la carpeta `/server`
   - Completar con tus credenciales

4. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Contribuir

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.