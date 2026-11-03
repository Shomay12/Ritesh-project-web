-- =====================================================================
--  Photography studio — Supabase schema
--  Run this whole file once in Supabase: SQL Editor -> New query -> Run.
--  It is safe to re-run; objects are created only if missing.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  Profiles & roles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'client' check (role in ('owner', 'client')),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users that existed before this script ran
insert into public.profiles (id, email)
select id, lower(email) from auth.users
on conflict (id) do nothing;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function public.jwt_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- ---------------------------------------------------------------------
--  Bookings (enquiries from the booking page)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  reference         text unique not null,
  created_at        timestamptz not null default now(),
  name              text not null,
  email             text not null,
  phone             text,
  session_type      text not null,
  package           text,
  event_date        date,
  event_time        text,
  location          text,
  guest_count       integer,
  budget            text,
  referral          text,
  message           text,
  status            text not null default 'new'
                    check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  deposit_paid      boolean not null default false,
  quoted_amount     numeric(12, 2),
  internal_notes    text,
  confirmed_at      timestamptz,
  reminder_sent_at  timestamptz,
  followup_sent_at  timestamptz
);
create index if not exists bookings_event_date_idx on public.bookings (event_date);
create index if not exists bookings_status_idx on public.bookings (status);

-- ---------------------------------------------------------------------
--  Contact messages
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean not null default false
);

-- ---------------------------------------------------------------------
--  Public portfolio
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_items (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text not null,
  category     text not null default 'Weddings',
  location     text,
  year         integer,
  description  text,
  image_path   text not null,
  thumb_path   text,
  width        integer,
  height       integer,
  sort_order   integer not null default 0,
  featured     boolean not null default false,
  published    boolean not null default true
);
create index if not exists portfolio_sort_idx on public.portfolio_items (sort_order);

-- ---------------------------------------------------------------------
--  Private client galleries
-- ---------------------------------------------------------------------
create table if not exists public.galleries (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  title                  text not null,
  client_name            text,
  client_email           text not null,
  event_date             date,
  booking_id             uuid references public.bookings (id) on delete set null,
  cover_photo_id         uuid,
  note                   text,
  status                 text not null default 'draft'
                         check (status in ('draft', 'published', 'archived')),
  allow_download         boolean not null default true,
  expires_at             timestamptz,
  published_at           timestamptz,
  notified_at            timestamptz,
  expiry_notice_sent_at  timestamptz
);
create index if not exists galleries_client_email_idx on public.galleries (lower(client_email));

create table if not exists public.gallery_photos (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  gallery_id     uuid not null references public.galleries (id) on delete cascade,
  filename       text not null,
  original_path  text not null,
  preview_path   text,
  thumb_path     text,
  width          integer,
  height         integer,
  size_bytes     bigint,
  sort_order     integer not null default 0
);
create index if not exists gallery_photos_gallery_idx on public.gallery_photos (gallery_id, sort_order);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'galleries_cover_photo_fk') then
    alter table public.galleries
      add constraint galleries_cover_photo_fk
      foreign key (cover_photo_id) references public.gallery_photos (id) on delete set null;
  end if;
end $$;

create table if not exists public.favorites (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  gallery_id    uuid not null references public.galleries (id) on delete cascade,
  photo_id      uuid not null references public.gallery_photos (id) on delete cascade,
  client_email  text not null default public.jwt_email(),
  unique (photo_id, client_email)
);

create table if not exists public.downloads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  gallery_id    uuid not null references public.galleries (id) on delete cascade,
  photo_id      uuid references public.gallery_photos (id) on delete set null,
  client_email  text not null default public.jwt_email(),
  kind          text not null default 'single' check (kind in ('single', 'zip'))
);

-- ---------------------------------------------------------------------
--  Availability (dates the owner has blocked)
-- ---------------------------------------------------------------------
create table if not exists public.availability_blocks (
  id          uuid primary key default gen_random_uuid(),
  day         date unique not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Public calendar: returns only dates, never booking details
create or replace function public.get_unavailable_dates(from_date date, to_date date)
returns table (day date) language sql stable security definer set search_path = public as $$
  select b.day from public.availability_blocks b
   where b.day between from_date and to_date
  union
  select k.event_date from public.bookings k
   where k.status = 'confirmed' and k.event_date between from_date and to_date;
$$;
grant execute on function public.get_unavailable_dates(date, date) to anon, authenticated;
grant execute on function public.is_owner() to authenticated;

-- =====================================================================
--  Row Level Security
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.bookings            enable row level security;
alter table public.messages            enable row level security;
alter table public.portfolio_items     enable row level security;
alter table public.galleries           enable row level security;
alter table public.gallery_photos      enable row level security;
alter table public.favorites           enable row level security;
alter table public.downloads           enable row level security;
alter table public.availability_blocks enable row level security;

-- Helper to drop & recreate policies so the file can be re-run
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
     where schemaname = 'public'
       and tablename in ('profiles','bookings','messages','portfolio_items','galleries',
                         'gallery_photos','favorites','downloads','availability_blocks')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- profiles
create policy "read own profile"   on public.profiles for select to authenticated using (id = auth.uid() or public.is_owner());
create policy "owner edits profiles" on public.profiles for update to authenticated using (public.is_owner());

-- bookings: anyone may submit, only the owner reads or changes
create policy "public can request booking" on public.bookings for insert to anon, authenticated
  with check (status = 'new' and deposit_paid = false and internal_notes is null and quoted_amount is null);
create policy "owner reads bookings"   on public.bookings for select to authenticated using (public.is_owner());
create policy "owner updates bookings" on public.bookings for update to authenticated using (public.is_owner());
create policy "owner deletes bookings" on public.bookings for delete to authenticated using (public.is_owner());

-- messages
create policy "public can send message" on public.messages for insert to anon, authenticated with check (is_read = false);
create policy "owner reads messages"   on public.messages for select to authenticated using (public.is_owner());
create policy "owner updates messages" on public.messages for update to authenticated using (public.is_owner());
create policy "owner deletes messages" on public.messages for delete to authenticated using (public.is_owner());

-- portfolio
create policy "public reads published work" on public.portfolio_items for select to anon, authenticated
  using (published or public.is_owner());
create policy "owner writes work" on public.portfolio_items for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- galleries
create policy "client reads own galleries" on public.galleries for select to authenticated
  using (
    public.is_owner()
    or (lower(client_email) = public.jwt_email()
        and status = 'published'
        and (expires_at is null or expires_at > now()))
  );
create policy "owner writes galleries" on public.galleries for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- gallery photos
create policy "client reads own photos" on public.gallery_photos for select to authenticated
  using (
    public.is_owner()
    or exists (
      select 1 from public.galleries g
       where g.id = gallery_id
         and lower(g.client_email) = public.jwt_email()
         and g.status = 'published'
         and (g.expires_at is null or g.expires_at > now())
    )
  );
create policy "owner writes photos" on public.gallery_photos for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- favourites
create policy "client manages own favourites" on public.favorites for all to authenticated
  using (client_email = public.jwt_email() or public.is_owner())
  with check (
    client_email = public.jwt_email()
    and exists (select 1 from public.galleries g
                 where g.id = gallery_id and lower(g.client_email) = public.jwt_email()
                   and g.status = 'published')
  );

-- download log
create policy "client logs downloads" on public.downloads for insert to authenticated
  with check (
    client_email = public.jwt_email()
    and exists (select 1 from public.galleries g
                 where g.id = gallery_id and lower(g.client_email) = public.jwt_email()
                   and g.allow_download)
  );
create policy "owner reads downloads" on public.downloads for select to authenticated using (public.is_owner());

-- availability
create policy "public reads blocks" on public.availability_blocks for select to anon, authenticated using (true);
create policy "owner writes blocks" on public.availability_blocks for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- =====================================================================
--  Storage
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true), ('client-galleries', 'client-galleries', false)
on conflict (id) do nothing;

drop policy if exists "portfolio public read"   on storage.objects;
drop policy if exists "portfolio owner insert"  on storage.objects;
drop policy if exists "portfolio owner update"  on storage.objects;
drop policy if exists "portfolio owner delete"  on storage.objects;
drop policy if exists "galleries owner all"     on storage.objects;
drop policy if exists "galleries client read"   on storage.objects;

create policy "portfolio public read"  on storage.objects for select using (bucket_id = 'portfolio');
create policy "portfolio owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_owner());
create policy "portfolio owner update" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and public.is_owner());
create policy "portfolio owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_owner());

create policy "galleries owner all" on storage.objects for all to authenticated
  using (bucket_id = 'client-galleries' and public.is_owner())
  with check (bucket_id = 'client-galleries' and public.is_owner());

-- Clients can read files inside their own gallery folder:  <gallery_id>/<thumbs|previews|originals>/file
-- Originals are only readable when the gallery allows downloads.
create policy "galleries client read" on storage.objects for select to authenticated
  using (
    bucket_id = 'client-galleries'
    and exists (
      select 1 from public.galleries g
       where g.id::text = (storage.foldername(name))[1]
         and lower(g.client_email) = public.jwt_email()
         and g.status = 'published'
         and (g.expires_at is null or g.expires_at > now())
         and ((storage.foldername(name))[2] <> 'originals' or g.allow_download)
    )
  );

-- =====================================================================
--  LAST STEP — make yourself the owner (replace the email, then run):
--
--    update public.profiles set role = 'owner' where email = 'you@yourstudio.com';
--
-- =====================================================================

