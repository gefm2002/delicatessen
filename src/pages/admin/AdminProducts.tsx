import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import { supabaseServer } from '../../lib/supabaseServerDev';
import { keysToCamel } from '../../lib/mappers';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import Badge from '../../components/Badge';
import ImageUpload from '../../components/ImageUpload';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productType: 'standard' | 'weighted' | 'combo';
  price?: number;
  pricePerKg?: number;
  promoPrice?: number;
  promoDiscountType?: 'fixed' | 'percentage' | null;
  promoDiscountValue?: number;
  isActive: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  isOffer: boolean;
  hasStock: boolean;
  images: string[];
  tags: string[];
  promoBadge?: string;
  categoryId?: string;
}

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    productType: 'standard',
    price: 0,
    pricePerKg: 0,
    promoPrice: undefined,
    promoDiscountType: null,
    promoDiscountValue: undefined,
    isActive: true,
    isFeatured: false,
    isPromo: false,
    isOffer: false,
    hasStock: true,
    images: [],
    tags: [],
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        const { data: prods } = await supabaseServer
          .from('delicatessen_products')
          .select('*')
          .order('created_at', { ascending: false });
        setProducts((prods || []).map(keysToCamel));

        const { data: cats } = await supabaseServer
          .from('delicatessen_categories')
          .select('*')
          .order('sort_order', { ascending: true });
        setCategories((cats || []).map(keysToCamel));
      } else {
        const prods = await apiGet<{ products: Product[] }>('/admin-products-crud');
        setProducts(prods.products);

        const cats = await apiGet<{ categories: any[] }>('/admin-categories-crud');
        setCategories(cats.categories);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      productType: 'standard',
      price: 0,
      pricePerKg: 0,
      promoPrice: undefined,
      promoDiscountType: null,
      promoDiscountValue: undefined,
      isActive: true,
      isFeatured: false,
      isPromo: false,
      isOffer: false,
      hasStock: true,
      images: [],
      tags: [],
      categoryId: '',
    });
    setIsModalOpen(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  }

  async function handleSave() {
    try {
      // Generar slug automáticamente si no existe
      const slug = formData.slug || generateSlug(formData.name || '');
      
      // Calcular precio promocional si hay descuento
      let promoPrice = formData.promoPrice;
      if (formData.promoDiscountType && formData.promoDiscountValue !== undefined) {
        const basePrice = formData.productType === 'weighted' 
          ? (formData.pricePerKg || 0)
          : (formData.price || 0);
        
        if (formData.promoDiscountType === 'percentage') {
          promoPrice = basePrice * (1 - formData.promoDiscountValue / 100);
        } else if (formData.promoDiscountType === 'fixed') {
          promoPrice = Math.max(0, basePrice - formData.promoDiscountValue);
        }
      }

      const dataToSave = {
        ...formData,
        slug,
        promoPrice: promoPrice || null,
      };

      if (import.meta.env.DEV) {
        if (editingProduct) {
          await supabaseServer
            .from('delicatessen_products')
            .update(dataToSave)
            .eq('id', editingProduct.id);
        } else {
          await supabaseServer
            .from('delicatessen_products')
            .insert(dataToSave);
        }
      } else {
        if (editingProduct) {
          await apiPut(`/admin-products-crud/${editingProduct.id}`, dataToSave);
        } else {
          await apiPost('/admin-products-crud', dataToSave);
        }
      }
      setIsModalOpen(false);
      showToast('Producto guardado correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast('Error al guardar el producto', 'error');
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
          .from('delicatessen_products')
          .delete()
          .eq('id', deletingId);
      } else {
        await apiDelete(`/admin-products-crud/${deletingId}`);
      }
      showToast('Producto eliminado correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showToast('Error al eliminar el producto', 'error');
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
        <h1 className="text-3xl font-display font-bold">Productos</h1>
        <Button onClick={handleCreate}>+ Nuevo Producto</Button>
      </div>

      <div className="bg-bg rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-alt">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Precio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-bg-alt">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-text">{product.name}</div>
                      {product.isFeatured && (
                        <Badge variant="primary" className="mt-1 text-xs">Destacado</Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {product.productType === 'weighted' ? 'A granel' : 
                   product.productType === 'combo' ? 'Combo' : 'Estándar'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-text">
                  <div>
                    {product.productType === 'weighted' ? (
                      <>
                        {product.promoPrice ? (
                          <>
                            <span className="line-through text-text-muted text-xs">
                              ${product.pricePerKg?.toLocaleString('es-AR')}/kg
                            </span>
                            <br />
                            <span className="text-primary font-bold">
                              ${product.promoPrice.toLocaleString('es-AR')}/kg
                            </span>
                          </>
                        ) : (
                          `$${product.pricePerKg?.toLocaleString('es-AR')}/kg`
                        )}
                      </>
                    ) : (
                      <>
                        {product.promoPrice ? (
                          <>
                            <span className="line-through text-text-muted text-xs">
                              ${product.price?.toLocaleString('es-AR')}
                            </span>
                            <br />
                            <span className="text-primary font-bold">
                              ${product.promoPrice.toLocaleString('es-AR')}
                            </span>
                          </>
                        ) : (
                          `$${product.price?.toLocaleString('es-AR')}`
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {product.isActive ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <Badge variant="error">Inactivo</Badge>
                    )}
                    {product.isFeatured && (
                      <Badge variant="primary" className="text-xs">Destacado</Badge>
                    )}
                    {product.isPromo && (
                      <Badge variant="warning" className="text-xs">Promo</Badge>
                    )}
                    {product.isOffer && (
                      <Badge variant="secondary" className="text-xs">Oferta</Badge>
                    )}
                    {!product.hasStock && (
                      <Badge variant="error" className="text-xs">Sin stock</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
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
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
            label="Descripción"
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            label="Categoría"
            value={formData.categoryId || ''}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={[
              { value: '', label: 'Sin categoría' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
          <Select
            label="Tipo de Producto"
            value={formData.productType || 'standard'}
            onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
            options={[
              { value: 'standard', label: 'Estándar' },
              { value: 'weighted', label: 'A granel' },
              { value: 'combo', label: 'Combo' },
            ]}
          />
          {formData.productType === 'weighted' ? (
            <Input
              label="Precio por kg"
              type="number"
              step="0.01"
              value={formData.pricePerKg || 0}
              onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) })}
              required
            />
          ) : (
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formData.price || 0}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          )}

          {/* Precio Promocional */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-text">Precio Promocional</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo de descuento"
                value={formData.promoDiscountType || ''}
                onChange={(e) => {
                  const value = e.target.value || null;
                  setFormData({
                    ...formData,
                    promoDiscountType: value as 'fixed' | 'percentage' | null,
                    promoPrice: undefined, // Reset promo price when changing discount type
                  });
                }}
                options={[
                  { value: '', label: 'Sin descuento' },
                  { value: 'percentage', label: 'Porcentaje (%)' },
                  { value: 'fixed', label: 'Monto fijo ($)' },
                ]}
              />
              
              {formData.promoDiscountType && (
                <Input
                  label={formData.promoDiscountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                  type="number"
                  step="0.01"
                  value={formData.promoDiscountValue || ''}
                  onChange={(e) => setFormData({ ...formData, promoDiscountValue: parseFloat(e.target.value) || undefined })}
                />
              )}
            </div>

            <Input
              label="Precio promocional fijo (opcional, sobreescribe descuento)"
              type="number"
              step="0.01"
              value={formData.promoPrice || ''}
              onChange={(e) => setFormData({ ...formData, promoPrice: parseFloat(e.target.value) || undefined })}
              placeholder="Dejar vacío para calcular automáticamente"
            />

            {formData.promoDiscountType && formData.promoDiscountValue !== undefined && (
              <div className="bg-bg-alt p-3 rounded-lg">
                <p className="text-sm text-text-muted">Precio calculado:</p>
                <p className="text-lg font-bold text-primary">
                  ${(() => {
                    const basePrice = formData.productType === 'weighted' 
                      ? (formData.pricePerKg || 0)
                      : (formData.price || 0);
                    if (formData.promoDiscountType === 'percentage') {
                      return (basePrice * (1 - formData.promoDiscountValue / 100)).toLocaleString('es-AR');
                    } else {
                      return Math.max(0, basePrice - formData.promoDiscountValue).toLocaleString('es-AR');
                    }
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Imágenes */}
          <ImageUpload
            images={formData.images || []}
            maxImages={3}
            entityType="products"
            entityId={editingProduct?.id}
            onImagesChange={(images) => setFormData({ ...formData, images })}
          />

          {/* Checkboxes de estado */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-medium text-text mb-2">Estado y Etiquetas</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                Activo
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasStock}
                  onChange={(e) => setFormData({ ...formData, hasStock: e.target.checked })}
                  className="mr-2"
                />
                En stock
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="mr-2"
                />
                Destacado
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPromo}
                  onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                  className="mr-2"
                />
                Promoción
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isOffer}
                  onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                  className="mr-2"
                />
                Oferta
              </label>
            </div>
          </div>

          <Input
            label="Badge de Promo (opcional)"
            value={formData.promoBadge || ''}
            onChange={(e) => setFormData({ ...formData, promoBadge: e.target.value })}
            placeholder="Ej: '20% OFF', '2x1', etc."
          />
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
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
