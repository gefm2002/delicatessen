import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// URLs de imágenes de Unsplash para productos
const productImages: Record<string, string[]> = {
  'jamon-cocido': ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'],
  'jamon-crudo': ['https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80'],
  'salame-milan': ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80'],
  'queso-tybo': ['https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80'],
  'queso-cremoso': ['https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80'],
  'mortadela': ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80'],
  'bondiola': ['https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80'],
  'yerba-mate': ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
  'fideos': ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
  'salsa-tomate': ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
  'aceite-girasol': ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
  'galletitas': ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'],
  'vino-tinto': ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80'],
  'cerveza': ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80'],
  'gaseosa': ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80'],
  'box-gourmet-1': ['https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80'],
  'box-gourmet-2': ['https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80'],
  'box-regalo': ['https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80'],
  'caja-empresarial': ['https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80'],
  'gift-card': ['https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80'],
};

async function main() {
  console.log('🖼️  Agregando imágenes a productos...\n');

  for (const [slug, imageUrls] of Object.entries(productImages)) {
    const { data: product, error: fetchError } = await supabase
      .from('delicatessen_products')
      .select('id, name, images')
      .eq('slug', slug)
      .single();

    if (fetchError || !product) {
      console.warn(`⚠️  Producto no encontrado: ${slug}`);
      continue;
    }

    const currentImages = (product.images as string[]) || [];
    const newImages = [...new Set([...imageUrls, ...currentImages])];

    const { error: updateError } = await supabase
      .from('delicatessen_products')
      .update({ images: newImages })
      .eq('id', product.id);

    if (updateError) {
      console.warn(`⚠️  Error actualizando ${product.name}:`, updateError.message);
    } else {
      console.log(`✓ ${product.name} - ${newImages.length} imagen(es)`);
    }
  }

  console.log('\n✅ Imágenes agregadas a productos!');
}

main().catch(console.error);
