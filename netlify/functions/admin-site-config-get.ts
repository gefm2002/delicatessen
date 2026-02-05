import { Handler } from '@netlify/functions';
import { getCorsHeaders, handleCors } from './_headers';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';
import { keysToCamel } from '../../src/lib/mappers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, headers: getCorsHeaders(), body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    const { data, error } = await supabase
      .from('delicatessen_site_config')
      .select('*')
      .single();

    if (error) {
      return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al obtener configuración', error: error.message }) };
    }

    return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ config: keysToCamel(data) }) };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
