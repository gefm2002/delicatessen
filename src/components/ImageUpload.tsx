import { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { apiPost } from '../lib/api';
import { supabaseServer } from '../lib/supabaseServerDev';
import Button from './Button';

interface ImageUploadProps {
  images: string[];
  maxImages?: number;
  entityType: 'products' | 'promos' | 'categories';
  entityId?: string;
  onImagesChange: (images: string[]) => void;
}

export default function ImageUpload({
  images,
  maxImages = 3,
  entityType,
  entityId,
  onImagesChange,
}: ImageUploadProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1600;
          const maxHeight = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            0.8
          );
        };
      };
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      showToast(`Máximo ${maxImages} imágenes permitidas`, 'error');
      return;
    }

    setUploading(true);

    try {
      const newImages: string[] = [];

      for (const file of files) {
        // Validar tipo
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
          showToast('Solo se permiten imágenes JPG, PNG o WEBP', 'error');
          continue;
        }

        // Validar tamaño (1.5MB)
        if (file.size > 1572864) {
          showToast('Las imágenes deben ser menores a 1.5MB', 'error');
          continue;
        }

        // Comprimir imagen
        const compressedFile = await compressImage(file);

        // Obtener URL firmada para subir
        let signedUrl: string;
        let path: string;

        if (import.meta.env.DEV) {
          // En desarrollo, usar Supabase directo con service role
          const timestamp = Date.now();
          const extension = 'webp';
          const fileName = `${timestamp}.${extension}`;
          path = `delicatessen/${entityType}/${entityId || timestamp}/${fileName}`;

          // Subir directamente con service role
          const { data: uploadData, error: uploadError } = await supabaseServer.storage
            .from('delicatessen_assets')
            .upload(path, compressedFile, {
              contentType: 'image/webp',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Obtener URL firmada para leer
          const { data: urlData, error: urlError } = await supabaseServer.storage
            .from('delicatessen_assets')
            .createSignedUrl(path, 31536000); // 1 año

          if (urlError) throw urlError;
          if (urlData?.signedUrl) {
            newImages.push(urlData.signedUrl);
          }
          continue; // Skip the upload step below
        } else {
          // En producción, usar Netlify Function
          const response = await apiPost<{ signedUrl: string; path: string; token: string }>(
            '/images-sign-upload',
            {
              fileName: compressedFile.name,
              fileType: 'image/webp',
              fileSize: compressedFile.size,
              entityType,
              entityId,
            }
          );
          signedUrl = response.signedUrl;
          path = response.path;

          // Subir imagen
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: compressedFile,
            headers: {
              'Content-Type': 'image/webp',
            },
          });

          if (!uploadResponse.ok) {
            throw new Error('Error al subir la imagen');
          }

          // Obtener URL firmada para leer
          const urlResponse = await fetch(`/.netlify/functions/images-sign-read?path=${encodeURIComponent(path)}`);
          const urlData = await urlResponse.json();
          if (urlData.signedUrl) {
            newImages.push(urlData.signedUrl);
          }
        }
      }

      onImagesChange([...images, ...newImages]);
      showToast(`${newImages.length} imagen(es) subida(s) correctamente`, 'success');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showToast('Error al subir las imágenes', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemoveImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-text">
        Imágenes (máximo {maxImages})
      </label>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón de subir */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            {uploading ? 'Subiendo...' : `+ Agregar imagen${images.length < maxImages - 1 ? 'es' : ''} (${images.length}/${maxImages})`}
          </Button>
          <p className="text-xs text-text-muted mt-2">
            Formatos: JPG, PNG, WEBP. Máximo 1.5MB por imagen. Se convertirán automáticamente a WEBP.
          </p>
        </div>
      )}
    </div>
  );
}
