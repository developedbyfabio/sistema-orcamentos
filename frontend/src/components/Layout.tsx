import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const podeCriarOrcamento = user?.usuarioNiveis?.some(
    (un) => un.nivel.podeCriarOrcamento && un.nivel.ativo
  );

  const usuarioTemNivelAcimaSolicitante = user?.usuarioNiveis?.some(un => un.nivel.prioridade > 1);
  const usuarioTemNivelCompras = user?.usuarioNiveis?.some(un => un.nivel.nivelFinal);
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ...(usuarioTemNivelAcimaSolicitante ? [{ name: 'Pendentes', href: '/pendentes', icon: ClockIcon }] : []),
    ...(usuarioTemNivelCompras ? [{ name: 'Aguardando Compra', href: '/aguardando-compra', icon: ShoppingCartIcon }] : []),
    ...(usuarioTemNivelCompras ? [{ name: 'Dar Baixa', href: '/dar-baixa', icon: CheckCircleIcon }] : []),
    ...(user?.admin ? [{ name: 'Orçamentos', href: '/orcamentos', icon: DocumentTextIcon }] : []),
    ...((!user?.admin && podeCriarOrcamento) ? [{ name: 'Novo Orçamento', href: '/orcamentos/novo', icon: PlusIcon }] : []),
    ...(user?.admin ? [{ name: 'Administração', href: '/admin', icon: Cog6ToothIcon }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar para desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col">
        <div className={`flex min-h-0 flex-1 flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sistema de Orçamentos</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? isDarkMode 
                          ? 'bg-blue-800 text-blue-100'
                          : 'bg-primary-100 text-primary-900'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.href) 
                          ? 'text-primary-500' 
                          : isDarkMode
                            ? 'text-gray-400 group-hover:text-gray-300'
                            : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className={`flex flex-shrink-0 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center">
              <div>
                <div className="flex items-center">
                  <UserIcon className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.nome}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.cargo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-full max-w-xs flex-1 flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sistema de Orçamentos</h1>
            </div>
            <nav className="mt-5 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? isDarkMode 
                          ? 'bg-blue-800 text-blue-100'
                          : 'bg-primary-100 text-primary-900'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-4 h-6 w-6 flex-shrink-0 ${
                        isActive(item.href) 
                          ? 'text-primary-500' 
                          : isDarkMode
                            ? 'text-gray-400 group-hover:text-gray-300'
                            : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className={`flex flex-shrink-0 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center">
              <UserIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <div className="ml-3">
                <p className={`text-base font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.nome}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.cargo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="md:pl-56">
        {/* Header */}
        <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden`}>
          <button
            type="button"
            className={`-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500`}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Header desktop */}
        <div className="hidden md:block">
          <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sistema de Orçamentos</h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-medium">{user?.nome}</span>
                      <span className="mx-2">•</span>
                      <span>{user?.cargo}</span>
                    </div>
                    
                    {/* Botão de tema */}
                    <button
                      onClick={toggleTheme}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                        isDarkMode 
                          ? 'text-gray-300 bg-gray-700 hover:text-white hover:bg-gray-600' 
                          : 'text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    >
                      {isDarkMode ? (
                        <SunIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <MoonIcon className="h-4 w-4 mr-2" />
                      )}
                      {isDarkMode ? 'Claro' : 'Escuro'}
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                        isDarkMode 
                          ? 'text-gray-300 bg-gray-700 hover:text-white hover:bg-gray-600' 
                          : 'text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 