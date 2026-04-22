-- Local cache for trusted external observations.
-- This avoids fetching GBIF/iNaturalist/OBIS from every browser session.

CREATE TABLE IF NOT EXISTS public.external_observations (
  id TEXT PRIMARY KEY,
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cristal', 'faune', 'flore')),
  species_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  longitude DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude_blurred DOUBLE PRECISION NOT NULL,
  latitude_blurred DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  user_id TEXT,
  source_name TEXT,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('gbif', 'inaturalist', 'obis', 'reference')),
  observer_name TEXT,
  location_name TEXT,
  common_name TEXT,
  scientific_name TEXT,
  taxon_rank TEXT,
  taxon_class TEXT,
  taxon_order TEXT,
  animal_group TEXT,
  animal_emoji TEXT,
  taxon_emoji TEXT,
  habitat_hint TEXT,
  activity_hint TEXT,
  sensitivity_label TEXT,
  family TEXT,
  quality_label TEXT,
  verification_label TEXT,
  external_id TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('standard', 'protected')),
  is_anonymous BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  moderation_note TEXT,
  wiki_url TEXT,
  crystal_system TEXT,
  luster TEXT,
  hardness TEXT,
  associated_minerals TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (created_at >= observed_at)
);

ALTER TABLE public.external_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cached external observations" ON public.external_observations;
CREATE POLICY "Public read cached external observations"
ON public.external_observations FOR SELECT
USING (visibility = 'public');

CREATE INDEX IF NOT EXISTS idx_external_obs_observed_at
ON public.external_observations(observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_obs_category
ON public.external_observations(category);

CREATE INDEX IF NOT EXISTS idx_external_obs_source_kind
ON public.external_observations(source_kind);
