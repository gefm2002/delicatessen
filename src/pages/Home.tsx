import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabasePublic';
import { keysToCamel } from '../lib/mappers';
import Button from '../components/Button';
import ProductCarousel from '../components/ProductCarousel';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Promo {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [offerProducts, setOfferProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: cats } = await supabase
      .from('delicatessen_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (cats) setCategories(cats.map(keysToCamel));

    const { data: promosData } = await supabase
      .from('delicatessen_promos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (promosData) setPromos(promosData.map(keysToCamel));

    // Productos destacados (boxes)
    const { data: featured } = await supabase
      .from('delicatessen_products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('product_type', 'combo')
      .limit(10);

    if (featured) setFeaturedProducts(featured.map(keysToCamel));

    // Productos en promoción
    const { data: promo } = await supabase
      .from('delicatessen_products')
      .select('*')
      .eq('is_active', true)
      .eq('is_promo', true)
      .limit(10);

    if (promo) setPromoProducts(promo.map(keysToCamel));

    // Productos en oferta
    const { data: offers } = await supabase
      .from('delicatessen_products')
      .select('*')
      .eq('is_active', true)
      .eq('is_offer', true)
      .limit(10);

    if (offers) setOfferProducts(offers.map(keysToCamel));

    // Productos nuevos (últimos agregados)
    const { data: newProds } = await supabase
      .from('delicatessen_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (newProds) setNewProducts(newProds.map(keysToCamel));
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 z-10"></div>
        <img
          src="/images/hero/hero.jpg"
          alt="Delicatessen"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center text-white">
          <div className="text-center px-4">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Promos de la semana
            </h2>
            <p className="text-xl mb-6">Productos frescos y boxes para regalar</p>
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-bg-alt">
                Ver catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-display font-bold mb-8 text-center">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const categoryImageMap: Record<string, string> = {
              'carniceria': '/images/categories/carniceria.jpg',
              'fiambres-quesos': '/images/categories/fiambres.jpg',
              'boxes-regalos': '/images/boxes/boxes.jpg',
              'panaderia-pasteleria': '/images/categories/panaderia.jpg',
              'bebidas': '/images/categories/bebidas.jpg',
            };
            const imageUrl = categoryImageMap[cat.slug] || '/images/categories/carniceria.jpg';
            
            return (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                className="bg-bg-alt rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-text">{cat.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Carrusel de Productos Destacados */}
      {featuredProducts.length > 0 && (
        <div className="bg-bg-alt">
          <ProductCarousel
            title="⭐ Productos Destacados"
            products={featuredProducts}
            showQuickAdd={true}
          />
        </div>
      )}

      {/* Carrusel de Promociones */}
      {promoProducts.length > 0 && (
        <ProductCarousel
          title="🔥 En Promoción"
          products={promoProducts}
          showQuickAdd={true}
        />
      )}

      {/* Carrusel de Ofertas */}
      {offerProducts.length > 0 && (
        <div className="bg-bg-alt">
          <ProductCarousel
            title="💥 Ofertas Especiales"
            products={offerProducts}
            showQuickAdd={true}
          />
        </div>
      )}

      {/* Carrusel de Nuevos Productos */}
      {newProducts.length > 0 && (
        <ProductCarousel
          title="🆕 Productos Nuevos"
          products={newProducts}
          showQuickAdd={true}
        />
      )}

      {/* Promos */}
      {promos.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-display font-bold mb-8 text-center">Promos con bancos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="bg-bg-alt rounded-lg p-6 border-2 border-primary"
              >
                <h3 className="font-display font-bold text-xl mb-2">{promo.title}</h3>
                {promo.subtitle && (
                  <p className="text-text-muted mb-4">{promo.subtitle}</p>
                )}
                {promo.imageUrl && (
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-32 object-cover rounded mt-4"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Branches */}
      <section id="sucursales" className="bg-bg-alt py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold mb-8 text-center">Sucursales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-bg rounded-lg p-6">
              <h3 className="font-display font-bold text-xl mb-4">Rivadavia & Belgrano</h3>
              <p className="text-text-muted mb-2">Belgrano & Rivadavia S2600</p>
              <p className="text-text-muted mb-4">Venado Tuerto, Santa Fe</p>
              <p className="text-text-muted mb-4">Lunes a Sábado: 08:30 a 13:00 y 16:30 a 21:00</p>
              <iframe
                src="https://www.google.com/maps?q=Belgrano+Rivadavia+Venado+Tuerto+Santa+Fe&output=embed"
                className="w-full h-64 rounded"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="bg-bg rounded-lg p-6">
              <h3 className="font-display font-bold text-xl mb-4">Jorge Newbery & Paz</h3>
              <p className="text-text-muted mb-2">Jorge Newbery y Paz</p>
              <p className="text-text-muted mb-4">Venado Tuerto, Santa Fe</p>
              <p className="text-text-muted mb-4">
                Lunes a Sábado: 08:30 a 13:00 y 16:30 a 21:00<br />
                Domingo: 09:00 a 13:00
              </p>
              <iframe
                src="https://www.google.com/maps?q=Jorge+Newbery+Paz+Venado+Tuerto+Santa+Fe&output=embed"
                className="w-full h-64 rounded"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
