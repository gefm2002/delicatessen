import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';
import { keysToCamel, keysToSnake } from '../../src/lib/mappers';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('delicatessen_branches')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al obtener sucursales', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ branches: (data || []).map(keysToCamel) }) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_branches')
        .insert(keysToSnake(body))
        .select()
        .single();

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al crear sucursal', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ branch: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'PUT') {
      const branchId = event.path.split('/').pop();
      if (!branchId || branchId === 'crud') {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID de sucursal requerido' }) };
      }

      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_branches')
        .update(keysToSnake(body))
        .eq('id', branchId)
        .select()
        .single();

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al actualizar sucursal', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ branch: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'DELETE') {
      const branchId = event.path.split('/').pop();
      if (!branchId || branchId === 'crud') {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID de sucursal requerido' }) };
      }

      const { error } = await supabase
        .from('delicatessen_branches')
        .delete()
        .eq('id', branchId);

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al eliminar sucursal', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ message: 'Sucursal eliminada' }) };
    }

    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
