import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || '');
    const path = params.get('path');

    if (!path) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Path requerido' }) };
    }

    // Generate signed read URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('delicatessen_assets')
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return { statusCode: 500, body: JSON.stringify({ message: 'Error al generar URL', error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl: data.signedUrl }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor', error: error.message }),
    };
  }
};
