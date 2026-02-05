import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Drawer from './Drawer';
import Button from './Button';

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, removeItem, updateQuantity, updateWeight, total } = useCart();

  return (
    <>
      <header className="sticky top-0 z-30 bg-bg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-text hover:bg-primary/10 rounded-lg transition-colors"
                aria-label="Menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-display font-bold text-primary">Delicatessen</h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/catalogo" className="text-text hover:text-primary transition-colors">
                Catálogo
              </Link>
              <Link to="/faqs" className="text-text hover:text-primary transition-colors">
                FAQs
              </Link>
              <Link to="/#sucursales" className="text-text hover:text-primary transition-colors">
                Sucursales
              </Link>
            </nav>

            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <input
                type="search"
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              aria-label="Carrito"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="mb-4">
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  to="/catalogo"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-text hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Catálogo
                </Link>
                <Link
                  to="/faqs"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-text hover:bg-primary/10 rounded-lg transition-colors"
                >
                  FAQs
                </Link>
                <Link
                  to="/#sucursales"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-text hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Sucursales
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <Drawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Tu carrito">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p>Tu carrito está vacío</p>
                <Link to="/catalogo" className="text-primary mt-4 inline-block">
                  Ver productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 bg-bg-alt rounded overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text">{item.name}</h3>
                      {item.productType === 'weighted' ? (
                        <div className="mt-2">
                          <label className="text-sm text-text-muted">Peso (kg):</label>
                          <select
                            value={item.weight || 0.25}
                            onChange={(e) => updateWeight(item.productId, parseFloat(e.target.value))}
                            className="mt-1 px-2 py-1 border rounded text-sm"
                          >
                            <option value={0.25}>0.25 kg</option>
                            <option value={0.5}>0.5 kg</option>
                            <option value={1}>1 kg</option>
                          </select>
                          <p className="text-xs text-text-muted mt-1">
                            Precio por kg: ${(item.price / (item.weight || 0.25)).toLocaleString('es-AR')}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, (item.quantity || 1) - 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded"
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, (item.quantity || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded"
                          >
                            +
                          </button>
                        </div>
                      )}
                      <p className="text-sm font-medium text-primary mt-2">
                        ${item.productType === 'weighted' 
                          ? (item.price * (item.weight || 0.25)).toLocaleString('es-AR')
                          : (item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="sticky bottom-0 bg-bg border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-text">Total:</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
              <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                <Button className="w-full" size="lg">
                  Finalizar compra
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
