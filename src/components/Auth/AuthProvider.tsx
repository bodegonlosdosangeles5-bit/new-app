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
    // Verificar sesión de Supabase al cargar la aplicación
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Obtener información del usuario desde la base de datos
          const { data: userData, error: userError } = await supabase
            .rpc('get_current_user');

          if (userError || !(userData as any).success) {
            console.error('Error obteniendo información del usuario:', userError);
            // Limpiar sesión inválida
            await supabase.auth.signOut();
            localStorage.removeItem('user');
          } else {
            const userInfo = (userData as any);
            const userDataComplete = {
              id: userInfo.id,
              user_name: userInfo.user_name,
              role: userInfo.role,
              created_at: userInfo.created_at
            };
            setUser(userDataComplete);
            localStorage.setItem('user', JSON.stringify(userDataComplete));
          }
        } else {
          // No hay sesión activa, verificar localStorage como fallback
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (error) {
              console.error('Error parsing saved user:', error);
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // Usar la nueva función que establece la sesión de Supabase
      const { data, error } = await supabase
        .rpc('authenticate_user_with_supabase', { 
          username_param: username, 
          password_param: password 
        });

      if (error) {
        console.error('Error en authenticate_user_with_supabase:', error);
        return { error: error.message };
      }

      const result = data as any;
      if (!result.success) {
        return { error: result.error };
      }

      // Ahora establecer la sesión de Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: result.user_name + '@planta.com',
        password: password
      });

      if (authError) {
        console.error('Error estableciendo sesión de Supabase:', authError);
        return { error: 'Error estableciendo sesión de autenticación' };
      }

      const userDataComplete = {
        id: result.user_id,
        user_name: result.user_name,
        role: result.role,
        created_at: result.created_at
      };
      
      setUser(userDataComplete);
      localStorage.setItem('user', JSON.stringify(userDataComplete));
      
      return { error: null };
    } catch (error) {
      console.error('Error inesperado en signIn:', error);
      return { error: 'Error inesperado. Por favor intenta de nuevo.' };
    }
  };


  const signOut = async () => {
    try {
      // Cerrar sesión de Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error cerrando sesión de Supabase:', error);
      }
      
      setUser(null);
      localStorage.removeItem('user');
      return { error: null };
    } catch (error) {
      console.error('Error inesperado en signOut:', error);
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
