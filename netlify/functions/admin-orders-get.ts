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
    const orderId = event.path.split('/').pop();

    if (!orderId) {
      return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de orden requerido' }) };
    }

    const { data: order, error: orderError } = await supabase
      .from('delicatessen_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { statusCode: 404, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Orden no encontrada' }) };
    }

    const { data: events, error: eventsError } = await supabase
      .from('delicatessen_order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    const { data: notes, error: notesError } = await supabase
      .from('delicatessen_order_notes')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (notesError) {
      console.error('Error fetching notes:', notesError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        order: keysToCamel(order),
        events: (events || []).map(keysToCamel),
        notes: (notes || []).map(keysToCamel),
      }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
