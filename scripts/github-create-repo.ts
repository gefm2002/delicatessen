import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = 'delicatessen';

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN no configurado');
  process.exit(1);
}

async function main() {
  console.log('🔧 Creando repositorio en GitHub...\n');

  try {
    // Check if git is initialized
    if (!existsSync(join(process.cwd(), '.git'))) {
      console.log('Inicializando git...');
      execSync('git init', { stdio: 'inherit' });
    }

    // Create repo via GitHub API
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: REPO_NAME,
        private: false,
        auto_init: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.message?.includes('already exists')) {
        console.log('Repositorio ya existe, continuando...');
      } else {
        throw new Error(`Error creando repo: ${error.message}`);
      }
    } else {
      console.log('✓ Repositorio creado');
    }

    // Add remote
    try {
      execSync(`git remote add origin https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME || 'user'}/${REPO_NAME}.git`, { stdio: 'ignore' });
    } catch {
      execSync(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME || 'user'}/${REPO_NAME}.git`, { stdio: 'ignore' });
    }

    // Stage and commit
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });

    // Push
    execSync('git push -u origin main', { stdio: 'inherit' });

    console.log('\n✅ Repositorio creado y código subido!');
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
