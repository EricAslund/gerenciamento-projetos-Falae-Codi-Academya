import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

interface AuthContextType {
  usuarioAutenticado: Usuario | null;
  setUsuarioAutenticado: (usuario: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<Usuario | null>(null);

  return (
    <AuthContext.Provider value={{ usuarioAutenticado, setUsuarioAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
