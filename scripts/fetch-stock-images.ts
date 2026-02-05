import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import https from 'https';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

const images = [
  { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80', name: 'hero.jpg', folder: 'hero' }, // Supermercado boutique con góndolas
  { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80', name: 'carniceria.jpg', folder: 'categories' },
  { url: 'https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=1600&q=80', name: 'fiambres.jpg', folder: 'categories' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=1600&q=80', name: 'boxes.jpg', folder: 'boxes' },
  { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80', name: 'panaderia.jpg', folder: 'categories' },
  { url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1600&q=80', name: 'bebidas.jpg', folder: 'categories' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', name: 'jamon-cocido.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80', name: 'jamon-crudo.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', name: 'salame.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80', name: 'queso-tybo.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80', name: 'queso-cremoso.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80', name: 'mortadela.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1618164436269-1d673d65f993?w=800&q=80', name: 'bondiola.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', name: 'yerba.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', name: 'fideos.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', name: 'salsa-tomate.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', name: 'aceite.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', name: 'galletitas.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80', name: 'vino.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80', name: 'cerveza.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80', name: 'gaseosa.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80', name: 'box-gourmet-1.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80', name: 'box-gourmet-2.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80', name: 'box-regalo.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80', name: 'caja-empresarial.jpg', folder: 'products' },
  { url: 'https://images.unsplash.com/photo-1604719312566-8912e92277c6?w=800&q=80', name: 'gift-card.jpg', folder: 'products' },
];

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('📥 Descargando imágenes de stock...\n');

  const publicPath = join(process.cwd(), 'public', 'images');

  for (const img of images) {
    const folderPath = join(publicPath, img.folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const filepath = join(folderPath, img.name);
    try {
      console.log(`Descargando ${img.name}...`);
      await downloadImage(img.url, filepath);
      console.log(`✓ ${img.name}`);
    } catch (error: any) {
      console.error(`✗ Error descargando ${img.name}:`, error.message);
    }
  }

  console.log('\n✅ Descarga completada!');
  console.log('Las imágenes están en public/images/');
}

main().catch(console.error);
