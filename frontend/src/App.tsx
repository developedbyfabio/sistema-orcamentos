import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orcamentos from './pages/Orcamentos';
import OrcamentoDetalhes from './pages/OrcamentoDetalhes';
import NovoOrcamento from './pages/NovoOrcamento';
import EditarOrcamento from './pages/EditarOrcamento';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import Pendentes from './pages/Pendentes';
import AguardandoCompra from './pages/AguardandoCompra';
import DarBaixa from './pages/DarBaixa';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para rotas de admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  zIndex: 9999,
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Rota pública */}
              <Route path="/login" element={<Login />} />
              
              {/* Rotas protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pendentes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Pendentes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/aguardando-compra"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AguardandoCompra />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dar-baixa"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DarBaixa />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orcamentos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Orcamentos />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orcamentos/novo"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NovoOrcamento />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orcamentos/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <OrcamentoDetalhes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orcamentos/:id/editar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditarOrcamento />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* Rotas de admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Layout>
                      <Admin />
                    </Layout>
                  </AdminRoute>
                }
              />
              
              {/* Rota padrão */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rota 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">Página não encontrada</p>
                      <button
                        onClick={() => window.history.back()}
                        className="btn btn-primary"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 