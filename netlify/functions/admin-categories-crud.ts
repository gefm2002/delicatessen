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
    return {
      statusCode: 401,
      headers: getCorsHeaders(),
      body: JSON.stringify({ message: 'No autorizado' }),
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('delicatessen_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al obtener categorías', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ categories: (data || []).map(keysToCamel) }) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_categories')
        .insert(keysToSnake(body))
        .select()
        .single();

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al crear categoría', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ category: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'PUT') {
      const categoryId = event.path.split('/').pop();
      if (!categoryId || categoryId === 'crud') {
        return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de categoría requerido' }) };
      }

      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_categories')
        .update(keysToSnake(body))
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al actualizar categoría', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ category: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'DELETE') {
      const categoryId = event.path.split('/').pop();
      if (!categoryId || categoryId === 'crud') {
        return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de categoría requerido' }) };
      }

      const { error } = await supabase
        .from('delicatessen_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al eliminar categoría', error: error.message }) };
      }

      return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Categoría eliminada' }) };
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
