import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import { supabaseServer } from '../../lib/supabaseServerDev';
import { keysToCamel } from '../../lib/mappers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import ConfirmModal from '../../components/ConfirmModal';

interface Branch {
  id: string;
  name: string;
  addressText: string;
  mapQuery: string;
  phone?: string;
  whatsapp?: string;
  hours: any;
  isActive: boolean;
}

export default function AdminBranches() {
  const { showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    addressText: '',
    mapQuery: '',
    phone: '',
    whatsapp: '',
    hours: {},
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        const { data } = await supabaseServer
          .from('delicatessen_branches')
          .select('*')
          .order('created_at', { ascending: true });
        setBranches((data || []).map(keysToCamel));
      } else {
        const result = await apiGet<{ branches: Branch[] }>('/admin-branches-crud');
        setBranches(result.branches);
      }
    } catch (error: any) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingBranch(null);
    setFormData({
      name: '',
      addressText: '',
      mapQuery: '',
      phone: '',
      whatsapp: '',
      hours: {
        monday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        tuesday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        wednesday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        thursday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        friday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        saturday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        sunday: null,
      },
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch);
    setFormData(branch);
    setIsModalOpen(true);
  }

  async function handleSave() {
    try {
      if (import.meta.env.DEV) {
        if (editingBranch) {
          await supabaseServer
            .from('delicatessen_branches')
            .update(formData)
            .eq('id', editingBranch.id);
        } else {
          await supabaseServer
            .from('delicatessen_branches')
            .insert(formData);
        }
      } else {
        if (editingBranch) {
          await apiPut(`/admin-branches-crud/${editingBranch.id}`, formData);
        } else {
          await apiPost('/admin-branches-crud', formData);
        }
      }
      setIsModalOpen(false);
      showToast('Sucursal guardada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving branch:', error);
      showToast('Error al guardar la sucursal', 'error');
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
          .from('delicatessen_branches')
          .delete()
          .eq('id', deletingId);
      } else {
        await apiDelete(`/admin-branches-crud/${deletingId}`);
      }
      showToast('Sucursal eliminada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      showToast('Error al eliminar la sucursal', 'error');
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
        <h1 className="text-3xl font-display font-bold">Sucursales</h1>
        <Button onClick={handleCreate}>+ Nueva Sucursal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-bg rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display font-bold text-xl">{branch.name}</h3>
              {branch.isActive ? (
                <Badge variant="success">Activa</Badge>
              ) : (
                <Badge variant="error">Inactiva</Badge>
              )}
            </div>
            <p className="text-text-muted mb-2">{branch.addressText}</p>
            {branch.phone && (
              <p className="text-sm text-text-muted mb-2">Tel: {branch.phone}</p>
            )}
            {branch.whatsapp && (
              <p className="text-sm text-text-muted mb-4">WhatsApp: {branch.whatsapp}</p>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(branch)}
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(branch.id)}
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
        title={editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Dirección"
            value={formData.addressText || ''}
            onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
            required
          />
          <Input
            label="Query para Mapa (Google Maps)"
            value={formData.mapQuery || ''}
            onChange={(e) => setFormData({ ...formData, mapQuery: e.target.value })}
            required
            placeholder="Ej: Belgrano+Rivadavia+Venado+Tuerto"
          />
          <Input
            label="Teléfono"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="WhatsApp"
            value={formData.whatsapp || ''}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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
        title="Eliminar Sucursal"
        message="¿Estás seguro de eliminar esta sucursal? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
