-- ============================================================
-- SafeLine — Migration initiale
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Organizations
-- ============================================================
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  siret text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'team')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Organization Members
-- ============================================================
create table if not exists organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_email text,
  invite_token text unique,
  joined_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

-- ============================================================
-- Profiles
-- ============================================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  current_organization_id uuid references organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Equipment Types (référentiel légal)
-- ============================================================
create table if not exists equipment_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  max_lifetime_years integer,        -- depuis date fabrication (null = pas de limite fixe)
  max_use_lifetime_years integer,    -- depuis mise en service (null = pas de limite fixe)
  inspection_interval_months integer not null default 12,
  norm_reference text not null,
  retire_after_fall boolean not null default false,
  description text
);

-- ============================================================
-- Equipment
-- ============================================================
create table if not exists equipment (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  equipment_type_id uuid not null references equipment_types(id),
  brand text not null,
  model text not null,
  serial_number text,
  manufacture_date date,
  purchase_date date,
  first_use_date date,
  purchase_price numeric(10,2),
  status text not null default 'ok' check (status in ('ok', 'inspect_soon', 'to_replace', 'retired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Invoices
-- ============================================================
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  equipment_id uuid references equipment(id) on delete set null,
  file_url text not null,
  filename text not null,
  amount numeric(10,2),
  invoice_date date,
  supplier text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Inspections
-- ============================================================
create table if not exists inspections (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  inspection_date date not null,
  result text not null check (result in ('passed', 'failed', 'conditional')),
  inspector_name text,
  next_inspection_date date,
  certificate_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Alerts
-- ============================================================
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  equipment_id uuid not null references equipment(id) on delete cascade,
  alert_type text not null check (alert_type in ('expiration', 'inspection', 'training')),
  due_date date not null,
  sent_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Regulations
-- ============================================================
create table if not exists regulations (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  applicable_norm text,
  equipment_category text,
  last_updated date not null default current_date,
  source_url text
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table profiles enable row level security;
alter table equipment enable row level security;
alter table invoices enable row level security;
alter table inspections enable row level security;
alter table alerts enable row level security;

-- Profiles : lecture/écriture uniquement son propre profil
create policy "profiles_own" on profiles
  for all using (auth.uid() = user_id);

-- Organizations : owner + membres
create policy "organizations_member_read" on organizations
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from organization_members
      where organization_id = organizations.id and user_id = auth.uid()
    )
  );

create policy "organizations_owner_write" on organizations
  for all using (auth.uid() = owner_id);

-- Organization members
create policy "org_members_read" on organization_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from organizations
      where id = organization_id and owner_id = auth.uid()
    )
  );

create policy "org_members_owner_manage" on organization_members
  for all using (
    exists (
      select 1 from organizations
      where id = organization_id and owner_id = auth.uid()
    )
  );

-- Equipment : propriétaire ou admin/owner de l'org
create policy "equipment_owner_read" on equipment
  for select using (
    user_id = auth.uid()
    or (
      organization_id is not null
      and exists (
        select 1 from organization_members om
        where om.organization_id = equipment.organization_id
          and om.user_id = auth.uid()
          and om.role in ('owner', 'admin')
      )
    )
  );

create policy "equipment_owner_write" on equipment
  for all using (user_id = auth.uid());

-- Invoices
create policy "invoices_owner" on invoices
  for all using (user_id = auth.uid());

-- Inspections
create policy "inspections_owner" on inspections
  for all using (user_id = auth.uid());

-- Alerts
create policy "alerts_owner" on alerts
  for all using (user_id = auth.uid());

-- Equipment types et regulations : lecture publique (pas d'auth requise)
alter table equipment_types enable row level security;
alter table regulations enable row level security;
create policy "equipment_types_public_read" on equipment_types for select using (true);
create policy "regulations_public_read" on regulations for select using (true);
