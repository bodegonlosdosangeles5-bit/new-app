import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormulaService } from '@/services/formulaService';

// Definir el tipo Formula localmente para evitar conflictos
export interface Formula {
  id: string;
  name: string;
  batchSize: number;
  status: 'available' | 'incomplete';
  destination: string;
  date?: string;
  type: 'stock' | 'client';
  clientName?: string;
  missingIngredients?: Array<{
    name: string;
    required: number;
    unit: string;
  }>;
  ingredients?: Array<{
    name: string;
    required: number;
    available: number;
    unit: string;
  }>;
}

export const useRealtimeFormulas = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar fórmulas iniciales
  const loadFormulas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando fórmulas desde Supabase...');
      console.log('🔍 Verificando conexión a Supabase...');
      
      // Verificar conexión a Supabase
      const { data: testData, error: testError } = await supabase
        .from('formulas')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Error de conexión a Supabase:', testError);
        throw testError;
      }
      
      console.log('✅ Conexión a Supabase exitosa. Total de fórmulas en BD:', testData);
      
      const data = await FormulaService.getFormulas();
      console.log('📊 Fórmulas cargadas desde servicio:', data);
      console.log('📊 Número de fórmulas cargadas:', data?.length || 0);
      setFormulas(data || []);
      
      // Log adicional para debuggear el filtrado
      const villaMartelliFormulas = data?.filter(formula => {
        const normalizedDestination = formula.destination?.toLowerCase().replace(/\s+/g, '') || '';
        const normalizedStatus = formula.status?.toLowerCase().replace(/\s+/g, '') || '';
        const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
        const isVillaMartelli = normalizedDestination === 'villamartelli';
        const isNotProcessed = normalizedStatus !== 'procesado';
        return isTerminated && isVillaMartelli && isNotProcessed;
      }) || [];
      console.log(`📊 Fórmulas disponibles para Villa Martelli: ${villaMartelliFormulas.length}`);
    } catch (err) {
      setError('Error al cargar las fórmulas');
      console.error('❌ Error cargando fórmulas:', err);
      console.error('❌ Detalles del error:', {
        message: err instanceof Error ? err.message : 'Error desconocido',
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar fórmulas al montar el componente
  useEffect(() => {
    loadFormulas();
  }, [loadFormulas]);


  // Configurar Realtime para fórmulas
  useEffect(() => {
    console.log('🔌 Configurando Realtime para fórmulas...');
    
    const formulasChannel = supabase
      .channel('formulas-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'formulas'
        },
        (payload) => {
          console.log('📡 Cambio detectado en fórmulas:', payload);
          console.log('🔄 Recargando fórmulas debido a cambio en tiempo real...');
          // Recargar todas las fórmulas cuando hay cambios
          loadFormulas();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'missing_ingredients'
        },
        (payload) => {
          console.log('📡 Cambio detectado en ingredientes faltantes:', payload);
          // Recargar todas las fórmulas cuando hay cambios en ingredientes
          loadFormulas();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'available_ingredients'
        },
        (payload) => {
          console.log('📡 Cambio detectado en ingredientes disponibles:', payload);
          // Recargar todas las fórmulas cuando hay cambios en ingredientes
          loadFormulas();
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
      supabase.removeChannel(formulasChannel);
    };
  }, [loadFormulas]);

  // Funciones CRUD que actualizan automáticamente via Realtime
  const createFormula = async (formula: Omit<Formula, 'id'> & { id?: string }) => {
    try {
      setError(null);
      console.log('🔄 Creando fórmula...');
      const newFormula = await FormulaService.createFormula(formula);
      console.log('📊 Fórmula creada:', newFormula);
      // Recargar datos después de crear
      await loadFormulas();
      return newFormula;
    } catch (err) {
      setError('Error al crear la fórmula');
      console.error('❌ Error creando fórmula:', err);
      throw err;
    }
  };

  const updateFormula = async (id: string, updates: Partial<Formula>) => {
    try {
      setError(null);
      console.log('🔄 Actualizando fórmula...');
      const updatedFormula = await FormulaService.updateFormula(id, updates);
      console.log('📊 Fórmula actualizada:', updatedFormula);
      // Recargar datos después de actualizar
      await loadFormulas();
      return updatedFormula;
    } catch (err) {
      setError('Error al actualizar la fórmula');
      console.error('❌ Error actualizando fórmula:', err);
      throw err;
    }
  };

  const deleteFormula = async (id: string) => {
    try {
      setError(null);
      console.log('🔄 Eliminando fórmula...');
      const success = await FormulaService.deleteFormula(id);
      console.log('📊 Fórmula eliminada:', success);
      // Recargar datos después de eliminar
      await loadFormulas();
      return success;
    } catch (err) {
      setError('Error al eliminar la fórmula');
      console.error('❌ Error eliminando fórmula:', err);
      throw err;
    }
  };

  const addMissingIngredient = async (formulaId: string, ingredient: {
    name: string;
    required: number;
    unit: string;
  }) => {
    try {
      setError(null);
      console.log('🔄 Agregando ingrediente faltante...');
      const success = await FormulaService.addMissingIngredient(formulaId, ingredient);
      console.log('📊 Ingrediente agregado:', success);
      // Recargar datos después de agregar ingrediente
      await loadFormulas();
      return success;
    } catch (err) {
      setError('Error al agregar ingrediente');
      console.error('❌ Error agregando ingrediente:', err);
      throw err;
    }
  };

  const removeMissingIngredient = async (formulaId: string, ingredientName: string) => {
    try {
      setError(null);
      console.log('🔄 Eliminando ingrediente faltante...');
      const success = await FormulaService.removeMissingIngredient(formulaId, ingredientName);
      console.log('📊 Ingrediente eliminado:', success);
      // Recargar datos después de eliminar ingrediente
      await loadFormulas();
      return success;
    } catch (err) {
      setError('Error al eliminar ingrediente');
      console.error('❌ Error eliminando ingrediente:', err);
      throw err;
    }
  };

  const updateIncompleteFormulasStatus = async () => {
    try {
      setError(null);
      console.log('🔄 Actualizando fórmulas incompletas sin faltantes...');
      const result = await FormulaService.updateIncompleteFormulasStatus();
      
      if (result.updated > 0) {
        console.log(`✅ Se actualizaron ${result.updated} fórmulas a estado terminado`);
        // Recargar datos después de actualizar
        await loadFormulas();
      }
      
      return result;
    } catch (err) {
      setError('Error al actualizar fórmulas incompletas');
      console.error('❌ Error actualizando fórmulas incompletas:', err);
      throw err;
    }
  };

  return {
    formulas,
    loading,
    error,
    loadFormulas,
    createFormula,
    updateFormula,
    deleteFormula,
    addMissingIngredient,
    removeMissingIngredient,
    updateIncompleteFormulasStatus
  };
};
