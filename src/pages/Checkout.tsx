import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { apiPost } from '../lib/api';
import { createOrderDev } from '../lib/ordersDev';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { supabase } from '../lib/supabasePublic';
import { keysToCamel } from '../lib/mappers';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: '',
    deliveryType: 'pickup',
    deliveryAddress: '',
    deliveryZone: '',
    branchId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    const { data } = await supabase
      .from('delicatessen_branches')
      .select('*')
      .eq('is_active', true);

    if (data) {
      const branchesData = data.map(keysToCamel);
      setBranches(branchesData);
      if (branchesData.length > 0) {
        setFormData((prev) => ({ ...prev, branchId: branchesData[0].id }));
      }
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!formData.customerFirstName.trim()) {
      newErrors.customerFirstName = 'Requerido';
    }
    if (!formData.customerLastName.trim()) {
      newErrors.customerLastName = 'Requerido';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Requerido';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Requerido';
    }
    if (formData.deliveryType === 'delivery') {
      if (!formData.deliveryAddress.trim()) {
        newErrors.deliveryAddress = 'Requerido';
      }
      if (!formData.deliveryZone.trim()) {
        newErrors.deliveryZone = 'Requerido';
      }
    }
    if (formData.deliveryType === 'pickup' && !formData.branchId) {
      newErrors.branchId = 'Requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (items.length === 0) {
      showToast('Tu carrito está vacío', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        price: item.price,
        productType: item.productType,
      }));

      let result;
      if (import.meta.env.DEV) {
        result = await createOrderDev({
          customerFirstName: formData.customerFirstName,
          customerLastName: formData.customerLastName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          paymentMethod: formData.paymentMethod,
          deliveryType: formData.deliveryType as 'pickup' | 'delivery',
          deliveryAddress: formData.deliveryAddress || undefined,
          deliveryZone: formData.deliveryZone || undefined,
          branchId: formData.branchId || undefined,
          items: orderItems,
          notes: formData.notes || undefined,
        });
      } else {
        result = await apiPost<{ orderNumber: number; whatsappUrl: string }>('/orders-create', {
          ...formData,
          items: orderItems,
        });
      }

      clearCart();
      window.open(result.whatsappUrl, '_blank');
      showToast(`Pedido #${result.orderNumber} creado. Te abrimos WhatsApp para finalizar.`, 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Error:', error);
      showToast('Error al crear el pedido. Por favor intentá de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-text-muted mb-4">Tu carrito está vacío</p>
        <Button onClick={() => navigate('/catalogo')}>Ver productos</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-bg-alt p-6 rounded-lg">
              <h2 className="text-xl font-display font-bold mb-4">Datos del cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={formData.customerFirstName}
                  onChange={(e) => setFormData({ ...formData, customerFirstName: e.target.value })}
                  error={errors.customerFirstName}
                  required
                />
                <Input
                  label="Apellido"
                  value={formData.customerLastName}
                  onChange={(e) => setFormData({ ...formData, customerLastName: e.target.value })}
                  error={errors.customerLastName}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  error={errors.customerEmail}
                  required
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  error={errors.customerPhone}
                  required
                />
              </div>
            </div>

            <div className="bg-bg-alt p-6 rounded-lg">
              <h2 className="text-xl font-display font-bold mb-4">Forma de pago</h2>
              <Select
                label="Método de pago"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                error={errors.paymentMethod}
                options={[
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'mercadopago', label: 'Mercado Pago' },
                  { value: 'cards', label: 'Tarjetas' },
                  { value: 'wallets_qr', label: 'Billeteras/QR' },
                ]}
                required
              />
            </div>

            <div className="bg-bg-alt p-6 rounded-lg">
              <h2 className="text-xl font-display font-bold mb-4">Entrega</h2>
              <Select
                label="Tipo de entrega"
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                options={[
                  { value: 'pickup', label: 'Retiro en sucursal' },
                  { value: 'delivery', label: 'Envío a domicilio' },
                ]}
              />

              {formData.deliveryType === 'pickup' && (
                <div className="mt-4">
                  <Select
                    label="Sucursal"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    error={errors.branchId}
                    options={branches.map((b) => ({ value: b.id, label: b.name }))}
                    required
                  />
                </div>
              )}

              {formData.deliveryType === 'delivery' && (
                <>
                  <div className="mt-4">
                    <Input
                      label="Dirección"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      error={errors.deliveryAddress}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Zona/Barrio"
                      value={formData.deliveryZone}
                      onChange={(e) => setFormData({ ...formData, deliveryZone: e.target.value })}
                      error={errors.deliveryZone}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Select
                      label="Sucursal de referencia"
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      options={branches.map((b) => ({ value: b.id, label: b.name }))}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-bg-alt p-6 rounded-lg">
              <Input
                label="Notas adicionales (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
              />
            </div>

            <div className="sticky bottom-0 bg-bg border-t p-4 -mx-4 lg:hidden">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creando pedido...' : 'Crear pedido por WhatsApp'}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-bg-alt p-6 rounded-lg sticky top-20">
            <h2 className="text-xl font-display font-bold mb-4">Resumen</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.name}
                    {item.productType === 'weighted' && ` (${item.weight}kg)`}
                    {item.quantity && ` x${item.quantity}`}
                  </span>
                  <span className="font-medium">
                    ${item.productType === 'weighted'
                      ? (item.price * (item.weight || 0.25)).toLocaleString('es-AR')
                      : (item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full hidden lg:block"
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                disabled={loading}
              >
                {loading ? 'Creando pedido...' : 'Crear pedido por WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
