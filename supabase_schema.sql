-- 1. ENABLE UUIDs
create extension if not exists "uuid-ossp";

-- 1.5. DROP OLD TABLES TO PREVENT "ALREADY EXISTS" ERRORS (Since this is testing phase)
DROP TABLE IF EXISTS public.voice_logs CASCADE;
DROP TABLE IF EXISTS public.medications CASCADE;
DROP TABLE IF EXISTS public.health_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES TABLE (Stores roles and pairing codes)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('senior', 'caregiver')),
  full_name text,
  pairing_code text unique, -- e.g., '123456' generated for seniors
  linked_senior_id uuid references public.profiles(id), -- caregivers store their senior's ID here
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HEALTH LOGS
create table public.health_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  bp numeric,
  sugar numeric,
  symptoms text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MEDICATIONS
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  dose text not null,
  time text not null,
  status text default 'pending'
);

-- 5. VOICE LOGS (For AI insights)
create table public.voice_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  command text not null,
  intent text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ENABLE SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.health_logs enable row level security;
alter table public.medications enable row level security;
alter table public.voice_logs enable row level security;

-- 7. SECURE RLS POLICIES (Data Sharing)
-- Profiles
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Caregivers can view linked senior" on public.profiles for select using (
  auth.uid() = linked_senior_id OR id = (select linked_senior_id from public.profiles where id = auth.uid())
);

-- Health Logs
create policy "Seniors and Caregivers view logs" on public.health_logs for select using (
  auth.uid() = user_id OR user_id = (select linked_senior_id from public.profiles where id = auth.uid())
);
create policy "Insert health logs" on public.health_logs for insert with check (auth.uid() = user_id);

-- Medications
create policy "Seniors and Caregivers view meds" on public.medications for select using (
  auth.uid() = user_id OR user_id = (select linked_senior_id from public.profiles where id = auth.uid())
);
create policy "Caregivers insert meds" on public.medications for insert with check (
  auth.uid() = user_id OR user_id = (select linked_senior_id from public.profiles where id = auth.uid())
);
