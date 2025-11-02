import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeUpdate {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
}

export const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);

  useEffect(() => {
    console.log('🔌 Configurando actualizaciones en tiempo real...');
    
    // Configurar canales para todas las tablas principales
    const channels = [
      'inventory_items',
      'productos', 
      'missing_ingredients',
      'available_ingredients',
      'users',
      'remitos',
      'remito_items',
      'envios',
      'envios_remitos'
      // Nota: 'materias_primas' removida porque no está en uso y causaba errores de suscripción
      // La aplicación usa 'inventory_items' para las materias primas
    ];

    const subscriptions = channels.map(tableName => {
      try {
        const channel = supabase
          .channel(`${tableName}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: tableName
            },
            (payload) => {
              console.log(`📡 Actualización en tiempo real - ${tableName}:`, payload);
              
              const update: RealtimeUpdate = {
                table: tableName,
                event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                data: payload.new || payload.old
              };
              
              setLastUpdate(update);
              
              // Emitir evento personalizado para que otros componentes puedan escucharlo
              window.dispatchEvent(new CustomEvent('realtimeUpdate', { 
                detail: update 
              }));
            }
          )
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log(`✅ Suscrito exitosamente a ${tableName}`);
              setIsConnected(true);
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(`⚠️ Error en la suscripción a ${tableName}:`, err);
              // No lanzar error, solo registrar advertencia
              // Esto permite que otras suscripciones continúen funcionando
            } else if (status === 'TIMED_OUT') {
              console.warn(`⏱️ Timeout en la suscripción a ${tableName}`);
            } else if (status === 'CLOSED') {
              console.warn(`🔒 Canal cerrado para ${tableName}`);
            }
          });

        return channel;
      } catch (error) {
        console.warn(`⚠️ Error al configurar suscripción para ${tableName}:`, error);
        // Devolver null para que el cleanup lo maneje correctamente
        return null;
      }
    }).filter(channel => channel !== null);

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando actualizaciones en tiempo real...');
      subscriptions.forEach(channel => {
        try {
          if (channel) {
            supabase.removeChannel(channel);
          }
        } catch (error) {
          console.warn('⚠️ Error al remover canal:', error);
        }
      });
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    lastUpdate
  };
};
