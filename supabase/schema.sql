-- HGC website redesign demo schema (project: uvtqofsjyzwfoifxsnhu)
-- All objects namespaced hgc_* to coexist with other apps' tables.

-- Notices / announcements board
create table if not exists public.hgc_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  published_date date not null default current_date,
  file_url text,
  is_new boolean not null default true,
  created_at timestamptz not null default now()
);

-- Departments directory
create table if not exists public.hgc_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  stream text not null,               -- Arts | Science | Commerce
  hod text,
  programs text not null default '',
  about text not null default ''
);

-- Contact / enquiry form submissions (insert-only from the public site)
create table if not exists public.hgc_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null default 'General enquiry',
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.hgc_notices enable row level security;
alter table public.hgc_departments enable row level security;
alter table public.hgc_messages enable row level security;

drop policy if exists "public read notices" on public.hgc_notices;
create policy "public read notices" on public.hgc_notices
  for select using (true);

drop policy if exists "public read departments" on public.hgc_departments;
create policy "public read departments" on public.hgc_departments
  for select using (true);

drop policy if exists "public insert messages" on public.hgc_messages;
create policy "public insert messages" on public.hgc_messages
  for insert with check (true);

-- Seed departments (13 departments of Haflong Govt. College)
insert into public.hgc_departments (name, stream, programs, about) values
  ('Assamese', 'Arts', 'FYUG Major / Minor', 'Language, literature and culture of Assam.'),
  ('Bengali', 'Arts', 'FYUG Major / Minor', 'Bengali language and literature.'),
  ('English', 'Arts', 'FYUG Major / Minor', 'English language and literature.'),
  ('Economics', 'Arts', 'FYUG Major / Minor', 'Economic theory and applied economics.'),
  ('History', 'Arts', 'FYUG Major / Minor', 'Indian and world history.'),
  ('Philosophy', 'Arts', 'FYUG Major / Minor', 'Indian and Western philosophy.'),
  ('Political Science', 'Arts', 'FYUG Major / Minor', 'Political theory, Indian polity and governance.'),
  ('Physics', 'Science', 'FYUG Major / Minor', 'Classical and modern physics with laboratory work.'),
  ('Chemistry', 'Science', 'FYUG Major / Minor', 'Physical, organic and inorganic chemistry with labs.'),
  ('Mathematics', 'Science', 'FYUG Major / Minor', 'Pure and applied mathematics.'),
  ('Botany', 'Science', 'FYUG Major / Minor', 'Plant sciences with field and lab work.'),
  ('Zoology', 'Science', 'FYUG Major / Minor', 'Animal sciences with lab work.'),
  ('Commerce', 'Commerce', 'FYUG Major / Minor', 'Accounting, business studies and commerce.')
on conflict (name) do nothing;

-- Sample demo notices (clearly demo content for the showcase)
insert into public.hgc_notices (title, category, published_date, is_new) values
  ('Admissions open: FYUG 1st Semester 2026-27 (Arts, Science & Commerce)', 'Admission', current_date, true),
  ('IQAC meeting: feedback invited from students and alumni', 'IQAC', current_date - 2, true),
  ('Central library: new arrivals shelf updated for this month', 'Library', current_date - 6, false)
on conflict do nothing;
