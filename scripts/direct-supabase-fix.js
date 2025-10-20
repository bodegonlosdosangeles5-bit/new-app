import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const SUPABASE_URL = "https://xfkgrcygkqfusfsjvdly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhma2dyY3lna3FmdXNmc2p2ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDE3MzcsImV4cCI6MjA3NDY3NzczN30.dHLljphdMn3hg1u22E3snWI-p-IbpsW6y44q-Ldr4qI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('formulas')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error de conexión:', error);
      console.log('🔍 Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Si es error 403, significa problema de RLS
      if (error.message?.includes('403') || error.code === 'PGRST301') {
        console.log('🚨 Error 403 detectado - Problema de Row Level Security');
        console.log('💡 Solución: Necesitas aplicar las políticas RLS en Supabase Dashboard');
        console.log('');
        console.log('📋 Pasos para solucionar:');
        console.log('1. Ve a tu proyecto en https://supabase.com/dashboard');
        console.log('2. Navega a Authentication > Policies');
        console.log('3. Aplica las políticas del archivo supabase/quick-security-fix.sql');
        console.log('4. O ejecuta el SQL directamente en el SQL Editor');
      }
    } else {
      console.log('✅ Conexión exitosa');
      console.log(`📊 Total de fórmulas: ${data || 0}`);
    }

    // Probar autenticación
    console.log('🔐 Probando autenticación...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Usuario autenticado:', session.user.email);
    } else {
      console.log('⚠️ No hay sesión activa');
      console.log('💡 Esto puede causar errores 403 si RLS está habilitado');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function createTestUser() {
  console.log('👤 Creando usuario de prueba...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (error) {
      console.error('❌ Error creando usuario:', error);
    } else {
      console.log('✅ Usuario creado:', data.user?.email);
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico de Supabase...');
  console.log('');
  
  await testConnection();
  console.log('');
  
  // Solo crear usuario si no hay sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    await createTestUser();
  }
  
  console.log('');
  console.log('📋 Resumen:');
  console.log('- Si ves errores 403, necesitas configurar RLS en Supabase Dashboard');
  console.log('- Si no hay sesión, las consultas fallarán con RLS habilitado');
  console.log('- Revisa el archivo ERROR_403_FIXES_SUMMARY.md para más detalles');
}

main().catch(console.error);
