import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../lib/api';
import { supabaseServer } from '../../lib/supabaseServerDev';
import { keysToCamel, keysToSnake } from '../../lib/mappers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface SiteConfig {
  brandName: string;
  brandTagline?: string;
  whatsappNumber?: string;
  currency: string;
  deliveryOptions: any;
  paymentMethods: string[];
  theme: any;
}

export default function AdminSiteConfig() {
  const { showToast } = useToast();
  const [, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SiteConfig>>({
    brandName: '',
    brandTagline: '',
    whatsappNumber: '',
    currency: 'ARS',
    deliveryOptions: { pickup: true, delivery: true },
    paymentMethods: [],
    theme: {},
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        const { data } = await supabaseServer
          .from('delicatessen_site_config')
          .select('*')
          .single();
        if (data) {
          const configData = keysToCamel(data);
          setConfig(configData);
          setFormData(configData);
        }
      } else {
        const result = await apiGet<{ config: SiteConfig }>('/admin-site-config-get');
        setConfig(result.config);
        setFormData(result.config);
      }
    } catch (error: any) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (import.meta.env.DEV) {
        await supabaseServer
          .from('delicatessen_site_config')
          .update(keysToSnake(formData))
          .eq('id', '00000000-0000-0000-0000-000000000001');
      } else {
        await apiPut('/admin-site-config-update', formData);
      }
      showToast('Configuración guardada correctamente', 'success');
      loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      showToast('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  }

  function togglePaymentMethod(method: string) {
    const methods = formData.paymentMethods || [];
    if (methods.includes(method)) {
      setFormData({
        ...formData,
        paymentMethods: methods.filter((m) => m !== method),
      });
    } else {
      setFormData({
        ...formData,
        paymentMethods: [...methods, method],
      });
    }
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Configuración del Sitio</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="bg-bg rounded-lg shadow p-6 space-y-6">
        <div>
          <Input
            label="Nombre de la Marca"
            value={formData.brandName || ''}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            required
          />
        </div>

        <div>
          <Input
            label="Tagline"
            value={formData.brandTagline || ''}
            onChange={(e) => setFormData({ ...formData, brandTagline: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Número de WhatsApp"
            value={formData.whatsappNumber || ''}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            placeholder="5491123456789"
          />
          <p className="text-xs text-text-muted mt-1">Formato: código país + número sin espacios ni símbolos</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Métodos de Pago</label>
          <div className="space-y-2">
            {['cash', 'transfer', 'mercadopago', 'cards', 'wallets_qr'].map((method) => {
              const labels: Record<string, string> = {
                cash: 'Efectivo',
                transfer: 'Transferencia',
                mercadopago: 'Mercado Pago',
                cards: 'Tarjetas',
                wallets_qr: 'Billeteras/QR',
              };
              return (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(formData.paymentMethods || []).includes(method)}
                    onChange={() => togglePaymentMethod(method)}
                    className="mr-2"
                  />
                  {labels[method]}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Opciones de Entrega</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.deliveryOptions?.pickup || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryOptions: {
                      ...formData.deliveryOptions,
                      pickup: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Retiro en sucursal
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.deliveryOptions?.delivery || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryOptions: {
                      ...formData.deliveryOptions,
                      delivery: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Envío a domicilio
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
