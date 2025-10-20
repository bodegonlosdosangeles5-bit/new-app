import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = "https://xfkgrcygkqfusfsjvdly.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhma2dyY3lna3FmdXNmc2p2ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDE3MzcsImV4cCI6MjA3NDY3NzczN30.dHLljphdMn3hg1u22E3snWI-p-IbpsW6y44q-Ldr4qI";

// Crear cliente con anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyQuickFix() {
  console.log('🔧 Aplicando corrección rápida de seguridad...');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'quick-security-fix.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Contenido SQL cargado, aplicando correcciones...');
    
    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Encontrados ${statements.length} statements SQL`);

    // Aplicar cada statement individualmente
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚙️ Aplicando statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`⚠️ Warning en statement ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} aplicado exitosamente`);
        }
      } catch (err) {
        console.warn(`⚠️ Error en statement ${i + 1}:`, err.message);
      }
    }

    console.log('🎉 Corrección rápida completada');

  } catch (error) {
    console.error('❌ Error aplicando corrección:', error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applyQuickFix();
}

export { applyQuickFix };
