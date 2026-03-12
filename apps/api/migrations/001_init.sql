create table if not exists users (
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists organizations (
  id uuid primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key,
  user_id uuid references users(id),
  org_id uuid references organizations(id),
  role text not null,
  created_at timestamptz default now()
);

create table if not exists refresh_tokens (
  id uuid primary key,
  user_id uuid references users(id),
  token_hash text not null,
  device_info jsonb,
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked boolean default false
);

create table if not exists tenders (
  id uuid primary key,
  external_id text,
  title text,
  category text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists bookmarks (
  id uuid primary key,
  user_id uuid references users(id),
  tender_id uuid references tenders(id),
  created_at timestamptz default now(),
  unique(user_id, tender_id)
);

create table if not exists audit_logs (
  id uuid primary key,
  user_id uuid references users(id) null,
  org_id uuid references organizations(id) null,
  action text not null,
  payload jsonb,
  created_at timestamptz default now()
);
