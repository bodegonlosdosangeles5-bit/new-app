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

      // Agrupar ingredientes por fórmula, evitando duplicados
      const missingByFormula = (missingIngredients || []).reduce((acc, ingredient) => {
        if (!acc[ingredient.formula_id]) {
          acc[ingredient.formula_id] = [];
        }
        
        // Verificar si el ingrediente ya existe para evitar duplicados
        const existingIngredient = acc[ingredient.formula_id].find(
          existing => existing.name === ingredient.name
        );
        
        if (!existingIngredient) {
          acc[ingredient.formula_id].push({
            name: ingredient.name,
            required: parseFloat(ingredient.required.toString()),
            unit: ingredient.unit
          });
        } else {
          // Si ya existe, sumar las cantidades requeridas
          existingIngredient.required += parseFloat(ingredient.required.toString());
        }
        
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
      // Verificar si el ingrediente ya existe para esta fórmula
      const { data: existingIngredient, error: checkError } = await supabase
        .from('missing_ingredients')
        .select('id')
        .eq('formula_id', formulaId)
        .eq('name', ingredient.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Si ya existe, no agregar duplicado
      if (existingIngredient) {
        console.log(`⚠️ Ingrediente "${ingredient.name}" ya existe para la fórmula ${formulaId}`);
        return true; // Retornar true porque no es un error, solo no se duplicó
      }

      // Si no existe, agregarlo
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

  // Actualizar automáticamente el estado de fórmulas incompletas sin faltantes
  static async updateIncompleteFormulasStatus(): Promise<{ updated: number; formulas: Formula[] }> {
    try {
      console.log('🔄 Verificando fórmulas incompletas sin faltantes...');
      
      // Obtener todas las fórmulas con estado incomplete
      const { data: incompleteFormulas, error: formulasError } = await supabase
        .from('formulas')
        .select('id, name, status')
        .eq('status', 'incomplete');

      if (formulasError) throw formulasError;

      if (!incompleteFormulas || incompleteFormulas.length === 0) {
        console.log('✅ No hay fórmulas incompletas para verificar');
        return { updated: 0, formulas: [] };
      }

      const formulaIds = incompleteFormulas.map(f => f.id);
      
      // Obtener ingredientes faltantes para estas fórmulas
      const { data: missingIngredients, error: missingError } = await supabase
        .from('missing_ingredients')
        .select('formula_id')
        .in('formula_id', formulaIds);

      if (missingError) throw missingError;

      // Agrupar ingredientes faltantes por fórmula
      const missingByFormula = (missingIngredients || []).reduce((acc, ingredient) => {
        if (!acc[ingredient.formula_id]) {
          acc[ingredient.formula_id] = [];
        }
        acc[ingredient.formula_id].push(ingredient);
        return acc;
      }, {} as Record<string, Array<{formula_id: string}>>);

      // Encontrar fórmulas incompletas sin ingredientes faltantes
      const formulasToUpdate = incompleteFormulas.filter(formula => 
        !missingByFormula[formula.id] || missingByFormula[formula.id].length === 0
      );

      console.log(`🔍 Encontradas ${formulasToUpdate.length} fórmulas incompletas sin faltantes:`, 
        formulasToUpdate.map(f => f.name));

      if (formulasToUpdate.length === 0) {
        console.log('✅ No hay fórmulas que actualizar');
        return { updated: 0, formulas: [] };
      }

      // Actualizar el estado de estas fórmulas a 'available'
      const formulaIdsToUpdate = formulasToUpdate.map(f => f.id);
      
      const { error: updateError } = await supabase
        .from('formulas')
        .update({ 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .in('id', formulaIdsToUpdate);

      if (updateError) throw updateError;

      console.log(`✅ Actualizadas ${formulasToUpdate.length} fórmulas a estado 'available'`);

      // Obtener las fórmulas actualizadas con todos sus datos
      const updatedFormulas = await this.getFormulas();
      const updatedFormulasList = updatedFormulas.filter(f => formulaIdsToUpdate.includes(f.id));

      return { 
        updated: formulasToUpdate.length, 
        formulas: updatedFormulasList 
      };
    } catch (error) {
      console.error('❌ Error actualizando fórmulas incompletas:', error);
      return { updated: 0, formulas: [] };
    }
  }
}