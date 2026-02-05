import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_PREFIX = 'delicatessen';
const REGION = process.env.SUPABASE_REGION || 'us-east-1';

interface EnvVars {
  SUPABASE_ACCESS_TOKEN?: string;
  SUPABASE_ORG_SLUG?: string;
  SUPABASE_PROJECT_NAME?: string;
  SUPABASE_REGION?: string;
  SUPABASE_DB_PASSWORD?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function loadEnv(): EnvVars {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const vars: EnvVars = {};
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        vars[match[1].trim() as keyof EnvVars] = match[2].trim();
      }
    });
    return vars;
  }
  return {};
}

function saveEnv(vars: EnvVars) {
  const envPath = join(process.cwd(), '.env.local');
  const lines = Object.entries(vars)
    .map(([key, value]) => `${key}=${value || ''}`)
    .join('\n');
  writeFileSync(envPath, lines);
}

function checkSupabaseCLI(): boolean {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function installSupabaseCLI() {
  console.log('Instalando Supabase CLI...');
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' });
  } catch {
    console.error('Error instalando Supabase CLI. Instalá manualmente: npm install -g supabase');
    process.exit(1);
  }
}

async function loginSupabase(accessToken: string) {
  console.log('Iniciando sesión en Supabase...');
  try {
    execSync(`supabase login --token ${accessToken}`, { stdio: 'inherit' });
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error.message);
    process.exit(1);
  }
}

async function createOrGetProject(orgSlug: string, projectName: string): Promise<{ url: string; anonKey: string; serviceRoleKey: string }> {
  console.log(`Creando/obteniendo proyecto ${projectName}...`);
  
  const env = loadEnv();
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Proyecto ya configurado en .env.local');
    return {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  try {
    // Check if project exists
    const listOutput = execSync(`supabase projects list --org ${orgSlug}`, { encoding: 'utf-8' });
    const projectMatch = listOutput.match(new RegExp(projectName, 'i'));
    
    if (projectMatch) {
      console.log('Proyecto existente encontrado, obteniendo detalles...');
      // Get project details
      const detailsOutput = execSync(`supabase projects list --org ${orgSlug}`, { encoding: 'utf-8' });
      // Parse output to get project ref
      // This is simplified - you might need to adjust based on actual CLI output
    }

    // Create new project
    const dbPassword = process.env.SUPABASE_DB_PASSWORD || generatePassword();
    const createCmd = `supabase projects create ${projectName} --org ${orgSlug} --region ${REGION} --db-password ${dbPassword}`;
    console.log('Creando proyecto (esto puede tardar varios minutos)...');
    execSync(createCmd, { stdio: 'inherit' });

    // Wait for project to be ready
    console.log('Esperando a que el proyecto esté listo...');
    await waitForProject(projectName, orgSlug);

    // Get project API keys
    const keysOutput = execSync(`supabase projects api-keys --project-ref ${projectName}`, { encoding: 'utf-8' });
    // Parse keys from output (simplified)
    const anonKey = extractKey(keysOutput, 'anon');
    const serviceRoleKey = extractKey(keysOutput, 'service_role');

    const url = `https://${projectName}.supabase.co`;

    return { url, anonKey, serviceRoleKey };
  } catch (error: any) {
    console.error('Error creando proyecto:', error.message);
    console.log('Modo A: Usando variables de entorno existentes');
    const env = loadEnv();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('Variables de Supabase no encontradas. Configurá SUPABASE_URL y SUPABASE_ANON_KEY en .env.local');
    }
    return {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    };
  }
}

function extractKey(output: string, type: string): string {
  // Simplified - adjust based on actual CLI output format
  const match = output.match(new RegExp(`${type}[^:]*:([^\\n]+)`, 'i'));
  return match ? match[1].trim() : '';
}

async function waitForProject(projectName: string, orgSlug: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const status = execSync(`supabase projects list --org ${orgSlug}`, { encoding: 'utf-8' });
      if (status.includes('ACTIVE_HEALTHY')) {
        return;
      }
      await sleep(10000 * (i + 1)); // Progressive backoff
    } catch {
      await sleep(5000);
    }
  }
  throw new Error('Timeout esperando proyecto');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generatePassword(): string {
  return Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
}

async function applyMigrations(url: string, serviceRoleKey: string) {
  console.log('Aplicando migrations...');
  const migrationsPath = join(process.cwd(), 'supabase', 'migrations');
  
  // This would require Supabase client to execute SQL
  // For now, we'll just log that migrations need to be applied manually
  console.log('Migrations deben aplicarse manualmente usando Supabase Dashboard o CLI');
}

async function main() {
  console.log('🚀 Provisionando Supabase...\n');

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const orgSlug = process.env.SUPABASE_ORG_SLUG;
  const projectName = process.env.SUPABASE_PROJECT_NAME || PROJECT_PREFIX;

  if (!checkSupabaseCLI()) {
    installSupabaseCLI();
  }

  // Modo A: Proyecto existente
  const env = loadEnv();
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    console.log('Modo A: Usando proyecto existente');
    console.log(`URL: ${env.SUPABASE_URL}`);
    return;
  }

  // Modo B: Crear proyecto
  if (!accessToken || !orgSlug) {
    console.error('Modo B requiere SUPABASE_ACCESS_TOKEN y SUPABASE_ORG_SLUG');
    console.log('Usando Modo A: Configurá SUPABASE_URL y SUPABASE_ANON_KEY en .env.local');
    return;
  }

  await loginSupabase(accessToken);
  const project = await createOrGetProject(orgSlug, projectName);

  // Save to .env.local
  const newEnv = {
    ...env,
    SUPABASE_URL: project.url,
    SUPABASE_ANON_KEY: project.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: project.serviceRoleKey,
  };
  saveEnv(newEnv);

  // Create .env.example
  const exampleEnv = {
    SUPABASE_ACCESS_TOKEN: '',
    SUPABASE_ORG_SLUG: '',
    SUPABASE_PROJECT_NAME: PROJECT_PREFIX,
    SUPABASE_REGION: REGION,
    SUPABASE_DB_PASSWORD: '',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    GITHUB_TOKEN: '',
    NETLIFY_JWT_SECRET: '',
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
    VITE_SUPABASE_SERVICE_ROLE_KEY: '',
    VITE_WHATSAPP_NUMBER: '',
  };

  const examplePath = join(process.cwd(), '.env.example');
  const exampleLines = Object.entries(exampleEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  writeFileSync(examplePath, exampleLines);

  console.log('\n✅ Provisionamiento completado!');
  console.log(`URL: ${project.url}`);
  console.log('\n⚠️  IMPORTANTE: Revocá y rotá los tokens compartidos en el chat.');
  console.log('Aplicá las migrations manualmente desde supabase/migrations/');
}

main().catch(console.error);
