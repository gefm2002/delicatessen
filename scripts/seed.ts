import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Faltan variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seed() {
  console.log('🌱 Iniciando seed...\n');

  // Categories
  const categories = [
    { name: 'Carnicería', slug: 'carniceria', sort_order: 1 },
    { name: 'Fiambres y Quesos', slug: 'fiambres-quesos', sort_order: 2 },
    { name: 'Boxes y Regalos', slug: 'boxes-regalos', sort_order: 3 },
    { name: 'Panadería y Pastelería', slug: 'panaderia-pasteleria', sort_order: 4 },
    { name: 'Sándwiches y Listo para comer', slug: 'sandwiches-listo', sort_order: 5 },
    { name: 'Bebidas', slug: 'bebidas', sort_order: 6 },
    { name: 'Almacén', slug: 'almacen', sort_order: 7 },
    { name: 'Congelados', slug: 'congelados', sort_order: 8 },
    { name: 'Snacks y Golosinas', slug: 'snacks-golosinas', sort_order: 9 },
  ];

  console.log('Creando categorías...');
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('delicatessen_categories')
      .insert(cat)
      .select()
      .single();
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creando categoría:', cat.name, error);
    } else if (data) {
      categoryMap[cat.slug] = data.id;
      console.log(`✓ ${cat.name}`);
    }
  }

  // Products
  const products = [
    // Weighted
    { name: 'Jamón Cocido', slug: 'jamon-cocido', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 8500, description: 'Jamón cocido premium' },
    { name: 'Jamón Crudo', slug: 'jamon-crudo', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 12000, description: 'Jamón crudo artesanal' },
    { name: 'Salame Milán', slug: 'salame-milan', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 7500, description: 'Salame milán tradicional' },
    { name: 'Queso Tybo', slug: 'queso-tybo', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 6500, description: 'Queso tybo en lonchas' },
    { name: 'Queso Cremoso', slug: 'queso-cremoso', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 5500, description: 'Queso cremoso suave' },
    { name: 'Mortadela', slug: 'mortadela', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 4500, description: 'Mortadela italiana' },
    { name: 'Bondiola', slug: 'bondiola', category_slug: 'fiambres-quesos', product_type: 'weighted', price_per_kg: 9500, description: 'Bondiola ahumada' },
    // Standard
    { name: 'Yerba Mate', slug: 'yerba-mate', category_slug: 'almacen', product_type: 'standard', price: 2500, description: 'Yerba mate 1kg' },
    { name: 'Fideos', slug: 'fideos', category_slug: 'almacen', product_type: 'standard', price: 1200, description: 'Fideos moñito 500g' },
    { name: 'Salsa de Tomate', slug: 'salsa-tomate', category_slug: 'almacen', product_type: 'standard', price: 800, description: 'Salsa de tomate 340g' },
    { name: 'Aceite de Girasol', slug: 'aceite-girasol', category_slug: 'almacen', product_type: 'standard', price: 1800, description: 'Aceite de girasol 900ml' },
    { name: 'Galletitas', slug: 'galletitas', category_slug: 'almacen', product_type: 'standard', price: 1500, description: 'Galletitas surtidas' },
    { name: 'Vino Tinto', slug: 'vino-tinto', category_slug: 'bebidas', product_type: 'standard', price: 3500, description: 'Vino tinto 750ml' },
    { name: 'Cerveza', slug: 'cerveza', category_slug: 'bebidas', product_type: 'standard', price: 1200, description: 'Cerveza lata 473ml' },
    { name: 'Gaseosa', slug: 'gaseosa', category_slug: 'bebidas', product_type: 'standard', price: 1800, description: 'Gaseosa 2.25L' },
    // Combos
    { name: 'Box Gourmet 1', slug: 'box-gourmet-1', category_slug: 'boxes-regalos', product_type: 'combo', price: 15000, description: 'Incluye: Jamón crudo, queso tybo, aceitunas, pan artesanal' },
    { name: 'Box Gourmet 2', slug: 'box-gourmet-2', category_slug: 'boxes-regalos', product_type: 'combo', price: 20000, description: 'Incluye: Variedad de fiambres, quesos, vino, pan' },
    { name: 'Box Regalo', slug: 'box-regalo', category_slug: 'boxes-regalos', product_type: 'combo', price: 25000, description: 'Box premium para regalar' },
    { name: 'Caja Empresarial', slug: 'caja-empresarial', category_slug: 'boxes-regalos', product_type: 'combo', price: 30000, description: 'Ideal para regalos corporativos' },
    { name: 'Gift Card', slug: 'gift-card', category_slug: 'boxes-regalos', product_type: 'combo', price: 10000, description: 'Gift card canjeable' },
  ];

  console.log('\nCreando productos...');
  for (const product of products) {
    const categoryId = categoryMap[product.category_slug];
    if (!categoryId) {
      console.error(`Categoría no encontrada: ${product.category_slug}`);
      continue;
    }

    const productData: any = {
      category_id: categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      product_type: product.product_type,
      is_active: true,
      has_stock: true,
    };

    if (product.product_type === 'weighted') {
      productData.price_per_kg = product.price_per_kg;
    } else {
      productData.price = product.price;
    }

    if (product.product_type === 'combo') {
      productData.is_featured = true;
    }

    const { error } = await supabase
      .from('delicatessen_products')
      .insert(productData);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error creando producto:', product.name, error);
    } else {
      console.log(`✓ ${product.name}`);
    }
  }

  // Promos
  const promos = [
    { title: 'Lunes Jubilados 10%', subtitle: 'Descuento para jubilados', conditions: 'Compras superiores a $10.000' },
    { title: 'Martes Mercado Pago 10%', subtitle: 'Reintegro con Mercado Pago', conditions: '10% reintegro, tope $15.000' },
    { title: 'Miércoles Efectivo 10%', subtitle: 'Descuento en efectivo', conditions: '10% sin tope' },
    { title: 'Miércoles Macro', subtitle: 'Reintegros por cartera', conditions: 'Reintegros según cartera' },
    { title: 'Gift Card 5%', subtitle: 'Descuento en gift cards', conditions: '5% descuento pago anticipado/efectivo' },
  ];

  console.log('\nCreando promos...');
  for (const promo of promos) {
    const { error } = await supabase
      .from('delicatessen_promos')
      .insert({
        title: promo.title,
        subtitle: promo.subtitle,
        conditions: promo.conditions,
        is_active: true,
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error creando promo:', promo.title, error);
    } else {
      console.log(`✓ ${promo.title}`);
    }
  }

  // Branches
  const branches = [
    {
      name: 'Rivadavia & Belgrano',
      address_text: 'Belgrano & Rivadavia S2600 Venado Tuerto, Santa Fe',
      map_query: 'Belgrano+Rivadavia+Venado+Tuerto+Santa+Fe',
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
    },
    {
      name: 'Jorge Newbery & Paz',
      address_text: 'Jorge Newbery y Paz Venado Tuerto Santa Fe',
      map_query: 'Jorge+Newbery+Paz+Venado+Tuerto+Santa+Fe',
      phone: '',
      whatsapp: '',
      hours: {
        monday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        tuesday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        wednesday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        thursday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        friday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        saturday: { open: '08:30', close: '13:00', evening_open: '16:30', evening_close: '21:00' },
        sunday: { open: '09:00', close: '13:00', evening_open: null, evening_close: null },
      },
    },
  ];

  console.log('\nCreando sucursales...');
  for (const branch of branches) {
    const { error } = await supabase
      .from('delicatessen_branches')
      .insert(branch);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error creando sucursal:', branch.name, error);
    } else {
      console.log(`✓ ${branch.name}`);
    }
  }

  // Site Config
  console.log('\nConfigurando sitio...');
  const { error: configError } = await supabase
    .from('delicatessen_site_config')
    .upsert({
      id: '00000000-0000-0000-0000-000000000001',
      brand_name: 'Delicatessen',
      brand_tagline: 'Tu súper de confianza, promos y boxes para regalar',
      whatsapp_number: '',
      currency: 'ARS',
      delivery_options: { pickup: true, delivery: true },
      payment_methods: ['cash', 'transfer', 'mercadopago', 'cards', 'wallets_qr'],
    });

  if (configError && !configError.message.includes('duplicate')) {
    console.error('Error configurando sitio:', configError);
  } else {
    console.log('✓ Configuración del sitio');
  }

  // Admin (password: admin123)
  const adminPasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // sha256 of 'admin123'
  const { error: adminError } = await supabase
    .from('delicatessen_admins')
    .upsert({
      email: 'admin@delicatessen.com',
      password_hash: adminPasswordHash,
      is_active: true,
    });

  if (adminError && !adminError.message.includes('duplicate')) {
    console.error('Error creando admin:', adminError);
  } else {
    console.log('✓ Admin creado (admin@delicatessen.com / admin123)');
  }

  console.log('\n✅ Seed completado!');
}

seed().catch(console.error);
