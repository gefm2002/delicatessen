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
      const productId = event.path.split('/').pop();
      
      if (productId && productId !== 'crud') {
        // Get single product
        const { data, error } = await supabase
          .from('delicatessen_products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error || !data) {
          return { statusCode: 404, body: JSON.stringify({ message: 'Producto no encontrado' }) };
        }

        return { statusCode: 200, body: JSON.stringify({ product: keysToCamel(data) }) };
      } else {
        // List products
        const { data, error } = await supabase
          .from('delicatessen_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return { statusCode: 500, body: JSON.stringify({ message: 'Error al obtener productos', error: error.message }) };
        }

        return { statusCode: 200, body: JSON.stringify({ products: (data || []).map(keysToCamel) }) };
      }
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_products')
        .insert(keysToSnake(body))
        .select()
        .single();

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al crear producto', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ product: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'PUT') {
      const productId = event.path.split('/').pop();
      if (!productId || productId === 'crud') {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID de producto requerido' }) };
      }

      const body = JSON.parse(event.body || '{}');
      const { data, error } = await supabase
        .from('delicatessen_products')
        .update(keysToSnake(body))
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al actualizar producto', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ product: keysToCamel(data) }) };
    }

    if (event.httpMethod === 'DELETE') {
      const productId = event.path.split('/').pop();
      if (!productId || productId === 'crud') {
        return { statusCode: 400, body: JSON.stringify({ message: 'ID de producto requerido' }) };
      }

      const { error } = await supabase
        .from('delicatessen_products')
        .delete()
        .eq('id', productId);

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error al eliminar producto', error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ message: 'Producto eliminado' }) };
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
