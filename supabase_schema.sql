-- 1. ENABLE UUIDs
create extension if not exists "uuid-ossp";

-- 2. HELPER FUNCTION (bypasses RLS to prevent infinite recursion in policies)
CREATE OR REPLACE FUNCTION public.get_linked_senior_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT linked_senior_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('senior', 'caregiver')),
  full_name text,
  pairing_code text unique,
  linked_senior_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. HEALTH LOGS
create table public.health_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  bp numeric,
  sugar numeric,
  symptoms text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. MEDICATIONS
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  dose text not null,
  time text not null,
  status text default 'pending'
);

-- 6. VOICE LOGS
create table public.voice_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  command text not null,
  intent text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ALERTS
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  senior_id uuid references public.profiles(id) not null,
  latitude double precision,
  longitude double precision,
  message text,
  is_resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. CONNECTIONS
create table public.connections (
  id uuid default gen_random_uuid() primary key,
  senior_id uuid references public.profiles(id) not null,
  caregiver_id uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'active', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. FAMILY MEMBERS
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  phone text not null,
  relation text,
  avatar_url text,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. ENABLE RLS ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.health_logs enable row level security;
alter table public.medications enable row level security;
alter table public.voice_logs enable row level security;
alter table public.alerts enable row level security;
alter table public.connections enable row level security;
alter table public.family_members enable row level security;

-- 11. RLS POLICIES (using get_linked_senior_id() to avoid recursion)

-- Profiles
create policy "Users can view own or linked profile" on public.profiles
  for select using (auth.uid() = id OR id = public.get_linked_senior_id() OR auth.uid() = linked_senior_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Health Logs
create policy "Seniors and Caregivers view logs" on public.health_logs
  for select using (auth.uid() = user_id OR user_id = public.get_linked_senior_id());
create policy "Insert health logs" on public.health_logs for insert with check (auth.uid() = user_id);

-- Medications
create policy "Seniors and Caregivers view meds" on public.medications
  for select using (auth.uid() = user_id OR user_id = public.get_linked_senior_id());
create policy "Caregivers insert meds" on public.medications
  for insert with check (auth.uid() = user_id OR user_id = public.get_linked_senior_id());
create policy "Users can update own medications" on public.medications
  for update using (auth.uid() = user_id OR user_id = public.get_linked_senior_id());

-- Voice Logs
create policy "Users can view own voice logs" on public.voice_logs for select using (auth.uid() = user_id);
create policy "Users can insert own voice logs" on public.voice_logs for insert with check (auth.uid() = user_id);

-- Alerts
create policy "Seniors can view their own alerts" on public.alerts for select using (auth.uid() = senior_id);
create policy "Caregivers can view alerts of connected seniors" on public.alerts for select using (
  exists (select 1 from connections c where c.senior_id = alerts.senior_id and c.caregiver_id = auth.uid() and c.status = 'active')
);
create policy "Seniors can insert alerts" on public.alerts for insert with check (auth.uid() = senior_id);
create policy "Seniors can update their own alerts" on public.alerts for update using (auth.uid() = senior_id);

-- Connections
create policy "Users can view their connections" on public.connections
  for select using (auth.uid() = senior_id OR auth.uid() = caregiver_id);
create policy "Caregivers can request connection" on public.connections for insert with check (auth.uid() = caregiver_id);
create policy "Seniors can update connection status" on public.connections for update using (auth.uid() = senior_id);

-- Family Members
create policy "Users can view own family members" on public.family_members for select using (auth.uid() = user_id);
create policy "Users can insert family members" on public.family_members for insert with check (auth.uid() = user_id);
create policy "Users can update own family members" on public.family_members for update using (auth.uid() = user_id);
create policy "Users can delete own family members" on public.family_members for delete using (auth.uid() = user_id);
