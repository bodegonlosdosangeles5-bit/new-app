import { useState, useEffect } from 'react';
import { FormulaService, Formula } from '@/services/formulaService';

export const useFormulas = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar fórmulas al montar el componente
  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando fórmulas desde Supabase...');
      const data = await FormulaService.getFormulas();
      console.log('📊 Fórmulas cargadas:', data);
      setFormulas(data);
    } catch (err) {
      setError('Error al cargar las fórmulas');
      console.error('❌ Error cargando fórmulas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFormula = async (formula: Omit<Formula, 'id'>) => {
    try {
      setError(null);
      console.log('🔄 Creando fórmula en hook useFormulas...');
      console.log('📝 Datos de la fórmula a crear:', formula);
      
      const newFormula = await FormulaService.createFormula(formula);
      console.log('📊 Fórmula creada desde servicio:', newFormula);
      
      if (newFormula) {
        console.log('✅ Fórmula creada, recargando lista completa...');
        // Recargar todas las fórmulas desde la base de datos
        await loadFormulas();
        console.log('🎉 Lista de fórmulas recargada exitosamente');
        return newFormula;
      }
      throw new Error('Error al crear la fórmula');
    } catch (err) {
      setError('Error al crear la fórmula');
      console.error('❌ Error en createFormula hook:', err);
      throw err;
    }
  };

  const updateFormula = async (id: string, updates: Partial<Formula>) => {
    try {
      setError(null);
      const updatedFormula = await FormulaService.updateFormula(id, updates);
      if (updatedFormula) {
        setFormulas(prev => 
          prev.map(formula => 
            formula.id === id ? { ...formula, ...updatedFormula } : formula
          )
        );
        return updatedFormula;
      }
      throw new Error('Error al actualizar la fórmula');
    } catch (err) {
      setError('Error al actualizar la fórmula');
      console.error(err);
      throw err;
    }
  };

  const deleteFormula = async (id: string) => {
    try {
      setError(null);
      const success = await FormulaService.deleteFormula(id);
      if (success) {
        setFormulas(prev => prev.filter(formula => formula.id !== id));
        return true;
      }
      throw new Error('Error al eliminar la fórmula');
    } catch (err) {
      setError('Error al eliminar la fórmula');
      console.error(err);
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
        // Recargar todas las fórmulas para reflejar los cambios
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
    updateIncompleteFormulasStatus
  };
};
