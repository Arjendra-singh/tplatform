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


create table if not exists document_folders (
  id uuid primary key,
  org_id uuid references organizations(id),
  name text not null,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists document_files (
  id uuid primary key,
  org_id uuid references organizations(id),
  folder_id uuid references document_folders(id),
  name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists document_file_versions (
  id uuid primary key,
  file_id uuid references document_files(id),
  version int not null,
  storage_key text not null,
  checksum text,
  size_bytes bigint not null,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  unique(file_id, version)
);


create table if not exists document_processing_jobs (
  id uuid primary key,
  org_id uuid references organizations(id),
  file_id uuid references document_files(id),
  stage text not null,
  status text not null,
  result text,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_conversations (
  id uuid primary key,
  org_id uuid references organizations(id),
  user_id uuid references users(id),
  prompt text not null,
  answer text not null,
  context jsonb,
  created_at timestamptz default now()
);

create table if not exists ai_usage_daily (
  id uuid primary key,
  org_id uuid references organizations(id),
  date_key text not null,
  request_count int not null default 0,
  unique(org_id, date_key)
);
