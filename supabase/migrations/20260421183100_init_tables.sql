-- Initial schema for WildEye observations and proposals

-- 1. Observations Table
CREATE TABLE IF NOT EXISTS public.observations (
    id TEXT PRIMARY KEY,
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    category TEXT NOT NULL CHECK (category IN ('cristal', 'faune', 'flore')),
    species_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude_blurred DOUBLE PRECISION NOT NULL,
    latitude_blurred DOUBLE PRECISION NOT NULL,
    photo_url TEXT,
    user_id TEXT DEFAULT 'local-user',
    source_name TEXT DEFAULT 'Contribution locale',
    source_kind TEXT DEFAULT 'local',
    observer_name TEXT DEFAULT 'Anonyme',
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
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    moderation_note TEXT,
    wiki_url TEXT,
    
    -- Specific for Minerals (cristal)
    crystal_system TEXT,
    luster TEXT,
    hardness TEXT,
    associated_minerals TEXT
);

-- Index for spatial filtering/searching
CREATE INDEX IF NOT EXISTS idx_obs_category ON public.observations(category);
CREATE INDEX IF NOT EXISTS idx_obs_observed_at ON public.observations(observed_at);

-- 2. Species Proposals Table
CREATE TABLE IF NOT EXISTS public.species_proposals (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    proposed_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cristal', 'faune', 'flore')),
    note TEXT,
    nearby_existing_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'merged', 'rejected')),
    submitted_by TEXT DEFAULT 'local-user'
);

-- RLS (Row Level Security)
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_proposals ENABLE ROW LEVEL SECURITY;

-- Policies for Observations
CREATE POLICY "Public read access for public observations" 
ON public.observations FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Anonymous insert access for everyone" 
ON public.observations FOR INSERT 
WITH CHECK (true);

-- Admin policies (using a simple condition for now, can be improved with Supabase Auth)
-- For the demo, we assume the Service Role or a specific condition allows management
CREATE POLICY "Admin full access" 
ON public.observations FOR ALL 
USING (true)
WITH CHECK (true);

-- Policies for Proposals
CREATE POLICY "Public read all proposals" 
ON public.species_proposals FOR SELECT 
USING (true);

CREATE POLICY "Public insert proposals" 
ON public.species_proposals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin manage proposals" 
ON public.species_proposals FOR ALL 
USING (true)
WITH CHECK (true);
