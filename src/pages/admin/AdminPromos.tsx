import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import { supabaseServer } from '../../lib/supabaseServerDev';
import { keysToCamel } from '../../lib/mappers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Badge from '../../components/Badge';

interface Promo {
  id: string;
  title: string;
  subtitle?: string;
  conditions?: string;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function AdminPromos() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [formData, setFormData] = useState<Partial<Promo>>({
    title: '',
    subtitle: '',
    conditions: '',
    startsAt: '',
    endsAt: '',
    isActive: true,
    imageUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        const { data } = await supabaseServer
          .from('delicatessen_promos')
          .select('*')
          .order('created_at', { ascending: false });
        setPromos((data || []).map(keysToCamel));
      } else {
        const result = await apiGet<{ promos: Promo[] }>('/admin-promos-crud');
        setPromos(result.promos);
      }
    } catch (error: any) {
      console.error('Error loading promos:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingPromo(null);
    setFormData({
      title: '',
      subtitle: '',
      conditions: '',
      startsAt: '',
      endsAt: '',
      isActive: true,
      imageUrl: '',
    });
    setIsModalOpen(true);
  }

  function handleEdit(promo: Promo) {
    setEditingPromo(promo);
    setFormData(promo);
    setIsModalOpen(true);
  }

  async function handleSave() {
    try {
      if (import.meta.env.DEV) {
        if (editingPromo) {
          await supabaseServer
            .from('delicatessen_promos')
            .update(formData)
            .eq('id', editingPromo.id);
        } else {
          await supabaseServer
            .from('delicatessen_promos')
            .insert(formData);
        }
      } else {
        if (editingPromo) {
          await apiPut(`/admin-promos-crud/${editingPromo.id}`, formData);
        } else {
          await apiPost('/admin-promos-crud', formData);
        }
      }
      setIsModalOpen(false);
      showToast('Promo guardada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving promo:', error);
      showToast('Error al guardar la promo', 'error');
    }
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;

    try {
      if (import.meta.env.DEV) {
        await supabaseServer
          .from('delicatessen_promos')
          .delete()
          .eq('id', deletingId);
      } else {
        await apiDelete(`/admin-promos-crud/${deletingId}`);
      }
      showToast('Promo eliminada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting promo:', error);
      showToast('Error al eliminar la promo', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Promos</h1>
        <Button onClick={handleCreate}>+ Nueva Promo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="bg-bg rounded-lg shadow p-6 border-2 border-primary">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-display font-bold text-xl">{promo.title}</h3>
              {promo.isActive ? (
                <Badge variant="success">Activa</Badge>
              ) : (
                <Badge variant="error">Inactiva</Badge>
              )}
            </div>
            {promo.subtitle && (
              <p className="text-text-muted mb-2">{promo.subtitle}</p>
            )}
            {promo.conditions && (
              <p className="text-sm text-text-muted mb-4">{promo.conditions}</p>
            )}
            {promo.imageUrl && (
              <img
                src={promo.imageUrl}
                alt={promo.title}
                className="w-full h-32 object-cover rounded mb-4"
              />
            )}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(promo)}
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(promo.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? 'Editar Promo' : 'Nueva Promo'}
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Subtítulo"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
          <Input
            label="Condiciones"
            multiline
            rows={3}
            value={formData.conditions || ''}
            onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
          />
          <Input
            label="URL de Imagen"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          <Input
            label="Fecha Inicio"
            type="datetime-local"
            value={formData.startsAt ? new Date(formData.startsAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, startsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
          <Input
            label="Fecha Fin"
            type="datetime-local"
            value={formData.endsAt ? new Date(formData.endsAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, endsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            Activa
          </label>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Guardar
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Promo"
        message="¿Estás seguro de eliminar esta promo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
