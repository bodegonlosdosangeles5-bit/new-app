import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RemitoService, RemitoWithItems, ProductionItem } from '@/services/remitoService';

export const useRealtimeRemitos = () => {
  const [remitos, setRemitos] = useState<RemitoWithItems[]>([]);
  const [currentRemito, setCurrentRemito] = useState<RemitoWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Configurar Realtime para remitos
  useEffect(() => {
    console.log('🔌 Configurando Realtime para remitos...');
    
    const remitosChannel = supabase
      .channel('remitos_changes')
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
      .subscribe((status) => {
        console.log('🔌 Estado de suscripción Realtime:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito exitosamente a cambios en tiempo real');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en la suscripción Realtime');
          setError('Error de conexión en tiempo real');
        }
      });

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando Realtime...');
      supabase.removeChannel(remitosChannel);
    };
  }, [loadRemitos, loadCurrentRemito]);

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
    loadRemitos,
    loadCurrentRemito,
    generateRemitoForVillaMartelli,
    closeRemito,
    getRemitoById
  };
};
