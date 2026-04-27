-- campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  brand_name text not null,
  banner_image_url text,
  join_type text not null check (join_type in ('instant','approval')) default 'instant',
  status text not null check (status in ('draft','active','paused','ended')) default 'draft',
  eligibility_type text not null check (eligibility_type in ('open','restricted')) default 'open',
  eligibility_criteria jsonb,
  commission_type text not null check (commission_type in ('percentage','flat')) default 'flat',
  commission_value numeric not null default 0,
  commission_per text not null check (commission_per in ('sale','lead','activation')) default 'sale',
  start_date timestamptz,
  end_date timestamptz,
  assets jsonb default '[]'::jsonb,
  tracking_link_base text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table campaigns enable row level security;

create policy "Sellers can read non-draft campaigns" on campaigns
  for select using (status in ('active','paused','ended'));

create policy "Admins can do everything on campaigns" on campaigns
  for all using (true);

-- campaign_memberships table
create table campaign_memberships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  tracking_link text,
  joined_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  rejection_note text,
  unique (campaign_id, seller_id)
);

alter table campaign_memberships enable row level security;

create policy "Sellers can see own memberships" on campaign_memberships
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Sellers can insert own memberships" on campaign_memberships
  for insert with check (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all memberships" on campaign_memberships
  for all using (true);

-- campaign_submissions table
create table campaign_submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  membership_id uuid not null references campaign_memberships(id),
  submission_type text not null check (submission_type in ('manual','tracked')) default 'manual',
  amount numeric not null default 0,
  evidence_url text,
  notes text,
  status text not null check (status in ('pending_review','approved','rejected')) default 'pending_review',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

alter table campaign_submissions enable row level security;

create policy "Sellers can see own submissions" on campaign_submissions
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Sellers can insert own submissions" on campaign_submissions
  for insert with check (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all submissions" on campaign_submissions
  for all using (true);

-- campaign_earnings table
create table campaign_earnings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  seller_id uuid not null references profiles(id),
  submission_id uuid references campaign_submissions(id),
  amount numeric not null default 0,
  status text not null check (status in ('pending','paid','rejected')) default 'pending',
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  transaction_id uuid references transactions(id),
  created_at timestamptz default now()
);

alter table campaign_earnings enable row level security;

create policy "Sellers can see own earnings" on campaign_earnings
  for select using (seller_id = (select id from profiles where user_id = auth.uid()));

create policy "Service role / admins can manage all earnings" on campaign_earnings
  for all using (true);
