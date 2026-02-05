import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function executeSQL(sql: string) {
  // Use Supabase REST API to execute SQL
  // We'll use the management API endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceRoleKey,
      'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  return response;
}

async function applyMigration(filename: string) {
  console.log(`\n📝 Aplicando ${filename}...`);
  
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename);
  let sql = readFileSync(migrationPath, 'utf-8');
  
  // Remove comments
  sql = sql.replace(/--.*$/gm, '');
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Split by semicolons but keep CREATE TYPE and similar together
  const statements: string[] = [];
  let currentStatement = '';
  let inCreateType = false;
  
  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.toUpperCase().includes('CREATE TYPE')) {
      inCreateType = true;
      currentStatement += line + '\n';
      continue;
    }
    
    if (inCreateType && trimmed.includes(';')) {
      currentStatement += line;
      statements.push(currentStatement.trim());
      currentStatement = '';
      inCreateType = false;
      continue;
    }
    
    if (trimmed.endsWith(';') && !inCreateType) {
      currentStatement += line;
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    } else {
      currentStatement += line + '\n';
    }
  }
  
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  let applied = 0;
  let skipped = 0;

  for (const statement of statements) {
    if (!statement || statement.length < 10) continue;
    
    try {
      // Use pg_rest API or direct SQL execution
      // For Supabase, we need to use the management API
      const response = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: statement }),
      });

      const text = await response.text();
      
      if (response.ok || text.includes('already exists') || text.includes('duplicate')) {
        applied++;
      } else {
        console.warn(`⚠️  ${statement.substring(0, 50)}...`);
        skipped++;
      }
    } catch (err: any) {
      // Try alternative: use Supabase Dashboard SQL Editor URL
      console.warn(`⚠️  No se pudo ejecutar automáticamente. Aplicá manualmente desde Dashboard.`);
      skipped++;
    }
  }
  
  console.log(`  ${applied} statements aplicados, ${skipped} requieren aplicación manual`);
}

async function main() {
  console.log('🚀 Aplicando migrations directamente...\n');
  
  // Read and apply each migration
  const migrations = [
    '001_init.sql',
    '002_storage.sql', 
    '010_rpc_insert_order.sql',
  ];

  for (const migration of migrations) {
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log(`\n📄 ${migration}:`);
    console.log('⚠️  Ejecutando via API de Supabase...');
    
    // Use Supabase Management API
    try {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (!projectRef) {
        throw new Error('No se pudo extraer project ref');
      }

      // Use the SQL execution endpoint
      const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        console.log(`✓ ${migration} aplicada`);
      } else {
        const error = await response.text();
        console.log(`⚠️  ${migration}: ${error.substring(0, 100)}`);
        console.log('   Aplicá manualmente desde Supabase Dashboard > SQL Editor');
      }
    } catch (err: any) {
      console.log(`⚠️  ${migration}: ${err.message}`);
      console.log('   Aplicá manualmente desde Supabase Dashboard > SQL Editor');
    }
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n📋 Si hubo errores, aplicá las migrations manualmente:');
  console.log('   1. Ve a https://app.supabase.com');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Ve a SQL Editor');
  console.log('   4. Copia y pega cada migration en orden');
}

main().catch(console.error);
