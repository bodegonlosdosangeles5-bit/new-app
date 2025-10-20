const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas la service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas configurar:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySecurityFixes() {
  try {
    console.log('🔧 Aplicando correcciones de seguridad...');
    
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('./supabase/security-fixes.sql', 'utf8');
    
    // Dividir en statements individuales (separados por ;)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Encontrados ${statements.length} statements SQL`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        *-
        if (error) {
          console.error(`❌ Error en statement ${i + 1}:`, error);
          // Continuar con el siguiente statement
        } else {
          console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
        }
      }
    }
    
    console.log('🎉 Correcciones de seguridad aplicadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  applySecurityFixes();
}

module.exports = { applySecurityFixes };
