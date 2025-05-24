import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import DiretorDashboard from './components/DiretorDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import AlunoDashboard from './components/AlunoDashboard';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Componente para redirecionar usuários autenticados
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

// Componente para renderizar o dashboard baseado no tipo de usuário
const Dashboard = () => {
  const { getUserType } = useAuth();
  const userType = getUserType();
  
  switch (userType) {
    case 'diretor':
      return <DiretorDashboard />;
    case 'professor':
      return <ProfessorDashboard />;
    case 'aluno':
      return <AlunoDashboard />;
    default:
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tipo de usuário não reconhecido</h2>
          <p className="text-gray-600 mt-2">Entre em contato com o administrador do sistema.</p>
        </div>
      );
  }
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
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
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />
        
        {/* Rota para páginas não encontradas */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="text-gray-600 mt-2">Página não encontrada</p>
                <a 
                  href="/dashboard" 
                  className="mt-4 inline-block btn-primary"
                >
                  Voltar ao Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
