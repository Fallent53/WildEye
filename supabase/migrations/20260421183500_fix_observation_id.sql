-- Fix ID types from UUID to TEXT to support custom application IDs
ALTER TABLE public.observations ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.species_proposals ALTER COLUMN id TYPE TEXT;

-- Remove the default random uuid since we are using TEXT now
ALTER TABLE public.observations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.species_proposals ALTER COLUMN id DROP DEFAULT;
