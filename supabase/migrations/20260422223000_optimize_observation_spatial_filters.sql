-- Lightweight indexes for bbox-based observation loading.

CREATE INDEX IF NOT EXISTS idx_external_obs_visible_time_category_coords
ON public.external_observations(
  visibility,
  observed_at DESC,
  category,
  latitude_blurred,
  longitude_blurred
);

CREATE INDEX IF NOT EXISTS idx_observations_public_time_category_coords
ON public.observations(
  visibility,
  observed_at DESC,
  category,
  latitude_blurred,
  longitude_blurred
);
