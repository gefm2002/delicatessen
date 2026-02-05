import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Mapeo de productos a imágenes
const productImageMap: Record<string, string[]> = {
  'jamon-cocido': ['jamon-cocido.jpg'],
  'jamon-crudo': ['jamon-crudo.jpg', 'fiambres.jpg'],
  'salame-milan': ['salame.jpg'],
  'queso-tybo': ['queso-tybo.jpg', 'fiambres.jpg'],
  'queso-cremoso': ['queso-cremoso.jpg', 'fiambres.jpg'],
  'mortadela': ['mortadela.jpg'],
  'bondiola': ['bondiola.jpg', 'fiambres.jpg'],
  'yerba-mate': ['yerba.jpg'],
  'fideos': ['fideos.jpg'],
  'salsa-tomate': ['salsa-tomate.jpg'],
  'aceite-girasol': ['aceite.jpg'],
  'galletitas': ['galletitas.jpg'],
  'vino-tinto': ['vino.jpg'],
  'cerveza': ['cerveza.jpg'],
  'gaseosa': ['gaseosa.jpg'],
  'box-gourmet-1': ['box-gourmet-1.jpg', 'boxes.jpg'],
  'box-gourmet-2': ['box-gourmet-2.jpg', 'boxes.jpg'],
  'box-regalo': ['box-regalo.jpg', 'boxes.jpg'],
  'caja-empresarial': ['caja-empresarial.jpg', 'boxes.jpg'],
  'gift-card': ['gift-card.jpg', 'boxes.jpg'],
};

async function uploadImage(filePath: string, storagePath: string): Promise<string | null> {
  try {
    const fileContent = readFileSync(filePath);
    const fileName = storagePath.split('/').pop() || 'image.jpg';
    
    const { data, error } = await supabase.storage
      .from('delicatessen_assets')
      .upload(storagePath, fileContent, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn(`⚠️  Error subiendo ${fileName}:`, error.message);
      return null;
    }

    // Get public URL (signed URL for private bucket)
    const { data: urlData } = await supabase.storage
      .from('delicatessen_assets')
      .createSignedUrl(storagePath, 31536000); // 1 year

    return urlData?.signedUrl || null;
  } catch (error: any) {
    console.warn(`⚠️  Error procesando ${filePath}:`, error.message);
    return null;
  }
}

async function updateProductImages(productSlug: string, imageUrls: string[]) {
  const { data: product, error: fetchError } = await supabase
    .from('delicatessen_products')
    .select('id, images')
    .eq('slug', productSlug)
    .single();

  if (fetchError || !product) {
    console.warn(`⚠️  Producto no encontrado: ${productSlug}`);
    return;
  }

  const currentImages = (product.images as string[]) || [];
  const newImages = [...new Set([...imageUrls, ...currentImages])].filter(Boolean);

  const { error: updateError } = await supabase
    .from('delicatessen_products')
    .update({ images: newImages })
    .eq('id', product.id);

  if (updateError) {
    console.warn(`⚠️  Error actualizando ${productSlug}:`, updateError.message);
  } else {
    console.log(`✓ ${productSlug} - ${newImages.length} imagen(es)`);
  }
}

async function main() {
  console.log('📤 Subiendo imágenes a Supabase...\n');

  const publicImagesPath = join(process.cwd(), 'public', 'images');
  const productsPath = join(publicImagesPath, 'products');
  const categoriesPath = join(publicImagesPath, 'categories');
  const boxesPath = join(publicImagesPath, 'boxes');

  // Upload product images
  console.log('Subiendo imágenes de productos...\n');
  
  for (const [productSlug, imageNames] of Object.entries(productImageMap)) {
    const imageUrls: string[] = [];
    
    for (const imageName of imageNames) {
      // Try products folder first
      let imagePath = join(productsPath, imageName);
      if (!existsSync(imagePath)) {
        // Try categories or boxes
        imagePath = join(categoriesPath, imageName);
        if (!existsSync(imagePath)) {
          imagePath = join(boxesPath, imageName);
        }
      }

      if (existsSync(imagePath)) {
        const storagePath = `delicatessen/products/${productSlug}/${imageName}`;
        const url = await uploadImage(imagePath, storagePath);
        if (url) {
          imageUrls.push(url);
        }
      } else {
        // Use placeholder or default image
        console.log(`  ℹ️  Imagen no encontrada: ${imageName}, usando placeholder`);
      }
    }

    if (imageUrls.length > 0) {
      await updateProductImages(productSlug, imageUrls);
    }
  }

  // Upload category images
  console.log('\nSubiendo imágenes de categorías...\n');
  if (existsSync(categoriesPath)) {
    const categoryImages = readdirSync(categoriesPath).filter(f => f.endsWith('.jpg'));
    for (const imageName of categoryImages) {
      const imagePath = join(categoriesPath, imageName);
      const storagePath = `delicatessen/categories/${imageName}`;
      await uploadImage(imagePath, storagePath);
    }
  }

  // Upload hero image
  console.log('\nSubiendo imagen hero...\n');
  const heroPath = join(publicImagesPath, 'hero', 'hero.jpg');
  if (existsSync(heroPath)) {
    const storagePath = 'delicatessen/hero/hero.jpg';
    await uploadImage(heroPath, storagePath);
  }

  console.log('\n✅ Proceso completado!');
}

main().catch(console.error);
