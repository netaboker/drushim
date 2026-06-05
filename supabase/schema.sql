-- ─── Users ────────────────────────────────────────────────────────────────────
create table if not exists users (
  id text primary key,
  name text not null,
  role text not null check (role in ('student', 'teacher', 'staff', 'admin')),
  class text,
  position text,
  avatar_initials text not null,
  avatar_color text not null,
  points integer not null default 0,
  rank text not null default 'מתחיל/ה',
  joined_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- ─── Help Requests ────────────────────────────────────────────────────────────
create table if not exists help_requests (
  id text primary key,
  title text not null,
  category text not null,
  description text not null,
  target_audience text not null,
  "when" text not null,
  status text not null default 'פתוח',
  urgency text not null default 'בינונית',
  helpers_needed integer not null default 1,
  assigned_helper_ids text[] not null default '{}',
  volunteer_ids text[] not null default '{}',
  created_by_id text not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  requires_staff_approval boolean not null default false,
  contact_person text not null,
  approval_status text not null default 'pending',
  admin_note text
);

-- ─── Request Updates ──────────────────────────────────────────────────────────
create table if not exists request_updates (
  id text primary key,
  request_id text not null references help_requests(id) on delete cascade,
  text text not null,
  author_id text not null references users(id),
  created_at timestamptz not null default now(),
  is_staff_note boolean not null default false
);

-- ─── Helper Profiles ──────────────────────────────────────────────────────────
create table if not exists helper_profiles (
  id text primary key,
  user_id text not null references users(id),
  skills text[] not null default '{}',
  availability text not null,
  bio text not null,
  categories text[] not null default '{}',
  is_approved boolean not null default false,
  help_count integer not null default 0,
  approval_status text not null default 'pending',
  admin_note text,
  submitted_at timestamptz not null default now()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
create table if not exists notifications (
  id text primary key,
  recipient_id text not null references users(id),
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  related_id text,
  related_type text,
  admin_note text
);

-- ─── Points Events ────────────────────────────────────────────────────────────
create table if not exists points_events (
  id text primary key,
  user_id text not null references users(id),
  points integer not null,
  reason text not null,
  event_type text not null,
  created_at timestamptz not null default now(),
  related_request_id text
);

-- ─── RLS (Row Level Security) — open for now ─────────────────────────────────
alter table users enable row level security;
alter table help_requests enable row level security;
alter table request_updates enable row level security;
alter table helper_profiles enable row level security;
alter table notifications enable row level security;
alter table points_events enable row level security;

drop policy if exists "allow all users" on users;
drop policy if exists "allow all help_requests" on help_requests;
drop policy if exists "allow all request_updates" on request_updates;
drop policy if exists "allow all helper_profiles" on helper_profiles;
drop policy if exists "allow all notifications" on notifications;
drop policy if exists "allow all points_events" on points_events;

create policy "allow all users" on users for all using (true) with check (true);
create policy "allow all help_requests" on help_requests for all using (true) with check (true);
create policy "allow all request_updates" on request_updates for all using (true) with check (true);
create policy "allow all helper_profiles" on helper_profiles for all using (true) with check (true);
create policy "allow all notifications" on notifications for all using (true) with check (true);
create policy "allow all points_events" on points_events for all using (true) with check (true);
