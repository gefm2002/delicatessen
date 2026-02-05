import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabasePublic';
import { keysToCamel } from '../lib/mappers';
import Badge from '../components/Badge';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('categoria') || '',
    productType: '',
    inStock: false,
    search: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  async function loadCategories() {
    const { data } = await supabase
      .from('delicatessen_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (data) setCategories(data.map(keysToCamel));
  }

  async function loadProducts() {
    setLoading(true);
    let query = supabase
      .from('delicatessen_products')
      .select('*')
      .eq('is_active', true);

    if (filters.category) {
      const cat = categories.find((c) => c.slug === filters.category);
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (filters.productType) {
      query = query.eq('product_type', filters.productType);
    }

    if (filters.inStock) {
      query = query.eq('has_stock', true);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data } = await query.order('created_at', { ascending: false });

    if (data) setProducts(data.map(keysToCamel));
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Catálogo</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="md:col-span-1">
          <div className="bg-bg-alt p-4 rounded-lg sticky top-20">
            <h2 className="font-display font-bold mb-4">Filtros</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={filters.productType}
                  onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Todos</option>
                  <option value="standard">Estándar</option>
                  <option value="weighted">A granel</option>
                  <option value="combo">Combo/Box</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="mr-2"
                  />
                  Solo en stock
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No se encontraron productos
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.slug}`}
                  className="bg-bg rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-bg-alt overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/products/yerba.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-text">{product.name}</h3>
                      {product.promoBadge && (
                        <Badge variant="warning">{product.promoBadge}</Badge>
                      )}
                    </div>
                    {product.productType === 'weighted' ? (
                      <div className="mb-2">
                        {product.promoPrice ? (
                          <>
                            <p className="text-xs line-through text-text-muted">
                              ${product.pricePerKg?.toLocaleString('es-AR')}/kg
                            </p>
                            <p className="text-primary font-bold text-lg">
                              ${product.promoPrice.toLocaleString('es-AR')}/kg
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-text-muted">
                            ${product.pricePerKg?.toLocaleString('es-AR')}/kg
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-2">
                        {product.promoPrice ? (
                          <>
                            <p className="text-xs line-through text-text-muted">
                              ${product.price?.toLocaleString('es-AR')}
                            </p>
                            <p className="text-primary font-bold text-lg">
                              ${product.promoPrice.toLocaleString('es-AR')}
                            </p>
                          </>
                        ) : (
                          <p className="text-primary font-bold text-lg">
                            ${product.price?.toLocaleString('es-AR')}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.isPromo && <Badge variant="warning" className="text-xs">Promo</Badge>}
                      {product.isOffer && <Badge variant="secondary" className="text-xs">Oferta</Badge>}
                      {product.isFeatured && <Badge variant="primary" className="text-xs">Destacado</Badge>}
                      {!product.hasStock && <Badge variant="error" className="text-xs">Sin stock</Badge>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
