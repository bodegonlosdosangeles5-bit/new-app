import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RemitoService, RemitoWithItems, ProductionItem } from '@/services/remitoService';

export const useRemitosPolling = () => {
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
      console.log('🔄 Cargando remito actual...');
      const data = await RemitoService.getCurrentRemito();
      console.log('📊 Remito actual cargado:', data);
      setCurrentRemito(data);
    } catch (err) {
      console.error('❌ Error cargando remito actual:', err);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRemitos();
    loadCurrentRemito();
  }, [loadRemitos, loadCurrentRemito]);

  // Configurar polling para actualizaciones
  useEffect(() => {
    console.log('🔄 Iniciando polling para remitos...');
    const interval = setInterval(() => {
      console.log('🔄 Polling: actualizando remitos...');
      loadRemitos();
      loadCurrentRemito();
    }, 3000); // Polling cada 3 segundos

    return () => {
      console.log('🛑 Deteniendo polling...');
      clearInterval(interval);
    };
  }, [loadRemitos, loadCurrentRemito]);

  // Generar remito para Villa Martelli
  const generateRemitoForVillaMartelli = async (productionItems: ProductionItem[]) => {
    try {
      setError(null);
      console.log('🔄 Generando remito desde hook...');
      const remito = await RemitoService.generateRemitoForVillaMartelli(productionItems);
      
      if (remito) {
        console.log('✅ Remito generado exitosamente desde hook');
        // Recargar datos después de generar
        await loadRemitos();
        await loadCurrentRemito();
      }
      
      return remito;
    } catch (err) {
      console.error('❌ Error generando remito desde hook:', err);
      setError('Error al generar el remito');
      throw err;
    }
  };

  // Cerrar remito
  const closeRemito = async (remitoId: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('🔄 Cerrando remito en hook...', remitoId);
      
      const success = await RemitoService.closeRemito(remitoId);
      console.log('✅ Resultado del servicio:', success);
      
      if (success) {
        console.log('✅ Remito cerrado exitosamente en hook');
        // Recargar datos después de cerrar
        await loadRemitos();
        await loadCurrentRemito();
      }
      
      return success;
    } catch (err) {
      console.error('❌ Error cerrando remito desde hook:', err);
      setError('Error al cerrar el remito');
      return false;
    }
  };

  // Obtener remito por ID
  const getRemitoById = async (remitoId: string): Promise<RemitoWithItems | null> => {
    try {
      setError(null);
      console.log('🔄 Obteniendo remito por ID:', remitoId);
      const remito = await RemitoService.getRemitoById(remitoId);
      console.log('📊 Remito obtenido:', remito);
      return remito;
    } catch (err) {
      console.error('❌ Error obteniendo remito:', err);
      setError('Error al obtener el remito');
      throw err;
    }
  };

  return {
    remitos,
    currentRemito,
    loading,
    error,
    isPolling: true,
    loadRemitos,
    loadCurrentRemito,
    generateRemitoForVillaMartelli,
    closeRemito,
    getRemitoById
  };
};
