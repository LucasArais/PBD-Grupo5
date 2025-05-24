import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { usuario, logout, getUserType } = useAuth();

  const getTipoUsuarioLabel = () => {
    switch (getUserType()) {
      case 'diretor':
        return 'Diretor';
      case 'professor':
        return 'Professor';
      case 'aluno':
        return 'Aluno';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestão Escolar
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{usuario?.nome}</span>
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                  {getTipoUsuarioLabel()}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
