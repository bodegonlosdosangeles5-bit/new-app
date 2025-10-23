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
      'envios_remitos',
      'materias_primas'
    ];

    const subscriptions = channels.map(tableName => {
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
        .subscribe((status) => {
          console.log(`🔌 Estado de suscripción ${tableName}:`, status);
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Suscrito exitosamente a ${tableName}`);
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Error en la suscripción a ${tableName}`);
          }
        });

      return channel;
    });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando actualizaciones en tiempo real...');
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    lastUpdate
  };
};
