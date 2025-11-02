import { useEffect, useRef } from 'react';
import { UserService } from '@/services/userService';

/**
 * Hook para actualizar periódicamente la actividad del usuario actual (heartbeat)
 * Esto permite rastrear qué usuarios están activos en la aplicación
 */
export const useUserActivity = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Obtener el usuario actual del localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      return;
    }

    try {
      const user = JSON.parse(userData);
      const userId = user.id;

      if (!userId) {
        return;
      }

      // Actualizar actividad inmediatamente
      UserService.updateUserActivity(userId).catch(err => {
        console.warn('Error actualizando actividad inicial:', err);
      });

      // Configurar intervalo para actualizar actividad cada 2 minutos
      intervalRef.current = setInterval(() => {
        UserService.updateUserActivity(userId).catch(err => {
          console.warn('Error actualizando actividad:', err);
        });
      }, 2 * 60 * 1000); // 2 minutos

      // Cleanup al desmontar
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } catch (error) {
      console.error('Error parseando usuario en useUserActivity:', error);
    }
  }, []);
};

