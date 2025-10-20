import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xfkgrcygkqfusfsjvdly.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhma2dyY3lna3FmdXNmc2p2ZGx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEwMTczNywiZXhwIjoyMDc0Njc3NzM3fQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq";

// Crear cliente con service key para operaciones administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSupabaseSecurity() {
  console.log('🔧 Iniciando corrección de seguridad de Supabase...');

  try {
    // 1. Leer y aplicar las correcciones de seguridad
    const securityFixesPath = path.join(__dirname, '..', 'supabase', 'security-fixes.sql');
    const securityFixes = fs.readFileSync(securityFixesPath, 'utf8');
    
    console.log('📄 Aplicando correcciones de seguridad...');
    const { error: fixesError } = await supabase.rpc('exec_sql', { sql: securityFixes });
    
    if (fixesError) {
      console.error('❌ Error aplicando correcciones:', fixesError);
      // Intentar aplicar las correcciones de forma individual
      await applyIndividualFixes();
    } else {
      console.log('✅ Correcciones de seguridad aplicadas exitosamente');
    }

    // 2. Verificar que las políticas RLS estén activas
    console.log('🔍 Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'formulas');

    if (policiesError) {
      console.error('❌ Error verificando políticas:', policiesError);
    } else {
      console.log(`✅ Encontradas ${policies?.length || 0} políticas para fórmulas`);
    }

    // 3. Probar la función get_formulas_complete
    console.log('🧪 Probando función get_formulas_complete...');
    const { data: testData, error: testError } = await supabase
      .rpc('get_formulas_complete');

    if (testError) {
      console.error('❌ Error probando función:', testError);
    } else {
      console.log(`✅ Función funcionando correctamente. Datos: ${testData?.length || 0} registros`);
    }

    console.log('🎉 Corrección de seguridad completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function applyIndividualFixes() {
  console.log('🔧 Aplicando correcciones individuales...');

  try {
    // 1. Eliminar políticas conflictivas
    console.log('🗑️ Eliminando políticas conflictivas...');
    await supabase.rpc('exec_sql', { 
      sql: `
        DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a fórmulas" ON formulas;
        DROP POLICY IF EXISTS "Solo usuarios autenticados pueden acceder a inventario" ON inventory_items;
      `
    });

    // 2. Crear políticas específicas
    console.log('🛡️ Creando políticas específicas...');
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Usuarios autenticados pueden leer fórmulas" ON formulas
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Usuarios autenticados pueden crear fórmulas" ON formulas
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Usuarios autenticados pueden actualizar fórmulas" ON formulas
            FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Usuarios autenticados pueden eliminar fórmulas" ON formulas
            FOR DELETE USING (auth.role() = 'authenticated');
      `
    });

    // 3. Crear función get_formulas_complete
    console.log('⚙️ Creando función get_formulas_complete...');
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE OR REPLACE FUNCTION get_formulas_complete()
        RETURNS TABLE (
            id text,
            name text,
            batch_size integer,
            status text,
            destination text,
            date text,
            type text,
            client_name text,
            created_at timestamptz,
            updated_at timestamptz,
            missing_ingredients_count bigint,
            available_ingredients_count bigint
        ) 
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
            IF auth.role() != 'authenticated' THEN
                RAISE EXCEPTION 'Acceso denegado: usuario no autenticado';
            END IF;
            
            RETURN QUERY
            SELECT 
                f.id,
                f.name,
                f.batch_size,
                f.status,
                f.destination,
                f.date,
                f.type,
                f.client_name,
                f.created_at,
                f.updated_at,
                COALESCE(missing_count.count, 0) as missing_ingredients_count,
                COALESCE(available_count.count, 0) as available_ingredients_count
            FROM formulas f
            LEFT JOIN (
                SELECT formula_id, COUNT(*) as count
                FROM missing_ingredients
                GROUP BY formula_id
            ) missing_count ON f.id = missing_count.formula_id
            LEFT JOIN (
                SELECT formula_id, COUNT(*) as count
                FROM available_ingredients
                GROUP BY formula_id
            ) available_count ON f.id = available_count.formula_id;
        END;
        $$;
      `
    });

    // 4. Otorgar permisos
    console.log('🔑 Otorgando permisos...');
    await supabase.rpc('exec_sql', { 
      sql: `
        GRANT EXECUTE ON FUNCTION get_formulas_complete() TO authenticated;
      `
    });

    console.log('✅ Correcciones individuales aplicadas');

  } catch (error) {
    console.error('❌ Error en correcciones individuales:', error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixSupabaseSecurity();
}

export { fixSupabaseSecurity };
