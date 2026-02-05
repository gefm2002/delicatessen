import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';
import { buildWhatsAppLink } from '../../src/lib/whatsapp';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    const { orderId, note } = JSON.parse(event.body || '{}');

    if (!orderId || !note) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID de orden y nota requeridos' }) };
    }

    // Insert note
    const { error: noteError } = await supabase
      .from('delicatessen_order_notes')
      .insert({
        order_id: orderId,
        note,
      });

    if (noteError) {
      console.error('Error inserting note:', noteError);
      return { statusCode: 500, body: JSON.stringify({ message: 'Error al guardar la nota', error: noteError.message }) };
    }

    // Get order to build WhatsApp message
    const { data: order, error: orderError } = await supabase
      .from('delicatessen_orders')
      .select('customer_first_name, customer_phone')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Orden no encontrada' }) };
    }

    // Get WhatsApp number from config
    const { data: config } = await supabase
      .from('delicatessen_site_config')
      .select('whatsapp_number')
      .single();

    const whatsappNumber = config?.whatsapp_number || '';
    const message = `Hola ${order.customer_first_name}! ${note}`;
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, message);

    return {
      statusCode: 200,
      body: JSON.stringify({ whatsappUrl }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
