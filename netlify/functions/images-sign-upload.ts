import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromToken } from './admin-login';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const admin = getAdminFromToken(event);
  if (!admin) {
    return { statusCode: 401, body: JSON.stringify({ message: 'No autorizado' }) };
  }

  try {
    const { fileName, fileType, fileSize, entityType, entityId } = JSON.parse(event.body || '{}');

    if (!fileName || !fileType || !entityType) {
      return { statusCode: 400, body: JSON.stringify({ message: 'fileName, fileType y entityType requeridos' }) };
    }

    // Validate mime type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(fileType)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Tipo de archivo no permitido' }) };
    }

    // Validate file size (1.5MB)
    if (fileSize > 1572864) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Archivo demasiado grande (máx 1.5MB)' }) };
    }

    // Generate path
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const path = `delicatessen/${entityType}/${entityId || timestamp}/${timestamp}.${extension}`;

    // Generate signed upload URL
    const { data, error } = await supabase.storage
      .from('delicatessen_assets')
      .createSignedUploadUrl(path, {
        upsert: false,
      });

    if (error) {
      console.error('Error creating signed URL:', error);
      return { statusCode: 500, body: JSON.stringify({ message: 'Error al generar URL de subida', error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl: data.signedUrl,
        path,
        token: data.token,
      }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
