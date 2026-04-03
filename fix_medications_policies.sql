-- Fix stale RLS policies on public.medications.
-- Use this in the Supabase SQL Editor for projects where reads fail with:
--   column "linked_senior_id" does not exist

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'medications'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.medications',
      policy_record.policyname
    );
  END LOOP;
END $$;

CREATE POLICY "Users can view own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);
