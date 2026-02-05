import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { keysToSnake } from '../../src/lib/mappers';
import { buildWhatsAppMessage, buildWhatsAppLink, type OrderData } from '../../src/lib/whatsapp';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      paymentMethod,
      deliveryType,
      deliveryAddress,
      deliveryZone,
      branchId,
      items,
      notes,
    } = body;

    // Validation
    if (!customerFirstName || !customerLastName || !customerEmail || !customerPhone) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Datos del cliente incompletos' }) };
    }

    if (!paymentMethod || !deliveryType) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Método de pago y tipo de entrega requeridos' }) };
    }

    if (!items || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'El carrito está vacío' }) };
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
    const total = subtotal;

    // Get branch name if provided
    let branchName: string | undefined;
    if (branchId) {
      const { data: branch } = await supabase
        .from('delicatessen_branches')
        .select('name')
        .eq('id', branchId)
        .single();
      branchName = branch?.name;
    }

    // Get next order number from sequence
    const { data: lastOrder } = await supabase
      .from('delicatessen_orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single();
    
    const orderNumber = lastOrder?.order_number ? lastOrder.order_number + 1 : 1000;

    // Build WhatsApp message
    const orderData: OrderData = {
      orderNumber,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      paymentMethod,
      deliveryType,
      deliveryAddress,
      deliveryZone,
      branchName,
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        price: item.price,
        productType: item.productType,
      })),
      subtotal,
      total,
      notes,
    };

    const whatsappMessage = buildWhatsAppMessage(orderData);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('delicatessen_orders')
      .insert(keysToSnake({
        orderNumber,
        customerFirstName,
        customerLastName,
        customerEmail,
        customerPhone,
        paymentMethod,
        deliveryType,
        deliveryAddress,
        deliveryZone,
        branchId,
        items,
        subtotal,
        total,
        whatsappMessage,
        notes,
        status: 'new',
      }))
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { statusCode: 500, body: JSON.stringify({ message: 'Error al crear la orden', error: orderError.message }) };
    }

    // Create initial event
    await supabase
      .from('delicatessen_order_events')
      .insert({
        order_id: order.id,
        status: 'new',
        notes: 'Orden creada',
      });

    // Get WhatsApp number from config
    const { data: config } = await supabase
      .from('delicatessen_site_config')
      .select('whatsapp_number')
      .single();

    const whatsappNumber = config?.whatsapp_number || '';
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappMessage);

    return {
      statusCode: 200,
      body: JSON.stringify({
        orderNumber,
        whatsappMessage,
        whatsappUrl,
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
