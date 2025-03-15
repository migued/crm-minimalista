import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AISettingsPage from './AISettingsPage';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  TagIcon, 
  SwatchIcon,
  Cog6ToothIcon,
  BellIcon,
  UsersIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ElementType;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'profile', name: 'Perfil', icon: UserIcon },
  { id: 'organization', name: 'Organización', icon: BuildingOfficeIcon },
  { id: 'team', name: 'Equipo', icon: UsersIcon },
  { id: 'pipeline', name: 'Pipeline', icon: UserGroupIcon },
  { id: 'tags', name: 'Etiquetas', icon: TagIcon },
  { id: 'ai', name: 'IA y Automatización', icon: SparklesIcon },
  { id: 'integrations', name: 'Integraciones', icon: Cog6ToothIcon },
  { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
  { id: 'branding', name: 'Personalización', icon: SwatchIcon },
];

interface OrganizationSettings {
  name: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  languagePreference: string;
  timezone: string;
}

// Datos de ejemplo
const MOCK_ORGANIZATION: OrganizationSettings = {
  name: 'Mi Organización',
  industry: 'general',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  logoUrl: ''
};

const MOCK_PROFILE: UserProfile = {
  firstName: 'Usuario',
  lastName: 'Demo',
  email: 'usuario@demo.com',
  role: 'admin',
  languagePreference: 'es',
  timezone: 'America/Mexico_City'
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('organization');
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings>(MOCK_ORGANIZATION);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_PROFILE);

  const handleOrganizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los cambios
    console.log('Guardar organización:', organizationSettings);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los cambios
    console.log('Guardar perfil:', userProfile);
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrganizationSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <Card title="Configuración de la Organización">
            <form onSubmit={handleOrganizationSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre de la Organización
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={organizationSettings.name}
                  onChange={handleOrganizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industria
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={organizationSettings.industry}
                  onChange={handleOrganizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="general">General</option>
                  <option value="education">Educación</option>
                  <option value="real_estate">Bienes Raíces</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Color Primario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="primaryColor"
                      id="primaryColor"
                      value={organizationSettings.primaryColor}
                      onChange={handleOrganizationChange}
                      className="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={organizationSettings.primaryColor}
                      onChange={handleOrganizationChange}
                      className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                    Color Secundario
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="secondaryColor"
                      id="secondaryColor"
                      value={organizationSettings.secondaryColor}
                      onChange={handleOrganizationChange}
                      className="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="secondaryColor"
                      value={organizationSettings.secondaryColor}
                      onChange={handleOrganizationChange}
                      className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  id="logoUrl"
                  value={organizationSettings.logoUrl}
                  onChange={handleOrganizationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="outline" className="mr-3">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        );
      
      case 'profile':
        return (
          <Card title="Configuración de Perfil">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={userProfile.firstName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={userProfile.lastName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={userProfile.email}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={userProfile.role}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled
                >
                  <option value="admin">Administrador</option>
                  <option value="agent">Agente</option>
                  <option value="supervisor">Supervisor</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">El rol solo puede ser cambiado por un administrador</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700">
                    Idioma
                  </label>
                  <select
                    id="languagePreference"
                    name="languagePreference"
                    value={userProfile.languagePreference}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Zona Horaria
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={userProfile.timezone}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                    <option value="America/New_York">Nueva York (UTC-5)</option>
                    <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="outline" className="mr-3">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        );
      
      case 'ai':
        return <AISettingsPage />;
      
      default:
        return (
          <Card>
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <p>Funcionalidad en construcción</p>
              <p className="text-sm mt-2">Esta sección estará disponible próximamente</p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configuración" 
        subtitle="Personaliza tu CRM según tus necesidades"
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Barra lateral de navegación */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white rounded-lg shadow-sm p-3">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;