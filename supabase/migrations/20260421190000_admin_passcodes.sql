-- Admin passcodes are verified server-side only.
-- Store PBKDF2 hashes here, never plaintext passcodes.

CREATE TABLE IF NOT EXISTS public.admin_passcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT 'primary',
  passcode_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  iterations INTEGER NOT NULL DEFAULT 210000,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_passcodes ENABLE ROW LEVEL SECURITY;

-- No public RLS policy: only the server-side service role should read this table.

DROP POLICY IF EXISTS "Admin full access" ON public.observations;
DROP POLICY IF EXISTS "Admin manage proposals" ON public.species_proposals;
