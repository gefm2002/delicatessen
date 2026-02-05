import { useState, useEffect } from 'react';
import { apiGet, apiPut, apiPost } from '../../lib/api';
import { getOrdersDev, getOrderDetailDev, updateOrderStatusDev, addOrderNoteDev } from '../../lib/ordersDev';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Badge from '../../components/Badge';
import { buildWhatsAppLink } from '../../lib/whatsapp';

interface Order {
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
  status: string;
  notes?: string;
  whatsappMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderEvent {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface OrderNote {
  id: string;
  note: string;
  createdAt: string;
}

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetail, setOrderDetail] = useState<{
    order: Order;
    events: OrderEvent[];
    notes: OrderNote[];
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        const ordersData = await getOrdersDev({ status: statusFilter || undefined });
        setOrders(ordersData);
      } else {
        const result = await apiGet<{ orders: Order[] }>(
          `/admin-orders-list${statusFilter ? `?status=${statusFilter}` : ''}`
        );
        setOrders(result.orders);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetail(order: Order) {
    setSelectedOrder(order);
    try {
      if (import.meta.env.DEV) {
        const detail = await getOrderDetailDev(order.id);
        setOrderDetail(detail);
      } else {
        const result = await apiGet<{
          order: Order;
          events: OrderEvent[];
          notes: OrderNote[];
        }>(`/admin-orders-get/${order.id}`);
        setOrderDetail(result);
      }
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error('Error loading order detail:', error);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus) return;

    try {
      if (import.meta.env.DEV) {
        await updateOrderStatusDev(selectedOrder.id, newStatus);
      } else {
        await apiPut(`/admin-orders-update/${selectedOrder.id}`, {
          status: newStatus,
        });
      }
      setNewStatus('');
      loadOrders();
      showToast('Estado actualizado correctamente', 'success');
      if (orderDetail) {
        handleViewDetail(selectedOrder);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast('Error al actualizar el estado', 'error');
    }
  }

  async function handleSendNote() {
    if (!selectedOrder || !newNote.trim()) return;

    try {
      let whatsappUrl: string;
      if (import.meta.env.DEV) {
        const result = await addOrderNoteDev(selectedOrder.id, newNote);
        whatsappUrl = result.whatsappUrl;
      } else {
        const result = await apiPost<{ whatsappUrl: string }>(
          `/admin-orders-send-note`,
          {
            orderId: selectedOrder.id,
            note: newNote,
          }
        );
        whatsappUrl = result.whatsappUrl;
      }

      setWhatsappUrl(whatsappUrl);
      setIsWhatsAppModalOpen(true);
      setNewNote('');
      setIsNoteModalOpen(false);
      if (orderDetail) {
        handleViewDetail(selectedOrder);
      }
    } catch (error: any) {
      console.error('Error sending note:', error);
      showToast('Error al enviar la nota', 'error');
    }
  }

  function handleOpenWhatsApp() {
    window.open(whatsappUrl, '_blank');
    setIsWhatsAppModalOpen(false);
    setWhatsappUrl('');
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
      new: 'primary',
      contacted: 'warning',
      confirmed: 'warning',
      preparing: 'warning',
      shipped: 'success',
      completed: 'success',
      canceled: 'error',
    };
    return variants[status] || 'primary';
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      new: 'Nueva',
      contacted: 'Contactada',
      confirmed: 'Confirmada',
      preparing: 'Preparando',
      shipped: 'Enviada',
      completed: 'Completada',
      canceled: 'Cancelada',
    };
    return labels[status] || status;
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Órdenes</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Todas' },
            { value: 'new', label: 'Nuevas' },
            { value: 'contacted', label: 'Contactadas' },
            { value: 'confirmed', label: 'Confirmadas' },
            { value: 'preparing', label: 'Preparando' },
            { value: 'shipped', label: 'Enviadas' },
            { value: 'completed', label: 'Completadas' },
            { value: 'canceled', label: 'Canceladas' },
          ]}
        />
      </div>

      <div className="bg-bg rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-alt">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-bg-alt">
                <td className="px-4 py-3 font-medium text-text">#{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-text">
                      {order.customerFirstName} {order.customerLastName}
                    </div>
                    <div className="text-sm text-text-muted">{order.customerEmail}</div>
                    <div className="text-sm text-text-muted">{order.customerPhone}</div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-text">
                  ${order.total.toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusBadge(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {new Date(order.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(order)}
                  >
                    Ver Detalle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
          setOrderDetail(null);
        }}
        title={`Orden #${selectedOrder?.orderNumber}`}
      >
        {orderDetail && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Cliente</h3>
              <p>
                {orderDetail.order.customerFirstName} {orderDetail.order.customerLastName}
              </p>
              <p className="text-sm text-text-muted">{orderDetail.order.customerEmail}</p>
              <p className="text-sm text-text-muted">{orderDetail.order.customerPhone}</p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Items</h3>
              <div className="space-y-2">
                {orderDetail.order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.name}
                      {item.quantity && ` x${item.quantity}`}
                      {item.weight && ` (${item.weight}kg)`}
                    </span>
                    <span className="font-medium">${item.price.toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${orderDetail.order.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Entrega</h3>
              <p>
                {orderDetail.order.deliveryType === 'pickup' ? 'Retiro en sucursal' : 'Envío a domicilio'}
              </p>
              {orderDetail.order.deliveryAddress && (
                <p className="text-sm text-text-muted">{orderDetail.order.deliveryAddress}</p>
              )}
            </div>

            <div>
              <h3 className="font-bold mb-2">Cambiar Estado</h3>
              <div className="flex gap-2">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: '', label: 'Seleccionar...' },
                    { value: 'new', label: 'Nueva' },
                    { value: 'contacted', label: 'Contactada' },
                    { value: 'confirmed', label: 'Confirmada' },
                    { value: 'preparing', label: 'Preparando' },
                    { value: 'shipped', label: 'Enviada' },
                    { value: 'completed', label: 'Completada' },
                    { value: 'canceled', label: 'Cancelada' },
                  ]}
                />
                <Button onClick={handleUpdateStatus} disabled={!newStatus}>
                  Actualizar
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Eventos</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {orderDetail.events.map((event) => (
                  <div key={event.id} className="text-sm">
                    <Badge variant={getStatusBadge(event.status)} className="mr-2">
                      {getStatusLabel(event.status)}
                    </Badge>
                    <span className="text-text-muted">
                      {new Date(event.createdAt).toLocaleString('es-AR')}
                    </span>
                    {event.notes && (
                      <p className="text-text-muted mt-1">{event.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Notas Internas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                {orderDetail.notes.map((note) => (
                  <div key={note.id} className="text-sm bg-bg-alt p-2 rounded">
                    <p className="text-text-muted">{note.note}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(note.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
              >
                + Agregar Nota
              </Button>
            </div>

            {orderDetail.order.whatsappMessage && (
              <div>
                <Button
                  onClick={() => {
                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
                    const url = buildWhatsAppLink(
                      whatsappNumber,
                      orderDetail.order.whatsappMessage || ''
                    );
                    window.open(url, '_blank');
                  }}
                  className="w-full"
                >
                  Abrir WhatsApp
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Nota */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNewNote('');
        }}
        title="Agregar Nota"
      >
        <div className="space-y-4">
          <Input
            label="Nota"
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button onClick={handleSendNote} className="flex-1" disabled={!newNote.trim()}>
              Enviar por WhatsApp
            </Button>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setWhatsappUrl('');
        }}
        onConfirm={handleOpenWhatsApp}
        title="Abrir WhatsApp"
        message="¿Abrir WhatsApp para enviar la nota al cliente?"
        confirmText="Abrir WhatsApp"
        cancelText="Cancelar"
      />
    </div>
  );
}
