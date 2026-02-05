import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase service role key (only available in DEV)');
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Hash password using SHA-256 (same as seed.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function createJWT(email: string): string {
  const jwtSecret = import.meta.env.VITE_NETLIFY_JWT_SECRET || 'dev-secret-change-in-production';
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { email, exp: Math.floor(Date.now() / 1000) + 86400 }; // 24h
  
  // Use btoa for base64 encoding in browser
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  // Simple HMAC simulation (for dev only)
  // In production, use proper crypto
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${jwtSecret}`)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    .substring(0, 43);
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function adminLoginDev(email: string, password: string): Promise<{ token: string; email: string }> {
  const passwordHash = await hashPassword(password);

  const { data: admin, error } = await supabaseServer
    .from('delicatessen_admins')
    .select('id, email, is_active')
    .eq('email', email)
    .eq('password_hash', passwordHash)
    .eq('is_active', true)
    .single();

  if (error || !admin) {
    throw new Error('Credenciales inválidas');
  }

  const token = createJWT(admin.email);

  return { token, email: admin.email };
}
