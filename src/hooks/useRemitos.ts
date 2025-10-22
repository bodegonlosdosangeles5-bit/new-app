import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RemitoService, Remito, RemitoWithItems } from '@/services/remitoService';

export const useRemitos = () => {
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar remitos
  const loadRemitos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const remitosData = await RemitoService.getAllRemitos();
      setRemitos(remitosData);
    } catch (err) {
      console.error('Error cargando remitos:', err);
      setError('Error al cargar remitos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar remitos al montar el componente
  useEffect(() => {
    loadRemitos();
  }, [loadRemitos]);

  // Configurar suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('remitos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remitos'
        },
        (payload) => {
          console.log('🔄 Cambio en remitos:', payload);
          loadRemitos(); // Recargar remitos cuando hay cambios
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remito_items'
        },
        (payload) => {
          console.log('🔄 Cambio en remito_items:', payload);
          loadRemitos(); // Recargar remitos cuando hay cambios en los items
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRemitos]);

  // Obtener remito con items
  const getRemitoWithItems = useCallback(async (remitoId: string): Promise<RemitoWithItems | null> => {
    try {
      setError(null);
      return await RemitoService.getRemitoWithItems(remitoId);
    } catch (err) {
      console.error('Error obteniendo remito con items:', err);
      setError('Error al obtener detalles del remito');
      return null;
    }
  }, []);

  return {
    remitos,
    loading,
    error,
    loadRemitos,
    getRemitoWithItems
  };
};
