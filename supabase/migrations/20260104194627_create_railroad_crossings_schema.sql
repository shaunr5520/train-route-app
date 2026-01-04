/*
  # Create Railroad Crossings Tracking System

  1. New Tables
    - `crossings`
      - `id` (uuid, primary key)
      - `source_id` (text, unique identifier)
      - `name` (text, crossing name/location)
      - `device_type` (text, type of crossing device)
      - `location` (geometry, PostGIS point)
      - `lat` (decimal)
      - `lon` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Extensions
    - Enable PostGIS extension for geospatial queries

  3. Security
    - Enable RLS on `crossings` table
    - Add policy for public read access to crossing data
*/

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS crossings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text UNIQUE NOT NULL,
  name text NOT NULL,
  device_type text,
  location geometry(Point, 4326),
  lat decimal(10, 8) NOT NULL,
  lon decimal(11, 8) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crossings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for crossings"
  ON crossings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_crossings_location ON crossings USING GIST (location);
CREATE INDEX idx_crossings_source_id ON crossings (source_id);
