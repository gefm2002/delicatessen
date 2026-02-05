import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Badge from './Badge';
import Button from './Button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    productType: 'standard' | 'weighted' | 'combo';
    price?: number;
    pricePerKg?: number;
    promoPrice?: number;
    images?: string[];
    hasStock: boolean;
    isPromo?: boolean;
    isOffer?: boolean;
    isFeatured?: boolean;
    promoBadge?: string;
  };
  showQuickAdd?: boolean;
}

export default function ProductCard({ product, showQuickAdd = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quickWeight, setQuickWeight] = useState(0.5); // Default 500g
  const [quickQuantity, setQuickQuantity] = useState(1);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!product.hasStock) {
      showToast('Producto sin stock', 'error');
      return;
    }

    if (product.productType === 'weighted') {
      const basePrice = product.promoPrice || product.pricePerKg || 0;
      addItem({
        productId: product.id,
        name: product.name,
        price: basePrice * quickWeight,
        weight: quickWeight,
        productType: 'weighted',
        image: product.images?.[0],
      });
      showToast(`${product.name} (${quickWeight}kg) agregado al carrito`, 'success');
    } else {
      const basePrice = product.promoPrice || product.price || 0;
      addItem({
        productId: product.id,
        name: product.name,
        price: basePrice,
        quantity: quickQuantity,
        productType: product.productType,
        image: product.images?.[0],
      });
      showToast(`${product.name} (${quickQuantity} ${quickQuantity === 1 ? 'unidad' : 'unidades'}) agregado al carrito`, 'success');
    }
  }

  return (
    <div className="bg-bg rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <Link to={`/producto/${product.slug}`} className="block">
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
          <div className="flex flex-wrap gap-1">
            {product.isPromo && <Badge variant="warning" className="text-xs">Promo</Badge>}
            {product.isOffer && <Badge variant="secondary" className="text-xs">Oferta</Badge>}
            {product.isFeatured && <Badge variant="primary" className="text-xs">Destacado</Badge>}
            {!product.hasStock && <Badge variant="error" className="text-xs">Sin stock</Badge>}
          </div>
        </div>
      </Link>

      {/* Quick Add Section */}
      {showQuickAdd && product.hasStock && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-3" onClick={(e) => e.stopPropagation()}>
          {product.productType === 'weighted' ? (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[0.25, 0.5, 0.75, 1].map((w) => (
                  <button
                    key={w}
                    onClick={() => setQuickWeight(w)}
                    className={`flex-1 px-2 py-1 text-xs rounded border-2 transition-colors ${
                      quickWeight === w
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-text hover:border-primary'
                    }`}
                  >
                    {w === 0.25 ? '250g' : w === 0.5 ? '500g' : w === 0.75 ? '750g' : '1kg'}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleQuickAdd}
                size="sm"
                className="w-full"
                disabled={!product.hasStock}
              >
                Agregar {quickWeight}kg
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setQuickQuantity(qty)}
                    className={`flex-1 px-2 py-1 text-xs rounded border-2 transition-colors ${
                      quickQuantity === qty
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-text hover:border-primary'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleQuickAdd}
                size="sm"
                className="w-full"
                disabled={!product.hasStock}
              >
                Agregar {quickQuantity} {quickQuantity === 1 ? 'unidad' : 'unidades'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
