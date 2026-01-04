import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCrossings() {
  try {
    const csvPath = path.join(__dirname, '../sample_crossings.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    const crossings = lines.slice(1).map(line => {
      const [source_id, name, device_type, lat, lon] = line.split(',');
      return {
        source_id: source_id.trim(),
        name: name.trim(),
        device_type: device_type.trim(),
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    }).filter(c => c.source_id);

    console.log(`Importing ${crossings.length} crossings...`);

    for (const crossing of crossings) {
      const { error } = await supabase
        .from('crossings')
        .insert([crossing])
        .select();

      if (error) {
        console.log(`Skipping ${crossing.source_id} (may already exist)`);
      } else {
        console.log(`Imported: ${crossing.source_id}`);
      }
    }

    console.log('Import complete!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importCrossings();
