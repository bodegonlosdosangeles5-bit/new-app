import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  user_name: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  createUser: (username: string, password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .rpc('authenticate_user', { 
          username_param: username, 
          password_param: password 
        });

      if (error) {
        return { error: error.message };
      }

      const result = data as any;
      if (!result.success) {
        return { error: result.error };
      }

      // Obtener información completa del usuario incluyendo el rol
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_id', { user_id_param: result.user_id });

      if (userError || !(userData as any).success) {
        return { error: 'Error obteniendo información del usuario' };
      }

      const userInfo = (userData as any);
      const userDataComplete = {
        id: userInfo.id,
        user_name: userInfo.user_name,
        role: userInfo.role,
        created_at: userInfo.created_at
      };
      
      setUser(userDataComplete);
      localStorage.setItem('user', JSON.stringify(userDataComplete));
      
      return { error: null };
    } catch (error) {
      return { error: 'Error inesperado. Por favor intenta de nuevo.' };
    }
  };


  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      return { error: null };
    } catch (error) {
      return { error: 'Error al cerrar sesión' };
    }
  };

  const createUser = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .rpc('create_user', { 
          username_param: username, 
          password_param: password 
        });

      if (error) {
        return { error: error.message };
      }

      const result = data as any;
      if (!result.success) {
        return { error: result.error };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Error inesperado. Por favor intenta de nuevo.' };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    createUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
