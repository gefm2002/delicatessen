import { supabaseServer } from './supabaseServerDev';
import { keysToCamel, keysToSnake } from './mappers';
import { buildWhatsAppMessage, buildWhatsAppLink, type OrderData } from './whatsapp';

export interface CreateOrderInput {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryZone?: string;
  branchId?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity?: number;
    weight?: number;
    price: number;
    productType: 'standard' | 'weighted' | 'combo';
  }>;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryZone?: string;
  branchId?: string;
  items: any[];
  subtotal: number;
  total: number;
  whatsappMessage: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createOrderDev(input: CreateOrderInput): Promise<{ orderNumber: number; whatsappMessage: string; whatsappUrl: string }> {
  // Calculate totals
  const subtotal = input.items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal; // No discounts for now

  // Get branch name if branchId provided
  let branchName: string | undefined;
  if (input.branchId) {
    const { data: branch } = await supabaseServer
      .from('delicatessen_branches')
      .select('name')
      .eq('id', input.branchId)
      .single();
    branchName = branch?.name;
  }

  // Build WhatsApp message
  const orderData: OrderData = {
    orderNumber: 0, // Will be set after insert
    customerFirstName: input.customerFirstName,
    customerLastName: input.customerLastName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    paymentMethod: input.paymentMethod,
    deliveryType: input.deliveryType,
    deliveryAddress: input.deliveryAddress,
    deliveryZone: input.deliveryZone,
    branchName,
    items: input.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      price: item.price,
      productType: item.productType,
    })),
    subtotal,
    total,
    notes: input.notes,
  };

  // Try direct insert first
  try {
    // Get next order number from sequence
    const { data: seqData } = await supabaseServer
      .from('delicatessen_orders')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single();
    
    const orderNumber = seqData?.order_number ? seqData.order_number + 1 : 1000;

    orderData.orderNumber = orderNumber;
    const whatsappMessage = buildWhatsAppMessage(orderData);

    const { data: order, error } = await supabaseServer
      .from('delicatessen_orders')
      .insert(keysToSnake({
        orderNumber,
        customerFirstName: input.customerFirstName,
        customerLastName: input.customerLastName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        paymentMethod: input.paymentMethod,
        deliveryType: input.deliveryType,
        deliveryAddress: input.deliveryAddress,
        deliveryZone: input.deliveryZone,
        branchId: input.branchId,
        items: input.items,
        subtotal,
        total,
        whatsappMessage,
        notes: input.notes,
        status: 'new',
      }))
      .select()
      .single();

    if (error) throw error;

    // Create initial event
    await supabaseServer
      .from('delicatessen_order_events')
      .insert({
        order_id: order.id,
        status: 'new',
        notes: 'Orden creada',
      });

    // Get WhatsApp number from config
    const { data: config } = await supabaseServer
      .from('delicatessen_site_config')
      .select('whatsapp_number')
      .single();

    const whatsappNumber = config?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappMessage);

    return { orderNumber, whatsappMessage, whatsappUrl };
  } catch (error) {
    // Fallback to RPC
    const whatsappMessage = buildWhatsAppMessage({ ...orderData, orderNumber: 1000 });
    
    const { data: rpcResult, error: rpcError } = await supabaseServer.rpc('delicatessen_insert_order', {
      p_customer_first_name: input.customerFirstName,
      p_customer_last_name: input.customerLastName,
      p_customer_email: input.customerEmail,
      p_customer_phone: input.customerPhone,
      p_payment_method: input.paymentMethod,
      p_delivery_type: input.deliveryType,
      p_delivery_address: input.deliveryAddress || null,
      p_delivery_zone: input.deliveryZone || null,
      p_branch_id: input.branchId || null,
      p_items: input.items,
      p_subtotal: subtotal,
      p_total: total,
      p_whatsapp_message: whatsappMessage,
      p_notes: input.notes || null,
    });

    if (rpcError || !rpcResult || rpcResult.length === 0) {
      throw new Error(rpcError?.message || 'Error al crear la orden');
    }

    const order = keysToCamel(rpcResult[0]);
    const finalWhatsappMessage = buildWhatsAppMessage({ ...orderData, orderNumber: order.orderNumber });

    const { data: config } = await supabaseServer
      .from('delicatessen_site_config')
      .select('whatsapp_number')
      .single();

    const whatsappNumber = config?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, finalWhatsappMessage);

    return { orderNumber: order.orderNumber, whatsappMessage: finalWhatsappMessage, whatsappUrl };
  }
}

export async function getOrdersDev(filters?: { status?: string; limit?: number; offset?: number }): Promise<Order[]> {
  let query = supabaseServer
    .from('delicatessen_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(keysToCamel);
}

export async function getOrderDetailDev(orderId: string): Promise<{
  order: Order;
  events: Array<{ id: string; status: string; notes?: string; createdAt: string }>;
  notes: Array<{ id: string; note: string; createdAt: string }>;
}> {
  const { data: order, error: orderError } = await supabaseServer
    .from('delicatessen_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  const { data: events, error: eventsError } = await supabaseServer
    .from('delicatessen_order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (eventsError) throw eventsError;

  const { data: notes, error: notesError } = await supabaseServer
    .from('delicatessen_order_notes')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (notesError) throw notesError;

  return {
    order: keysToCamel(order),
    events: (events || []).map(keysToCamel),
    notes: (notes || []).map(keysToCamel),
  };
}

export async function updateOrderStatusDev(orderId: string, status: string, notes?: string): Promise<void> {
  const { error: updateError } = await supabaseServer
    .from('delicatessen_orders')
    .update({ status })
    .eq('id', orderId);

  if (updateError) throw updateError;

  if (notes) {
    await supabaseServer
      .from('delicatessen_order_events')
      .insert({
        order_id: orderId,
        status,
        notes,
      });
  }
}

export async function addOrderNoteDev(orderId: string, note: string): Promise<{ whatsappUrl: string }> {
  const { error } = await supabaseServer
    .from('delicatessen_order_notes')
    .insert({
      order_id: orderId,
      note,
    });

  if (error) throw error;

  // Get order to build WhatsApp message
  const { data: order } = await supabaseServer
    .from('delicatessen_orders')
    .select('*, delicatessen_branches(name)')
    .eq('id', orderId)
    .single();

  if (!order) throw new Error('Orden no encontrada');

  const { data: config } = await supabaseServer
    .from('delicatessen_site_config')
    .select('whatsapp_number')
    .single();

  const whatsappNumber = config?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const message = `Hola ${order.customer_first_name}! ${note}`;
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, message);

  return { whatsappUrl };
}
