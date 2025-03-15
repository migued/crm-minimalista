import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Páginas
import DashboardPage from './pages/dashboard/DashboardPage';
import ContactsPage from './pages/contacts/ContactsPage';
import PipelinePage from './pages/pipeline/PipelinePage';
import SettingsPage from './pages/settings/SettingsPage';
import ConversationsPage from './pages/conversations/ConversationsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirigir la ruta raíz al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rutas protegidas con layout principal */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/contacts" 
          element={
            <MainLayout>
              <ContactsPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/pipeline" 
          element={
            <MainLayout>
              <PipelinePage />
            </MainLayout>
          } 
        />
        <Route 
          path="/conversations" 
          element={
            <MainLayout>
              <ConversationsPage />
            </MainLayout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          } 
        />
        
        {/* Página no encontrada */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <div className="card max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Página no encontrada</h1>
                <p className="mb-4">La página que estás buscando no existe o ha sido movida.</p>
                <a href="/dashboard" className="btn btn-primary">Ir al Dashboard</a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;