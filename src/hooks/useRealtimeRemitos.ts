import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RemitoService, RemitoWithItems, ProductionItem } from '@/services/remitoService';

export const useRealtimeRemitos = () => {
  const [remitos, setRemitos] = useState<RemitoWithItems[]>([]);
  const [currentRemito, setCurrentRemito] = useState<RemitoWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Cargar remitos iniciales
  const loadRemitos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando remitos desde Supabase...');
      const data = await RemitoService.getAllRemitos();
      console.log('📊 Remitos cargados:', data);
      setRemitos(data);
    } catch (err) {
      setError('Error al cargar los remitos');
      console.error('❌ Error cargando remitos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar remito abierto del día
  const loadCurrentRemito = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Cargando remito abierto del día...');
      const data = await RemitoService.getOpenRemitoForToday();
      console.log('📊 Remito actual cargado:', data);
      setCurrentRemito(data);
    } catch (err) {
      setError('Error al cargar el remito actual');
      console.error('❌ Error cargando remito actual:', err);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRemitos();
    loadCurrentRemito();
  }, [loadRemitos, loadCurrentRemito]);

  // Configurar polling como fallback si Realtime falla
  const startPolling = useCallback(() => {
    console.log('🔄 Iniciando polling como fallback...');
    const interval = setInterval(() => {
      loadRemitos();
      loadCurrentRemito();
    }, 5000); // Polling cada 5 segundos
    setPollingInterval(interval);
  }, [loadRemitos, loadCurrentRemito]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      console.log('🛑 Deteniendo polling...');
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Configurar Realtime para remitos
  useEffect(() => {
    console.log('🔌 Configurando Realtime para remitos...');
    
    let remitosChannel: any = null;
    
    try {
      remitosChannel = supabase
        .channel('remitos_changes', {
          config: {
            broadcast: { self: false },
            presence: { key: 'remitos' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'remitos'
          },
          (payload) => {
            console.log('📡 Cambio detectado en remitos:', payload);
            // Recargar remitos cuando hay cambios
            loadRemitos();
            loadCurrentRemito();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'remito_items'
          },
          (payload) => {
            console.log('📡 Cambio detectado en remito_items:', payload);
            // Recargar remitos cuando hay cambios en items
            loadRemitos();
            loadCurrentRemito();
          }
        )
        .subscribe((status, err) => {
          console.log('🔌 Estado de suscripción Realtime:', status);
          if (err) {
            console.error('❌ Error en la suscripción Realtime:', err);
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Suscrito exitosamente a cambios en tiempo real');
            setError(null); // Limpiar errores previos
            setRealtimeError(false);
            stopPolling(); // Detener polling si Realtime funciona
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error en la suscripción Realtime:', err);
            setError(`Error de conexión en tiempo real: ${err?.message || 'Error desconocido'}`);
            setRealtimeError(true);
            startPolling(); // Iniciar polling como fallback
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Timeout en la suscripción Realtime');
            setError('Timeout en la conexión de tiempo real');
            setRealtimeError(true);
            startPolling(); // Iniciar polling como fallback
          } else if (status === 'CLOSED') {
            console.warn('⚠️ Conexión Realtime cerrada');
            setRealtimeError(true);
            startPolling(); // Iniciar polling como fallback
          }
        });
    } catch (error) {
      console.error('❌ Error configurando Realtime:', error);
      setError('Error configurando conexión en tiempo real');
      setRealtimeError(true);
      startPolling(); // Iniciar polling como fallback
    }

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando Realtime...');
      if (remitosChannel) {
        supabase.removeChannel(remitosChannel);
      }
      stopPolling();
    };
  }, [loadRemitos, loadCurrentRemito, startPolling, stopPolling]);

  // Generar remito para Villa Martelli
  const generateRemitoForVillaMartelli = async (productionItems: ProductionItem[]) => {
    try {
      setError(null);
      console.log('🔄 Generando remito para Villa Martelli...');
      const remito = await RemitoService.generateRemitoForVillaMartelli(productionItems);
      
      if (remito) {
        console.log('✅ Remito generado exitosamente:', remito);
        // Recargar datos después de generar
        await loadRemitos();
        await loadCurrentRemito();
      }
      
      return remito;
    } catch (err) {
      setError('Error al generar el remito');
      console.error('❌ Error generando remito:', err);
      throw err;
    }
  };

  // Cerrar remito
  const closeRemito = async (remitoId: string) => {
    try {
      setError(null);
      console.log('🔄 Cerrando remito en hook...', remitoId);
      
      // Validar que el ID existe
      if (!remitoId || remitoId.trim() === '') {
        console.error('❌ ID de remito inválido:', remitoId);
        setError('ID de remito inválido');
        return false;
      }
      
      const success = await RemitoService.closeRemito(remitoId);
      console.log('✅ Resultado del servicio:', success);
      
      if (success) {
        console.log('✅ Remito cerrado exitosamente en hook');
        // Recargar datos después de cerrar
        console.log('🔄 Recargando datos...');
        try {
          await loadRemitos();
          await loadCurrentRemito();
          console.log('✅ Datos recargados exitosamente');
        } catch (reloadError) {
          console.error('❌ Error recargando datos:', reloadError);
          // No fallar el cierre por error de recarga
        }
      } else {
        console.error('❌ El servicio retornó false');
        setError('No se pudo cerrar el remito');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cerrar el remito: ${errorMessage}`);
      console.error('❌ Error cerrando remito en hook:', err);
      return false;
    }
  };

  // Obtener remito por ID
  const getRemitoById = async (remitoId: string) => {
    try {
      setError(null);
      const remito = await RemitoService.getRemitoById(remitoId);
      return remito;
    } catch (err) {
      setError('Error al obtener el remito');
      console.error('❌ Error obteniendo remito:', err);
      throw err;
    }
  };

  return {
    remitos,
    currentRemito,
    loading,
    error,
    realtimeError,
    isPolling: pollingInterval !== null,
    loadRemitos,
    loadCurrentRemito,
    generateRemitoForVillaMartelli,
    closeRemito,
    getRemitoById
  };
};
