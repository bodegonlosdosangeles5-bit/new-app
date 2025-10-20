import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://xfkgrcygkqfusfsjvdly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhma2dyY3lna3FmdXNmc2p2ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDE3MzcsImV4cCI6MjA3NDY3NzczN30.dHLljphdMn3hg1u22E3snWI-p-IbpsW6y44q-Ldr4qI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWithoutRLS() {
  console.log('🔍 Probando consultas sin RLS...');
  
  try {
    // Probar consulta a fórmulas
    console.log('📋 Probando consulta a fórmulas...');
    const { data: formulas, error: formulasError } = await supabase
      .from('formulas')
      .select('*')
      .limit(5);

    if (formulasError) {
      console.error('❌ Error en fórmulas:', formulasError);
    } else {
      console.log('✅ Fórmulas consultadas exitosamente:', formulas?.length || 0, 'registros');
    }

    // Probar consulta a inventario
    console.log('📦 Probando consulta a inventario...');
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(5);

    if (inventoryError) {
      console.error('❌ Error en inventario:', inventoryError);
    } else {
      console.log('✅ Inventario consultado exitosamente:', inventory?.length || 0, 'registros');
    }

    // Probar consulta a remitos
    console.log('📄 Probando consulta a remitos...');
    const { data: remitos, error: remitosError } = await supabase
      .from('remitos')
      .select('*')
      .limit(5);

    if (remitosError) {
      console.error('❌ Error en remitos:', remitosError);
    } else {
      console.log('✅ Remitos consultados exitosamente:', remitos?.length || 0, 'registros');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function createTestData() {
  console.log('📝 Creando datos de prueba...');
  
  try {
    // Crear una fórmula de prueba
    const { data: formula, error: formulaError } = await supabase
      .from('formulas')
      .insert({
        id: 'TEST-FORMULA-001',
        name: 'Fórmula de Prueba',
        batch_size: 100,
        status: 'available',
        destination: 'Villa Martelli',
        type: 'stock',
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (formulaError) {
      console.error('❌ Error creando fórmula:', formulaError);
    } else {
      console.log('✅ Fórmula de prueba creada:', formula);
    }

    // Crear un item de inventario de prueba
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory_items')
      .insert({
        id: 'TEST-INVENTORY-001',
        name: 'Materia Prima de Prueba',
        quantity: 50,
        unit: 'kg',
        category: 'test'
      })
      .select()
      .single();

    if (inventoryError) {
      console.error('❌ Error creando inventario:', inventoryError);
    } else {
      console.log('✅ Item de inventario creado:', inventory);
    }

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando prueba sin RLS...');
  console.log('');
  console.log('⚠️ IMPORTANTE: Este script asume que RLS está deshabilitado temporalmente');
  console.log('📋 Si ves errores 403, necesitas ejecutar el SQL en Supabase Dashboard');
  console.log('');
  
  await testWithoutRLS();
  console.log('');
  
  // Preguntar si crear datos de prueba
  console.log('💡 ¿Quieres crear datos de prueba? (Esto creará registros en la BD)');
  console.log('   Ejecuta: node scripts/disable-rls-temporarily.js --create-data');
  
  if (process.argv.includes('--create-data')) {
    await createTestData();
  }
  
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('1. Si ves errores 403, ejecuta supabase/URGENT_RLS_FIX.sql en Supabase Dashboard');
  console.log('2. Si las consultas funcionan, el problema era RLS');
  console.log('3. Después de aplicar el SQL, prueba tu aplicación nuevamente');
}

main().catch(console.error);
