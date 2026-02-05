import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabasePublic';
import { keysToCamel } from '../lib/mappers';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(0.25);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  async function loadProduct() {
    const { data, error } = await supabase
      .from('delicatessen_products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      navigate('/catalogo');
      return;
    }

    setProduct(keysToCamel(data));
    setLoading(false);
  }

  function handleAddToCart() {
    if (!product) return;

    if (product.productType === 'weighted') {
      // Convertir a kg si está en gramos
      const weightInKg = weightUnit === 'g' ? weight / 1000 : weight;
      const basePrice = product.promoPrice || product.pricePerKg || 0;
      addItem({
        productId: product.id,
        name: product.name,
        price: basePrice * weightInKg,
        weight: weightInKg,
        productType: 'weighted',
        image: product.images?.[0],
      });
      showToast(`${product.name} (${weight}${weightUnit}) agregado al carrito`, 'success');
    } else {
      const basePrice = product.promoPrice || product.price || 0;
      addItem({
        productId: product.id,
        name: product.name,
        price: basePrice,
        quantity,
        productType: product.productType,
        image: product.images?.[0],
      });
      showToast(`${product.name} (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}) agregado al carrito`, 'success');
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Cargando...</div>;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/products/yerba.jpg';
              }}
            />
          ) : (
            <div className="w-full h-96 bg-bg-alt rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/images/products/yerba.jpg"
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-text-muted">Sin imagen</span>';
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-display font-bold mb-4">{product.name}</h1>

          {product.description && (
            <p className="text-text-muted mb-6">{product.description}</p>
          )}

          {/* Badges de estado */}
          <div className="flex gap-2 mb-4">
            {product.isPromo && <Badge variant="warning">Promoción</Badge>}
            {product.isOffer && <Badge variant="secondary">Oferta</Badge>}
            {product.isFeatured && <Badge variant="primary">Destacado</Badge>}
            {product.promoBadge && <Badge variant="warning">{product.promoBadge}</Badge>}
          </div>

          {product.productType === 'weighted' ? (
            <div className="mb-6">
              <div className="mb-6">
                {product.promoPrice ? (
                  <div>
                    <p className="text-lg line-through text-text-muted">
                      ${product.pricePerKg?.toLocaleString('es-AR')}/kg
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      ${product.promoPrice.toLocaleString('es-AR')}/kg
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    ${product.pricePerKg?.toLocaleString('es-AR')}/kg
                  </p>
                )}
              </div>
              
              {/* Selector de unidad */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-text">Unidad de medida:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setWeightUnit('kg');
                      if (weight > 10) setWeight(1);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      weightUnit === 'kg'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-text hover:border-primary'
                    }`}
                  >
                    Kilogramos (kg)
                  </button>
                  <button
                    onClick={() => {
                      setWeightUnit('g');
                      if (weight < 1) setWeight(250);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      weightUnit === 'g'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-text hover:border-primary'
                    }`}
                  >
                    Gramos (g)
                  </button>
                </div>
              </div>

              {/* Selector de cantidad rápida */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-text">Cantidad rápida:</label>
                <div className="grid grid-cols-4 gap-2">
                  {weightUnit === 'kg' ? (
                    <>
                      <button
                        onClick={() => setWeight(0.25)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 0.25 && weightUnit === 'kg'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        250g
                      </button>
                      <button
                        onClick={() => setWeight(0.5)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 0.5 && weightUnit === 'kg'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        500g
                      </button>
                      <button
                        onClick={() => setWeight(0.75)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 0.75 && weightUnit === 'kg'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        750g
                      </button>
                      <button
                        onClick={() => setWeight(1)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 1 && weightUnit === 'kg'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        1kg
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setWeight(250)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 250 && weightUnit === 'g'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        250g
                      </button>
                      <button
                        onClick={() => setWeight(500)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 500 && weightUnit === 'g'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        500g
                      </button>
                      <button
                        onClick={() => setWeight(750)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 750 && weightUnit === 'g'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        750g
                      </button>
                      <button
                        onClick={() => setWeight(1000)}
                        className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                          weight === 1000 && weightUnit === 'g'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-text hover:border-primary'
                        }`}
                      >
                        1kg
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Selector personalizado */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-text">
                  Cantidad personalizada ({weightUnit}):
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const step = weightUnit === 'kg' ? 0.1 : 100;
                      setWeight(Math.max(weightUnit === 'kg' ? 0.1 : 100, weight - step));
                    }}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || (weightUnit === 'kg' ? 0.1 : 100);
                      const min = weightUnit === 'kg' ? 0.1 : 100;
                      const max = weightUnit === 'kg' ? 10 : 10000;
                      setWeight(Math.max(min, Math.min(max, val)));
                    }}
                    min={weightUnit === 'kg' ? 0.1 : 100}
                    max={weightUnit === 'kg' ? 10 : 10000}
                    step={weightUnit === 'kg' ? 0.1 : 50}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-medium focus:border-primary focus:outline-none"
                  />
                  <span className="text-text-muted font-medium">{weightUnit}</span>
                  <button
                    onClick={() => {
                      const step = weightUnit === 'kg' ? 0.1 : 100;
                      const max = weightUnit === 'kg' ? 10 : 10000;
                      setWeight(Math.min(max, weight + step));
                    }}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="text-sm text-text-muted mb-4">
                ⚠️ El peso final puede variar ligeramente
              </p>
              
              <div className="bg-bg-alt p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">Total estimado:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(() => {
                      const basePrice = product.promoPrice || product.pricePerKg || 0;
                      return (basePrice * (weightUnit === 'g' ? weight / 1000 : weight)).toLocaleString('es-AR');
                    })()}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {weight} {weightUnit} × ${(product.promoPrice || product.pricePerKg || 0).toLocaleString('es-AR')}/kg
                </p>
              </div>
            </div>
          ) : product.productType === 'combo' ? (
            <div className="mb-6">
              {product.promoPrice ? (
                <div className="mb-4">
                  <p className="text-lg line-through text-text-muted">
                    ${product.price?.toLocaleString('es-AR')}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    ${product.promoPrice.toLocaleString('es-AR')}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-primary mb-4">
                  ${product.price?.toLocaleString('es-AR')}
                </p>
              )}
              <p className="text-sm text-text-muted mb-4">
                Armado sujeto a stock disponible
              </p>
            </div>
          ) : (
            <div className="mb-6">
              {product.promoPrice ? (
                <div className="mb-6">
                  <p className="text-lg line-through text-text-muted">
                    ${product.price?.toLocaleString('es-AR')}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    ${product.promoPrice.toLocaleString('es-AR')}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-primary mb-6">
                  ${product.price?.toLocaleString('es-AR')}
                </p>
              )}
              
              {/* Selector de cantidad rápida */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-text">Cantidad rápida:</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setQuantity(qty)}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                        quantity === qty
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-text hover:border-primary'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector personalizado */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-text">Cantidad personalizada:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(100, val)));
                    }}
                    min={1}
                    max={100}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-medium focus:border-primary focus:outline-none"
                  />
                  <span className="text-text-muted font-medium">unidades</span>
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-primary transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-bg-alt p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-text font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${((product.promoPrice || product.price || 0) * quantity).toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {quantity} {quantity === 1 ? 'unidad' : 'unidades'} × ${(product.promoPrice || product.price || 0).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          )}

          {product.promoBadge && (
            <Badge variant="warning" className="mb-4">{product.promoBadge}</Badge>
          )}

          {!product.hasStock && (
            <Badge variant="error" className="mb-4">Sin stock</Badge>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={!product.hasStock}
            size="lg"
            className="w-full"
          >
            {product.productType === 'weighted' ? (
              <>Agregar {weight} {weightUnit} al carrito</>
            ) : product.productType === 'combo' ? (
              <>Agregar combo al carrito</>
            ) : (
              <>Agregar {quantity} {quantity === 1 ? 'unidad' : 'unidades'} al carrito</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
