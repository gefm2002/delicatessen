import { createClient } from '@supabase/supabase-js';
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

async function main() {
  console.log('📍 Actualizando direcciones de sucursales...\n');

  // Actualizar Rivadavia & Belgrano
  const { data: branch1, error: error1 } = await supabase
    .from('delicatessen_branches')
    .update({
      name: 'Rivadavia & Belgrano',
      address_text: 'Belgrano & Rivadavia S2600 Venado Tuerto, Santa Fe',
      map_query: 'Belgrano+Rivadavia+Venado+Tuerto+Santa+Fe',
    })
    .eq('name', 'Rivadavia & Belgrano')
    .select()
    .single();

  if (error1) {
    console.error('Error actualizando Rivadavia & Belgrano:', error1.message);
  } else {
    console.log('✓ Rivadavia & Belgrano actualizada');
    console.log(`  Dirección: ${branch1?.address_text}`);
  }

  // Actualizar Jorge Newbery & Paz
  const { data: branch2, error: error2 } = await supabase
    .from('delicatessen_branches')
    .update({
      name: 'Jorge Newbery & Paz',
      address_text: 'Jorge Newbery y Paz Venado Tuerto Santa Fe',
      map_query: 'Jorge+Newbery+Paz+Venado+Tuerto+Santa+Fe',
    })
    .eq('name', 'Jorge Newbery & Paz')
    .select()
    .single();

  if (error2) {
    console.error('Error actualizando Jorge Newbery & Paz:', error2.message);
  } else {
    console.log('✓ Jorge Newbery & Paz actualizada');
    console.log(`  Dirección: ${branch2?.address_text}`);
  }

  console.log('\n✅ Sucursales actualizadas!');
}

main().catch(console.error);
