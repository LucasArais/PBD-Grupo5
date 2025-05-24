import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  const login = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const isAuthenticated = () => {
    return !!usuario;
  };

  const getUserType = () => {
    return usuario?.tipo || null;
  };

  const getUserId = () => {
    return usuario?.id || null;
  };

  const getAlunoId = () => {
    return usuario?.aluno?.id || null;
  };

  const getProfessorId = () => {
    return usuario?.professor?.id || null;
  };

  const value = {
    usuario,
    login,
    logout,
    isAuthenticated,
    getUserType,
    getUserId,
    getAlunoId,
    getProfessorId,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
