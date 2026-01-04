import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

app.get('/api/crossings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('crossings')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crossings/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon required' });
    }

    const { data, error } = await supabase.rpc('nearby_crossings', {
      user_lat: parseFloat(lat),
      user_lon: parseFloat(lon),
      radius_meters: parseInt(radius),
    });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crossings/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('crossings')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crossings', async (req, res) => {
  try {
    const { source_id, name, device_type, lat, lon } = req.body;

    const { data, error } = await supabase
      .from('crossings')
      .insert([{
        source_id,
        name,
        device_type,
        lat,
        lon,
        location: `POINT(${lon} ${lat})`,
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Railroad Crossings API running on port ${port}`);
});