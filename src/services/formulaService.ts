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
      // @ts-expect-error - Temporal para evitar errores de tipos
      const { data, error } = await supabase
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
          updated_at,
          missing_ingredients (
            name,
            required,
            unit
          ),
          available_ingredients (
            name,
            required,
            available,
            unit
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(formula => ({
        id: formula.id,
        name: formula.name,
        batchSize: formula.batch_size,
        status: formula.status,
        destination: formula.destination,
        date: formula.date || undefined,
        type: formula.type,
        clientName: formula.client_name || undefined,
        missingIngredients: formula.missing_ingredients || [],
        ingredients: formula.available_ingredients || []
      })) || [];
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
      
      // @ts-expect-error - Temporal para evitar errores de tipos
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

        // @ts-expect-error
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

        // @ts-expect-error
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
      // @ts-expect-error - Temporal para evitar errores de tipos
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
        // @ts-expect-error
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

          // @ts-expect-error
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

  // Eliminar una fórmula
  static async deleteFormula(id: string): Promise<boolean> {
    try {
      // @ts-expect-error - Temporal para evitar errores de tipos
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