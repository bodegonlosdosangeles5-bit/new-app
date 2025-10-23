import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserService, UserProfile } from '@/services/userService';

export const useRealtimeUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    users: 0,
    admins: 0,
    users_role: 0
  });

  // Cargar usuarios iniciales
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando usuarios desde Supabase...');
      const [usersData, statsData] = await Promise.all([
        UserService.getUsers(),
        UserService.getUserStats()
      ]);
      console.log('📊 Usuarios cargados:', usersData);
      console.log('📊 Estadísticas cargadas:', statsData);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('❌ Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Configurar Realtime para usuarios
  useEffect(() => {
    console.log('🔌 Configurando Realtime para usuarios...');
    
    const usersChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('📡 Cambio detectado en usuarios:', payload);
          // Recargar todos los usuarios cuando hay cambios
          loadUsers();
        }
      )
      .subscribe((status) => {
        console.log('🔌 Estado de suscripción Realtime usuarios:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito exitosamente a cambios de usuarios en tiempo real');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en la suscripción Realtime usuarios');
          setError('Error de conexión en tiempo real');
        }
      });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando Realtime usuarios...');
      supabase.removeChannel(usersChannel);
    };
  }, [loadUsers]);

  // Funciones CRUD que actualizan automáticamente via Realtime
  const createUser = async (userData: { user_name: string; password: string; role: string }) => {
    try {
      setError(null);
      console.log('🔄 Creando usuario...');
      const newUser = await UserService.createUser(userData);
      console.log('📊 Usuario creado:', newUser);
      // Los datos se actualizarán automáticamente via Realtime
      return newUser;
    } catch (err) {
      setError('Error al crear el usuario');
      console.error('❌ Error creando usuario:', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: { user_name?: string; role?: string; password?: string }) => {
    try {
      setError(null);
      console.log('🔄 Actualizando usuario...');
      const updatedUser = await UserService.updateUser(userId, updates);
      console.log('📊 Usuario actualizado:', updatedUser);
      // Los datos se actualizarán automáticamente via Realtime
      return updatedUser;
    } catch (err) {
      setError('Error al actualizar el usuario');
      console.error('❌ Error actualizando usuario:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setError(null);
      console.log('🔄 Eliminando usuario...');
      const success = await UserService.deleteUser(userId);
      console.log('📊 Usuario eliminado:', success);
      // Los datos se actualizarán automáticamente via Realtime
      return success;
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error('❌ Error eliminando usuario:', err);
      throw err;
    }
  };

  const resetUserPassword = async (userId: string, newPassword: string) => {
    try {
      setError(null);
      console.log('🔄 Reseteando contraseña de usuario...');
      const success = await UserService.resetUserPassword(userId, newPassword);
      console.log('📊 Contraseña reseteada:', success);
      // Los datos se actualizarán automáticamente via Realtime
      return success;
    } catch (err) {
      setError('Error al resetear la contraseña');
      console.error('❌ Error reseteando contraseña:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    stats,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword
  };
};
