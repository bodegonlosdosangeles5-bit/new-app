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
      const newFormula = await FormulaService.createFormula(formula);
      if (newFormula) {
        console.log('✅ Fórmula creada, actualizando estado local:', newFormula);
        setFormulas(prev => {
          const updated = [newFormula, ...prev];
          console.log('📋 Estado actualizado de fórmulas:', updated);
          return updated;
        });
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

  return {
    formulas,
    loading,
    error,
    loadFormulas,
    createFormula,
    updateFormula,
    deleteFormula
  };
};
