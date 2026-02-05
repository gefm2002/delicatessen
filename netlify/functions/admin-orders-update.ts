import { Handler } from '@netlify/functions';
import { getCorsHeaders, handleCors } from './_headers';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';
import { keysToSnake, keysToCamel } from '../../src/lib/mappers';
import { buildWhatsAppMessage, type OrderData } from '../../src/lib/whatsapp';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, headers: getCorsHeaders(), body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    const orderId = event.path.split('/').pop();
    const body = JSON.parse(event.body || '{}');

    if (!orderId) {
      return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ message: 'ID de orden requerido' }) };
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('delicatessen_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      return { statusCode: 404, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Orden no encontrada' }) };
    }

    const order = keysToCamel(currentOrder);
    const oldStatus = order.status;
    const newStatus = body.status || order.status;

    // Calculate new totals if items changed
    let subtotal = order.subtotal;
    let total = order.total;
    let items = order.items;

    if (body.items) {
      items = body.items;
      subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
      total = subtotal;
    }

    // Get branch name
    let branchName: string | undefined;
    if (order.branchId) {
      const { data: branch } = await supabase
        .from('delicatessen_branches')
        .select('name')
        .eq('id', order.branchId)
        .single();
      branchName = branch?.name;
    }

    // Rebuild WhatsApp message
    const orderData: OrderData = {
      orderNumber: order.orderNumber,
      customerFirstName: body.customerFirstName || order.customerFirstName,
      customerLastName: body.customerLastName || order.customerLastName,
      customerEmail: body.customerEmail || order.customerEmail,
      customerPhone: body.customerPhone || order.customerPhone,
      paymentMethod: body.paymentMethod || order.paymentMethod,
      deliveryType: body.deliveryType || order.deliveryType,
      deliveryAddress: body.deliveryAddress || order.deliveryAddress,
      deliveryZone: body.deliveryZone || order.deliveryZone,
      branchName,
      items,
      subtotal,
      total,
      notes: body.notes || order.notes,
    };

    const whatsappMessage = buildWhatsAppMessage(orderData);

    // Update order
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.items) {
      updateData.items = items;
      updateData.subtotal = subtotal;
      updateData.total = total;
    }
    if (body.customerFirstName) updateData.customer_first_name = body.customerFirstName;
    if (body.customerLastName) updateData.customer_last_name = body.customerLastName;
    if (body.customerEmail) updateData.customer_email = body.customerEmail;
    if (body.customerPhone) updateData.customer_phone = body.customerPhone;
    if (body.paymentMethod) updateData.payment_method = body.paymentMethod;
    if (body.deliveryType) updateData.delivery_type = body.deliveryType;
    if (body.deliveryAddress !== undefined) updateData.delivery_address = body.deliveryAddress;
    if (body.deliveryZone) updateData.delivery_zone = body.deliveryZone;
    if (body.branchId) updateData.branch_id = body.branchId;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.whatsapp_message = whatsappMessage;

    const { data: updatedOrder, error: updateError } = await supabase
      .from('delicatessen_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Error al actualizar la orden', error: updateError.message }) };
    }

    // Create event if status changed
    if (oldStatus !== newStatus) {
      await supabase
        .from('delicatessen_order_events')
        .insert({
          order_id: orderId,
          status: newStatus,
          notes: body.eventNotes || `Estado cambiado de ${oldStatus} a ${newStatus}`,
        });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ order: keysToCamel(updatedOrder) }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
