import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { getCorsHeaders, handleCors } from './_headers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.NETLIFY_JWT_SECRET || 'change-me-in-production';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createJWT(email: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { email, exp: Math.floor(Date.now() / 1000) + 86400 }; // 24h
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token: string): { email: string } | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { email: payload.email };
  } catch {
    return null;
  }
}

export function getAdminFromToken(event: any): { email: string } | null {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyJWT(token);
}

export const handler: Handler = async (event) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Email y contraseña requeridos' }),
      };
    }

    const passwordHash = hashPassword(password);

    const { data: admin, error } = await supabase
      .from('delicatessen_admins')
      .select('id, email, is_active')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      console.error('Error de autenticación:', error);
      return {
        statusCode: 401,
        headers: getCorsHeaders(),
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      };
    }

    const token = createJWT(admin.email);

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({ token, email: admin.email }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
