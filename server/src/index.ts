import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
// import authRoutes from '@/routes/authRoutes';
import whatsappRoutes from './routes/whatsappRoutes';

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-minimalista')
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida');
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas principales
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Registrar rutas
// app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
import aiRoutes from './routes/aiRoutes';
app.use('/api/ai', aiRoutes);
import emailRoutes from './routes/emailRoutes';
app.use('/api/email', emailRoutes);

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});