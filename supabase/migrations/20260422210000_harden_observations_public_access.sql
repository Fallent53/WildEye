-- Harden public observation access.
-- The browser must never read exact coordinates from public.observations.

DROP POLICY IF EXISTS "Public read access for public observations" ON public.observations;
DROP POLICY IF EXISTS "Anonymous insert access for everyone" ON public.observations;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'observations_created_at_not_before_observed_at'
      AND conrelid = 'public.observations'::regclass
  ) THEN
    ALTER TABLE public.observations
      ADD CONSTRAINT observations_created_at_not_before_observed_at
      CHECK (created_at >= observed_at) NOT VALID;
  END IF;
END $$;

DROP VIEW IF EXISTS public.public_observations;

CREATE VIEW public.public_observations AS
SELECT
  id,
  observed_at,
  created_at,
  category,
  species_name,
  description,
  longitude_blurred AS longitude,
  latitude_blurred AS latitude,
  longitude_blurred,
  latitude_blurred,
  photo_url,
  md5(user_id) AS owner_ref,
  source_name,
  source_kind,
  observer_name,
  location_name,
  common_name,
  scientific_name,
  taxon_rank,
  taxon_class,
  taxon_order,
  animal_group,
  animal_emoji,
  taxon_emoji,
  habitat_hint,
  activity_hint,
  sensitivity_label,
  family,
  quality_label,
  verification_label,
  external_id,
  visibility,
  privacy_level,
  is_anonymous,
  verification_status,
  moderation_note,
  wiki_url,
  crystal_system,
  luster,
  hardness,
  associated_minerals
FROM public.observations
WHERE visibility = 'public';

GRANT SELECT ON public.public_observations TO anon, authenticated;
