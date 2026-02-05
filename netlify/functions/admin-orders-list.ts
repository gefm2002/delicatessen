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
    const params = new URLSearchParams(event.queryStringParameters || '');
    const status = params.get('status');
    const limit = parseInt(params.get('limit') || '50');
    const offset = parseInt(params.get('offset') || '0');

    let query = supabase
      .from('delicatessen_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error:', error);
      return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al obtener órdenes', error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ orders: (data || []).map(keysToCamel) }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
