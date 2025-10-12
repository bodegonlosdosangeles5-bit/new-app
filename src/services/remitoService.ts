import { supabase } from '@/integrations/supabase/client';

export interface Remito {
  id: string;
  destino: string;
  fecha: string;
  total_kilos: number;
  estado: 'abierto' | 'cerrado';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface RemitoItem {
  id: string;
  remito_id: string;
  producto_id: string;
  nombre_producto: string;
  kilos_sumados: number;
  cantidad_lotes: number;
  lote?: string;
  cliente_o_stock?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface RemitoWithItems extends Remito {
  items: RemitoItem[];
}

export interface ProductionItem {
  id: string;
  name: string;
  batchSize: number;
  destination: string;
  status: string;
  date?: string;
  type: string;
  clientName?: string;
}

export class RemitoService {
  // Generar o actualizar remito del día para Villa Martelli
  static async generateRemitoForVillaMartelli(productionItems: ProductionItem[]): Promise<RemitoWithItems | null> {
    try {
      console.log('🔄 Generando remito para Villa Martelli...');
      
      // Filtrar items de Villa Martelli que estén terminados
      const villaMartelliItems = productionItems.filter(item => {
        const normalizedStatus = item.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
        const normalizedDestination = item.destination.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
        
        const isTerminated = ['terminado', 'finalizado', 'completo', 'available'].includes(normalizedStatus);
        const isVillaMartelli = normalizedDestination === 'villamartelli';
        
        return isTerminated && isVillaMartelli;
      });

      if (villaMartelliItems.length === 0) {
        console.log('⚠️ No hay items de Villa Martelli para generar remito');
        return null;
      }

      // Agrupar por producto + cliente/stock para mejor detalle
      const groupedItems = villaMartelliItems.reduce((acc, item) => {
        const clienteStock = item.type === 'client' ? (item.clientName || 'Cliente') : 'Stock';
        const key = `${item.id}-${clienteStock}`; // Clave única por producto + cliente/stock
        
        if (!acc[key]) {
          acc[key] = {
            producto_id: item.id,
            nombre_producto: item.name,
            kilos_sumados: 0,
            cantidad_lotes: 0,
            lote: item.id, // Usar ID como lote
            cliente_o_stock: clienteStock,
            lotes: [],
            items: []
          };
        }
        acc[key].kilos_sumados += item.batchSize;
        acc[key].cantidad_lotes += 1;
        acc[key].lotes.push(item.id);
        acc[key].items.push(item);
        return acc;
      }, {} as Record<string, any>);

      const remitoItems = Object.values(groupedItems);
      const totalKilos = remitoItems.reduce((sum, item) => sum + item.kilos_sumados, 0);

      console.log(`📊 Items agrupados: ${remitoItems.length}, Total kilos: ${totalKilos}`);

      // Usar transacción para crear/actualizar remito y sus items
      const { data, error } = await supabase.rpc('generate_remito_villa_martelli', {
        p_destino: 'Villa Martelli',
        p_fecha: new Date().toISOString().split('T')[0],
        p_total_kilos: totalKilos,
        p_observaciones: `Remito generado automáticamente con ${remitoItems.length} productos`
      });

      if (error) {
        console.error('❌ Error en RPC:', error);
        // Fallback: usar operaciones individuales
        return await this.generateRemitoFallback(villaMartelliItems, remitoItems, totalKilos);
      }

      // Obtener el remito creado con sus items
      const remito = await this.getRemitoById(data.remito_id);
      return remito;

    } catch (error) {
      console.error('❌ Error generando remito:', error);
      return null;
    }
  }

  // Fallback: generar remito usando operaciones individuales
  private static async generateRemitoFallback(productionItems: ProductionItem[], remitoItems: any[], totalKilos: number): Promise<RemitoWithItems | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const remitoId = `REM-${Date.now()}`;

      // 1. Buscar remito abierto existente para hoy
      const { data: existingRemito } = await supabase
        .from('remitos')
        .select('*')
        .eq('destino', 'Villa Martelli')
        .eq('fecha', today)
        .eq('estado', 'abierto')
        .single();

      let remito: Remito;
      
      if (existingRemito) {
        // Actualizar remito existente
        const { data: updatedRemito, error: updateError } = await supabase
          .from('remitos')
          .update({
            total_kilos: totalKilos,
            observaciones: `Remito actualizado automáticamente con ${remitoItems.length} productos`,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRemito.id)
          .select()
          .single();

        if (updateError) throw updateError;
        remito = updatedRemito;

        // Eliminar items existentes
        await supabase
          .from('remito_items')
          .delete()
          .eq('remito_id', existingRemito.id);
      } else {
        // Crear nuevo remito
        const { data: newRemito, error: createError } = await supabase
          .from('remitos')
          .insert({
            id: remitoId,
            destino: 'Villa Martelli',
            fecha: today,
            total_kilos: totalKilos,
            estado: 'abierto',
            observaciones: `Remito generado automáticamente con ${remitoItems.length} productos`
          })
          .select()
          .single();

        if (createError) throw createError;
        remito = newRemito;
      }

      // 2. Insertar items del remito
      const itemsToInsert = remitoItems.map((item, index) => ({
        id: `${remito.id}-${index + 1}`,
        remito_id: remito.id,
        producto_id: item.producto_id,
        nombre_producto: item.nombre_producto,
        kilos_sumados: item.kilos_sumados,
        cantidad_lotes: item.cantidad_lotes,
        lote: item.lote, // Lote individual
        cliente_o_stock: item.cliente_o_stock, // Cliente/Stock individual
        notas: `Generado desde ${item.items.length} lotes`
      }));

      const { error: itemsError } = await supabase
        .from('remito_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Obtener remito completo con items
      return await this.getRemitoById(remito.id);

    } catch (error) {
      console.error('❌ Error en fallback:', error);
      return null;
    }
  }

  // Obtener remito por ID con sus items
  static async getRemitoById(remitoId: string): Promise<RemitoWithItems | null> {
    try {
      const { data: remito, error: remitoError } = await supabase
        .from('remitos')
        .select('*')
        .eq('id', remitoId)
        .single();

      if (remitoError) throw remitoError;

      const { data: items, error: itemsError } = await supabase
        .from('remito_items')
        .select('*')
        .eq('remito_id', remitoId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...remito,
        items: items || []
      };
    } catch (error) {
      console.error('❌ Error obteniendo remito:', error);
      return null;
    }
  }

  // Obtener remito abierto del día para Villa Martelli
  static async getOpenRemitoForToday(): Promise<RemitoWithItems | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: remito, error: remitoError } = await supabase
        .from('remitos')
        .select('*')
        .eq('destino', 'Villa Martelli')
        .eq('fecha', today)
        .eq('estado', 'abierto')
        .single();

      if (remitoError && remitoError.code !== 'PGRST116') {
        throw remitoError;
      }

      if (!remito) return null;

      const { data: items, error: itemsError } = await supabase
        .from('remito_items')
        .select('*')
        .eq('remito_id', remito.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...remito,
        items: items || []
      };
    } catch (error) {
      console.error('❌ Error obteniendo remito abierto:', error);
      return null;
    }
  }

  // Cerrar remito
  static async closeRemito(remitoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('remitos')
        .update({
          estado: 'cerrado',
          updated_at: new Date().toISOString()
        })
        .eq('id', remitoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error cerrando remito:', error);
      return false;
    }
  }

  // Obtener todos los remitos
  static async getAllRemitos(): Promise<RemitoWithItems[]> {
    try {
      const { data: remitos, error: remitosError } = await supabase
        .from('remitos')
        .select('*')
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });

      if (remitosError) throw remitosError;

      if (!remitos || remitos.length === 0) return [];

      // Obtener items para cada remito
      const remitosWithItems = await Promise.all(
        remitos.map(async (remito) => {
          const { data: items } = await supabase
            .from('remito_items')
            .select('*')
            .eq('remito_id', remito.id)
            .order('created_at', { ascending: true });

          return {
            ...remito,
            items: items || []
          };
        })
      );

      return remitosWithItems;
    } catch (error) {
      console.error('❌ Error obteniendo remitos:', error);
      return [];
    }
  }
}
