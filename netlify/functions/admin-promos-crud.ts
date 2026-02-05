import { Handler } from '@netlify/functions';
import { getCorsHeaders, handleCors } from './_headers';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';
import { keysToCamel, keysToSnake } from '../../src/lib/mappers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;
  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, headers: getCorsHeaders(), body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('delicatessen_promos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al obtener promos', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ promos: (data || []).map(keysToCamel) }) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_promos')
        .insert(keysToSnake(body))
        .select()
        .single();

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al crear promo', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ promo: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'PUT') {
      const promoId = event.path.split('/').pop();
      if (!promoId || promoId === 'crud') {
        return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de promo requerido' }) };
      }

      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_promos')
        .update(keysToSnake(body))
        .eq('id', promoId)
        .select()
        .single();

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al actualizar promo', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ promo: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'DELETE') {
      const promoId = event.path.split('/').pop();
      if (!promoId || promoId === 'crud') {
        return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de promo requerido' }) };
      }

      const { error } = await supabase
        .from('delicatessen_promos')
        .delete()
        .eq('id', promoId);

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al eliminar promo', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Promo eliminada' }) };
    }

    return { statusCode: 405, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Method not allowed' }) };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
