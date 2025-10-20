import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthErrorHandler = () => {
  useEffect(() => {
    // Escuchar errores de autenticación globalmente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Estado de autenticación cambiado:', event);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 Usuario deslogueado');
          // Limpiar datos locales si es necesario
          localStorage.removeItem('supabase.auth.token');
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refrescado exitosamente');
        }
        
        if (event === 'SIGNED_IN') {
          console.log('✅ Usuario autenticado');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthError = (error: any) => {
    console.error('🚨 Error de autenticación:', error);
    
    // Si es un error 403 o JWT, intentar refrescar la sesión
    if (error?.message?.includes('403') || 
        error?.message?.includes('JWT') || 
        error?.message?.includes('Invalid JWT')) {
      
      console.log('🔄 Intentando refrescar sesión...');
      
      supabase.auth.refreshSession()
        .then(({ data, error: refreshError }) => {
          if (refreshError) {
            console.error('❌ Error refrescando sesión:', refreshError);
            // Si no se puede refrescar, redirigir al login
            window.location.href = '/login';
          } else {
            console.log('✅ Sesión refrescada exitosamente');
          }
        })
        .catch((err) => {
          console.error('❌ Error en refresh:', err);
          window.location.href = '/login';
        });
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error verificando sesión:', error);
        handleAuthError(error);
        return false;
      }
      
      if (!session) {
        console.log('⚠️ No hay sesión activa');
        return false;
      }
      
      console.log('✅ Sesión activa encontrada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      handleAuthError(error);
      return false;
    }
  };

  return {
    handleAuthError,
    checkAuthStatus
  };
};
