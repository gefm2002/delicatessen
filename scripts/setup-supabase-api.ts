import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN!;
const ORG_SLUG = process.env.SUPABASE_ORG_SLUG!;
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME || 'delicatessen';
const REGION = process.env.SUPABASE_REGION || 'us-east-1';

interface ProjectResponse {
  id: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  database?: {
    host: string;
  };
  api_keys?: Array<{
    name: string;
    api_key: string;
  }>;
}

async function createProject(): Promise<{ url: string; anonKey: string; serviceRoleKey: string }> {
  console.log('🔧 Creando proyecto en Supabase...\n');

  // Check if project exists
  const listResponse = await fetch(`https://api.supabase.com/v1/projects?organization_id=${ORG_SLUG}`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (listResponse.ok) {
    const projects: ProjectResponse[] = await listResponse.json();
    const existing = projects.find((p) => p.name === PROJECT_NAME);
    
    if (existing) {
      console.log(`✓ Proyecto "${PROJECT_NAME}" ya existe\n`);
      return await getProjectKeys(existing.id);
    }
  }

  // Generate password
  const dbPassword = generatePassword();
  
  // Create project
  console.log('Creando proyecto (esto puede tardar varios minutos)...\n');
  const createResponse = await fetch('https://api.supabase.com/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: PROJECT_NAME,
      organization_id: ORG_SLUG,
      region: REGION,
      kps_enabled: false,
      db_pass: dbPassword,
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Error creando proyecto: ${error.message || createResponse.statusText}`);
  }

  const project: ProjectResponse = await createResponse.json();
  console.log(`✓ Proyecto creado: ${project.id}\n`);

  // Wait for project to be ready
  console.log('Esperando a que el proyecto esté listo...');
  await waitForProject(project.id);

  return await getProjectKeys(project.id);
}

async function waitForProject(projectId: string, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (response.ok) {
      const project: ProjectResponse = await response.json();
      if (project.database?.host) {
        console.log('✓ Proyecto listo\n');
        return;
      }
    }

    await sleep(10000); // Wait 10 seconds
    process.stdout.write('.');
  }
  throw new Error('Timeout esperando proyecto');
}

async function getProjectKeys(projectId: string): Promise<{ url: string; anonKey: string; serviceRoleKey: string }> {
  console.log('Obteniendo API keys...\n');
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error obteniendo API keys');
  }

  const keys: Array<{ name: string; api_key: string }> = await response.json();
  const anonKey = keys.find((k) => k.name === 'anon' || k.name === 'anon key')?.api_key || '';
  const serviceRoleKey = keys.find((k) => k.name === 'service_role' || k.name === 'service_role key')?.api_key || '';

  const url = `https://${projectId}.supabase.co`;

  return { url, anonKey, serviceRoleKey };
}

async function applyMigrations(url: string, serviceRoleKey: string) {
  console.log('📝 Aplicando migrations...\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey);

  const migrations = [
    '001_init.sql',
    '002_storage.sql',
    '010_rpc_insert_order.sql',
  ];

  for (const migration of migrations) {
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and execute statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`Aplicando ${migration}...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
            // Try direct query
            const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sql: statement }),
            });
            
            if (!response.ok && !response.statusText.includes('already exists')) {
              console.warn(`⚠️  Advertencia en ${migration}:`, statement.substring(0, 50));
            }
          }
        } catch (err: any) {
          // Ignore errors for "already exists"
          if (!err.message?.includes('already exists') && !err.message?.includes('duplicate')) {
            console.warn(`⚠️  Advertencia:`, err.message);
          }
        }
      }
    }
    
    console.log(`✓ ${migration}`);
  }
}

async function main() {
  try {
    const project = await createProject();
    
    // Update .env.local
    const envPath = join(process.cwd(), '.env.local');
    let envContent = readFileSync(envPath, 'utf-8');
    
    envContent = envContent.replace(/SUPABASE_URL=.*/, `SUPABASE_URL=${project.url}`);
    envContent = envContent.replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY=${project.anonKey}`);
    envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${project.serviceRoleKey}`);
    envContent = envContent.replace(/VITE_SUPABASE_URL=.*/, `VITE_SUPABASE_URL=${project.url}`);
    envContent = envContent.replace(/VITE_SUPABASE_ANON_KEY=.*/, `VITE_SUPABASE_ANON_KEY=${project.anonKey}`);
    envContent = envContent.replace(/VITE_SUPABASE_SERVICE_ROLE_KEY=.*/, `VITE_SUPABASE_SERVICE_ROLE_KEY=${project.serviceRoleKey}`);
    
    writeFileSync(envPath, envContent);
    
    console.log('\n✅ Variables actualizadas en .env.local\n');
    
    // Apply migrations
    await applyMigrations(project.url, project.serviceRoleKey);
    
    console.log('\n✅ Setup de Supabase completado!');
    console.log(`URL: ${project.url}\n`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 20; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

main();
