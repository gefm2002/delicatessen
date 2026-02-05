import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Drawer from './Drawer';
import Button from './Button';

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, removeItem, updateQuantity, updateWeight, total, clearCart } = useCart();

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
              <a
                href="https://instagram.com/delicatessen.vt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
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
                <div className="px-4 py-2 flex gap-4">
                  <a
                    href="https://instagram.com/delicatessen.vt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/delicatessenVT/?locale=es_LA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
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
