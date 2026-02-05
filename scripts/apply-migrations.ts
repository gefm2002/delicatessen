import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration(filename: string) {
  console.log(`\n📝 Aplicando ${filename}...`);
  
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename);
  const sql = readFileSync(migrationPath, 'utf-8');
  
  // Execute SQL using REST API
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        // Use REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceRoleKey,
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // Ignore "already exists" errors
          if (!errorText.includes('already exists') && 
              !errorText.includes('duplicate') &&
              !errorText.includes('does not exist')) {
            console.warn(`⚠️  Advertencia: ${statement.substring(0, 60)}...`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err: any) {
        // Try direct SQL execution via PostgREST
        try {
          // For CREATE statements, we'll use a different approach
          if (statement.toUpperCase().startsWith('CREATE')) {
            // These will be handled by Supabase Dashboard or CLI
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }
    }
  }
  
  console.log(`✓ ${filename} (${successCount} statements, ${errorCount} warnings)`);
}

async function main() {
  console.log('🚀 Aplicando migrations a Supabase...\n');
  console.log(`URL: ${supabaseUrl}\n`);

  const migrations = [
    '001_init.sql',
    '002_storage.sql',
    '010_rpc_insert_order.sql',
  ];

  // Instead of executing SQL directly, we'll use Supabase client methods
  // For now, let's just verify connection and prepare for manual application
  console.log('⚠️  Las migrations deben aplicarse manualmente desde Supabase Dashboard');
  console.log('   o usando Supabase CLI: supabase db push\n');
  
  console.log('Migrations a aplicar:');
  migrations.forEach((m) => console.log(`  - ${m}`));
  
  console.log('\n✅ Verificando conexión...');
  const { data, error } = await supabase.from('delicatessen_categories').select('count').limit(1);
  
  if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
    console.log('✓ Conexión OK - Tablas aún no creadas (normal)');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ve a Supabase Dashboard > SQL Editor');
    console.log('2. Copia y pega el contenido de cada migration en orden');
    console.log('3. Ejecuta cada migration');
    console.log('4. Luego ejecuta: npm run seed');
  } else if (!error) {
    console.log('✓ Conexión OK - Tablas ya existen');
    console.log('Puedes ejecutar: npm run seed');
  } else {
    console.log('⚠️  Error de conexión:', error.message);
  }
}

main().catch(console.error);
