import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_active: boolean;
  role?: string;
  full_name?: string;
}

export interface CreateUserData {
  password: string;
  full_name?: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export class UserService {
  /**
   * Obtener todos los usuarios del sistema usando la función de base de datos
   */
  static async getUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_details');
      
      if (error) {
        console.error('Error obteniendo usuarios:', error);
        throw new Error('Error al obtener usuarios');
      }

      return data.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        is_active: user.is_active,
        role: user.role || 'user',
        full_name: user.full_name || ''
      }));
    } catch (error) {
      console.error('Error en getUsers:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario usando la función de base de datos
   */
  static async createUser(userData: CreateUserData): Promise<UserProfile> {
    try {
      // Generar email automáticamente basado en el nombre de usuario
      const username = userData.full_name || 'usuario';
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const generatedEmail = `${cleanUsername}@planta.local`;
      
      // Crear usuario usando la función de base de datos
      const { data, error } = await supabase.rpc('create_complete_user', {
        p_email: generatedEmail,
        p_password: userData.password,
        p_full_name: userData.full_name || '',
        p_role: userData.role || 'user'
      });

      if (error) {
        console.error('Error creando usuario:', error);
        throw new Error(`Error al crear usuario: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo crear el usuario');
      }

      return {
        id: data.id,
        email: data.email || '',
        created_at: data.created_at,
        last_sign_in_at: null,
        email_confirmed_at: data.created_at,
        is_active: data.is_active,
        role: data.role || 'user',
        full_name: data.full_name || ''
      };
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario existente usando función de base de datos
   */
  static async updateUser(userId: string, updates: UpdateUserData): Promise<UserProfile> {
    try {
      // Usar la función de base de datos para actualizar usuario
      const { data, error } = await supabase.rpc('update_complete_user', {
        p_user_id: userId,
        p_email: updates.email || null,
        p_full_name: updates.full_name || null,
        p_role: updates.role || null,
        p_is_active: updates.is_active !== undefined ? updates.is_active : null
      });

      if (error) {
        console.error('Error actualizando usuario:', error);
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo actualizar el usuario');
      }

      return {
        id: data.id,
        email: data.email || '',
        created_at: data.created_at,
        last_sign_in_at: data.last_sign_in_at,
        email_confirmed_at: data.email_confirmed_at,
        is_active: data.is_active,
        role: data.role || 'user',
        full_name: data.full_name || ''
      };
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario usando función de base de datos
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      // Usar la función de base de datos para eliminar usuario completo
      const { data, error } = await supabase.rpc('delete_complete_user', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error eliminando usuario:', error);
        throw new Error(`Error al eliminar usuario: ${error.message}`);
      }

      return data === true;
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de un usuario usando función de base de datos
   */
  static async resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('change_user_password', {
        p_user_id: userId,
        p_new_password: newPassword
      });

      if (error) {
        console.error('Error cambiando contraseña:', error);
        throw new Error(`Error al cambiar contraseña: ${error.message}`);
      }

      return data === true;
    } catch (error) {
      console.error('Error en resetUserPassword:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios usando la función de base de datos
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    confirmed: number;
    unconfirmed: number;
    admins: number;
    users: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_user_stats');
      
      if (error) {
        console.error('Error obteniendo estadísticas:', error);
        throw new Error('Error al obtener estadísticas');
      }

      return {
        total: data.total || 0,
        active: data.active || 0,
        inactive: data.inactive || 0,
        confirmed: data.confirmed || 0,
        unconfirmed: data.unconfirmed || 0,
        admins: data.admins || 0,
        users: data.users || 0
      };
    } catch (error) {
      console.error('Error en getUserStats:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario actual es administrador
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase.rpc('is_user_admin', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error verificando rol de administrador:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error en isCurrentUserAdmin:', error);
      return false;
    }
  }
}
