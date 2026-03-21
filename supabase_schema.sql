-- ============================================
-- SmartSaathi v2.0 — Database Schema
-- Seniors-only voice-first elderly care app
-- ============================================

-- 1. ENABLE UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (seniors only)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  phone text,
  role text DEFAULT 'senior',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. NOMINEES TABLE (3 per senior — for WhatsApp SOS)
CREATE TABLE IF NOT EXISTS public.nominees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id uuid REFERENCES public.profiles(id) NOT NULL,
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  position int NOT NULL CHECK (position BETWEEN 1 AND 3),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(senior_id, position)
);

-- 4. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL DEFAULT '1 tablet',
  time text NOT NULL DEFAULT '08:00 AM',
  frequency text NOT NULL DEFAULT 'daily',
  status text DEFAULT 'pending',
  taken_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. HYDRATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  amount int NOT NULL DEFAULT 250,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. WELLBEING LOGS TABLE
CREATE TABLE IF NOT EXISTS public.wellbeing_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  mood text NOT NULL DEFAULT 'okay',
  symptoms text,
  notes text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SOS EVENTS TABLE (history of emergency alerts)
CREATE TABLE IF NOT EXISTS public.sos_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  message_sent boolean DEFAULT false
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Nominees
CREATE POLICY "Users can view own nominees" ON public.nominees
  FOR SELECT USING (auth.uid() = senior_id);
CREATE POLICY "Users can insert own nominees" ON public.nominees
  FOR INSERT WITH CHECK (auth.uid() = senior_id);
CREATE POLICY "Users can update own nominees" ON public.nominees
  FOR UPDATE USING (auth.uid() = senior_id);
CREATE POLICY "Users can delete own nominees" ON public.nominees
  FOR DELETE USING (auth.uid() = senior_id);

-- Medications
CREATE POLICY "Users can view own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);

-- Hydration logs
CREATE POLICY "Users can view own hydration" ON public.hydration_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hydration" ON public.hydration_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wellbeing logs
CREATE POLICY "Users can view own wellbeing" ON public.wellbeing_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellbeing" ON public.wellbeing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SOS events
CREATE POLICY "Users can view own sos events" ON public.sos_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sos events" ON public.sos_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
