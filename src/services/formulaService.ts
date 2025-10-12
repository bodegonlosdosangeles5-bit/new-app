import { supabase } from '@/integrations/supabase/client';

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

export class FormulaService {
  // Obtener todas las fórmulas
  static async getFormulas(): Promise<Formula[]> {
    try {
      const { data: formulas, error } = await supabase
        .from('formulas')
        .select(`
          id,
          name,
          batch_size,
          status,
          destination,
          date,
          type,
          client_name,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!formulas || formulas.length === 0) {
        return [];
      }

      // Obtener ingredientes faltantes para todas las fórmulas
      const formulaIds = formulas.map(f => f.id);
      
      const { data: missingIngredients } = await supabase
        .from('missing_ingredients')
        .select('formula_id, name, required, unit')
        .in('formula_id', formulaIds);

      const { data: availableIngredients } = await supabase
        .from('available_ingredients')
        .select('formula_id, name, required, available, unit')
        .in('formula_id', formulaIds);

      // Agrupar ingredientes por fórmula
      const missingByFormula = (missingIngredients || []).reduce((acc, ingredient) => {
        if (!acc[ingredient.formula_id]) {
          acc[ingredient.formula_id] = [];
        }
        acc[ingredient.formula_id].push({
          name: ingredient.name,
          required: parseFloat(ingredient.required.toString()),
          unit: ingredient.unit
        });
        return acc;
      }, {} as Record<string, Array<{name: string, required: number, unit: string}>>);

      // Log para debugging
      console.log('🔍 Ingredientes faltantes agrupados:', missingByFormula);

      const availableByFormula = (availableIngredients || []).reduce((acc, ingredient) => {
        if (!acc[ingredient.formula_id]) {
          acc[ingredient.formula_id] = [];
        }
        acc[ingredient.formula_id].push({
          name: ingredient.name,
          required: parseFloat(ingredient.required.toString()),
          available: parseFloat(ingredient.available.toString()),
          unit: ingredient.unit
        });
        return acc;
      }, {} as Record<string, Array<{name: string, required: number, available: number, unit: string}>>);

      return formulas.map(formula => ({
        id: formula.id,
        name: formula.name,
        batchSize: formula.batch_size,
        status: formula.status as 'available' | 'incomplete',
        destination: formula.destination,
        date: formula.date || undefined,
        type: formula.type as 'stock' | 'client',
        clientName: formula.client_name || undefined,
        missingIngredients: missingByFormula[formula.id] || [],
        ingredients: availableByFormula[formula.id] || []
      }));
    } catch (error) {
      console.error('Error fetching formulas:', error);
      return [];
    }
  }

  // Crear una nueva fórmula
  static async createFormula(formula: Omit<Formula, 'id'> & { id?: string }): Promise<Formula | null> {
    try {
      console.log('🔧 Creando fórmula con datos:', formula);
      
      // Usar ID proporcionado o generar uno único
      const id = formula.id || `F${Date.now()}`;
      console.log('🆔 ID usado:', id);
      
      const { data, error } = await supabase
        .from('formulas')
        .insert({
          id: id,
          name: formula.name,
          batch_size: formula.batchSize,
          status: formula.status,
          destination: formula.destination,
          date: formula.date || null,
          type: formula.type,
          client_name: formula.clientName || null
        })
        .select()
        .single();

      console.log('📊 Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      // Insertar ingredientes faltantes si existen
      if (formula.missingIngredients && formula.missingIngredients.length > 0) {
        const missingIngredientsData = formula.missingIngredients.map(ingredient => ({
          formula_id: id,
          name: ingredient.name,
          required: ingredient.required,
          unit: ingredient.unit
        }));

        await supabase
          .from('missing_ingredients')
          .insert(missingIngredientsData);
      }

      // Insertar ingredientes disponibles si existen
      if (formula.ingredients && formula.ingredients.length > 0) {
        const availableIngredientsData = formula.ingredients.map(ingredient => ({
          formula_id: id,
          name: ingredient.name,
          required: ingredient.required,
          available: ingredient.available,
          unit: ingredient.unit
        }));

        await supabase
          .from('available_ingredients')
          .insert(availableIngredientsData);
      }

      const result = {
        ...formula,
        id: id
      };
      
      console.log('✅ Fórmula creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating formula:', error);
      return null;
    }
  }

  // Actualizar una fórmula
  static async updateFormula(id: string, updates: Partial<Formula>): Promise<Formula | null> {
    try {
      const { data, error } = await supabase
        .from('formulas')
        .update({
          name: updates.name,
          batch_size: updates.batchSize,
          status: updates.status,
          destination: updates.destination,
          date: updates.date || null,
          type: updates.type,
          client_name: updates.clientName || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar ingredientes faltantes si se proporcionan
      if (updates.missingIngredients) {
        // Eliminar ingredientes existentes
        await supabase
          .from('missing_ingredients')
          .delete()
          .eq('formula_id', id);

        // Insertar nuevos ingredientes
        if (updates.missingIngredients.length > 0) {
          const missingIngredientsData = updates.missingIngredients.map(ingredient => ({
            formula_id: id,
            name: ingredient.name,
            required: ingredient.required,
            unit: ingredient.unit
          }));

          await supabase
            .from('missing_ingredients')
            .insert(missingIngredientsData);
        }
      }

      return {
        ...updates,
        id: id
      } as Formula;
    } catch (error) {
      console.error('Error updating formula:', error);
      return null;
    }
  }

  // Agregar ingrediente faltante a una fórmula
  static async addMissingIngredient(formulaId: string, ingredient: {
    name: string;
    required: number;
    unit: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('missing_ingredients')
        .insert({
          formula_id: formulaId,
          name: ingredient.name,
          required: ingredient.required,
          unit: ingredient.unit
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding missing ingredient:', error);
      return false;
    }
  }

  // Eliminar ingrediente faltante de una fórmula
  static async removeMissingIngredient(formulaId: string, ingredientName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('missing_ingredients')
        .delete()
        .eq('formula_id', formulaId)
        .eq('name', ingredientName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing missing ingredient:', error);
      return false;
    }
  }

  // Eliminar una fórmula
  static async deleteFormula(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('formulas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting formula:', error);
      return false;
    }
  }
}