export interface OrderItem {
  name: string;
  quantity?: number;
  weight?: number;
  price: number;
  productType: 'standard' | 'weighted' | 'combo';
}

export interface OrderData {
  orderNumber: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryZone?: string;
  branchName?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  notes?: string;
}

export function buildWhatsAppMessage(order: OrderData): string {
  const lines: string[] = [];

  lines.push(`*Pedido #${order.orderNumber}*`);
  lines.push('');
  lines.push('*Cliente:*');
  lines.push(`${order.customerFirstName} ${order.customerLastName}`);
  lines.push(`📧 ${order.customerEmail}`);
  lines.push(`📱 ${order.customerPhone}`);
  lines.push('');

  lines.push('*Items:*');
  order.items.forEach((item) => {
    if (item.productType === 'weighted') {
      lines.push(`• ${item.name} - ${item.weight}kg - $${item.price.toLocaleString('es-AR')}`);
    } else if (item.productType === 'combo') {
      lines.push(`• ${item.name} - $${item.price.toLocaleString('es-AR')}`);
    } else {
      lines.push(`• ${item.name} x${item.quantity} - $${item.price.toLocaleString('es-AR')}`);
    }
  });
  lines.push('');

  lines.push('*Totales:*');
  lines.push(`Subtotal: $${order.subtotal.toLocaleString('es-AR')}`);
  lines.push(`Total: $${order.total.toLocaleString('es-AR')}`);
  lines.push('');

  lines.push('*Pago:*');
  const paymentMethods: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    mercadopago: 'Mercado Pago',
    cards: 'Tarjetas',
    wallets_qr: 'Billeteras/QR',
  };
  lines.push(paymentMethods[order.paymentMethod] || order.paymentMethod);
  lines.push('');

  lines.push('*Entrega:*');
  if (order.deliveryType === 'pickup') {
    lines.push(`Retiro en sucursal: ${order.branchName || 'No especificada'}`);
  } else {
    lines.push('Envío a domicilio');
    if (order.deliveryAddress) {
      lines.push(`Dirección: ${order.deliveryAddress}`);
    }
    if (order.deliveryZone) {
      lines.push(`Zona: ${order.deliveryZone}`);
    }
    if (order.branchName) {
      lines.push(`Sucursal de referencia: ${order.branchName}`);
    }
  }
  lines.push('');

  if (order.notes) {
    lines.push('*Notas:*');
    lines.push(order.notes);
    lines.push('');
  }

  lines.push('Gracias por tu pedido! 🛒');

  return lines.join('\n');
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
}
