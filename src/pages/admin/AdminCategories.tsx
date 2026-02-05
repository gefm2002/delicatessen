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

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    sortOrder: 0,
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
          .from('delicatessen_categories')
          .select('*')
          .order('sort_order', { ascending: true });
        setCategories((data || []).map(keysToCamel));
      } else {
        const result = await apiGet<{ categories: Category[] }>('/admin-categories-crud');
        setCategories(result.categories);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      sortOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  }

  async function handleSave() {
    try {
      // Generar slug automáticamente si no existe
      const slug = formData.slug || generateSlug(formData.name || '');
      
      const dataToSave = {
        ...formData,
        slug,
      };

      if (import.meta.env.DEV) {
        if (editingCategory) {
          await supabaseServer
            .from('delicatessen_categories')
            .update(dataToSave)
            .eq('id', editingCategory.id);
        } else {
          await supabaseServer
            .from('delicatessen_categories')
            .insert(dataToSave);
        }
      } else {
        if (editingCategory) {
          await apiPut(`/admin-categories-crud/${editingCategory.id}`, dataToSave);
        } else {
          await apiPost('/admin-categories-crud', dataToSave);
        }
      }
      setIsModalOpen(false);
      showToast('Categoría guardada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      showToast('Error al guardar la categoría', 'error');
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
          .from('delicatessen_categories')
          .delete()
          .eq('id', deletingId);
      } else {
        await apiDelete(`/admin-categories-crud/${deletingId}`);
      }
      showToast('Categoría eliminada correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showToast('Error al eliminar la categoría', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Categorías</h1>
        <Button onClick={handleCreate}>+ Nueva Categoría</Button>
      </div>

      <div className="bg-bg rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-alt">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Orden</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-bg-alt">
                <td className="px-4 py-3 font-medium text-text">{category.name}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{category.slug}</td>
                <td className="px-4 py-3 text-sm text-text-muted">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  {category.isActive ? (
                    <Badge variant="success">Activa</Badge>
                  ) : (
                    <Badge variant="error">Inactiva</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(category.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name || ''}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                slug: generateSlug(name),
              });
            }}
            required
          />
          <Input
            label="Orden"
            type="number"
            value={formData.sortOrder || 0}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
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
        title="Eliminar Categoría"
        message="¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
