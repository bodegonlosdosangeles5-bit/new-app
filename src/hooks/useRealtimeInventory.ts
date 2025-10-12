import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryService, InventoryItem } from '@/services/inventoryService';

export const useRealtimeInventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar materias primas iniciales
  const loadInventoryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando materias primas desde Supabase...');
      const data = await InventoryService.getInventoryItems();
      console.log('📊 Materias primas cargadas:', data);
      setInventoryItems(data);
    } catch (err) {
      setError('Error al cargar las materias primas');
      console.error('❌ Error cargando materias primas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar materias primas al montar el componente
  useEffect(() => {
    loadInventoryItems();
  }, [loadInventoryItems]);

  // Configurar Realtime para materias primas
  useEffect(() => {
    console.log('🔌 Configurando Realtime para materias primas...');
    
    const inventoryChannel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'inventory_items'
        },
        (payload) => {
          console.log('📡 Cambio detectado en materias primas:', payload);
          // Recargar todas las materias primas cuando hay cambios
          loadInventoryItems();
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
      supabase.removeChannel(inventoryChannel);
    };
  }, [loadInventoryItems]);

  // Funciones CRUD que actualizan automáticamente via Realtime
  const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdate' | 'status'>) => {
    try {
      setError(null);
      console.log('🔄 Creando materia prima...');
      const newItem = await InventoryService.createInventoryItem(item);
      console.log('📊 Materia prima creada:', newItem);
      // Recargar datos después de crear
      await loadInventoryItems();
      return newItem;
    } catch (err) {
      setError('Error al crear la materia prima');
      console.error('❌ Error creando materia prima:', err);
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      setError(null);
      console.log('🔄 Actualizando materia prima...');
      const updatedItem = await InventoryService.updateInventoryItem(id, updates);
      console.log('📊 Materia prima actualizada:', updatedItem);
      // Recargar datos después de actualizar
      await loadInventoryItems();
      return updatedItem;
    } catch (err) {
      setError('Error al actualizar la materia prima');
      console.error('❌ Error actualizando materia prima:', err);
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      setError(null);
      console.log('🔄 Eliminando materia prima...');
      const success = await InventoryService.deleteInventoryItem(id);
      console.log('📊 Materia prima eliminada:', success);
      // Recargar datos después de eliminar
      await loadInventoryItems();
      return success;
    } catch (err) {
      setError('Error al eliminar la materia prima');
      console.error('❌ Error eliminando materia prima:', err);
      throw err;
    }
  };

  return {
    inventoryItems,
    loading,
    error,
    loadInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  };
};
