-- Talent Profiles
create table if not exists talent_profiles (
  id                    uuid primary key references auth.users on delete cascade,
  full_name             text,
  phone                 text,
  gender                text,
  date_of_birth         text,
  city                  text,
  state                 text,
  country               text,
  preferred_work_location text,
  work_preference       text,
  job_type_preference   text[],
  role_interests        text[],
  experience_years      int,
  industry_experience   text[],
  bio                   text,
  education             jsonb default '[]',
  certifications        jsonb default '[]',
  work_history          jsonb default '[]',
  skills                text[],
  languages             text[],
  linkedin_url          text,
  portfolio_url         text,
  cv_url                text,
  profile_photo_url     text,
  salary_min            int,
  salary_max            int,
  availability          text,
  status                text default 'incomplete',
  profile_completion    int default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Brand Profiles
create table if not exists brand_profiles (
  id            uuid primary key references auth.users on delete cascade,
  company_name  text,
  contact_name  text,
  phone         text,
  website       text,
  company_type  text,
  industry      text,
  company_size  text,
  city          text,
  country       text,
  primary_goal  text,
  description   text,
  logo_url      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Talent Academy Courses (independent of voltsquad training)
create table if not exists talent_courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  thumbnail_url  text,
  category       text,
  modules        jsonb default '[]',
  has_certificate bool default false,
  is_published   bool default false,
  created_at     timestamptz default now()
);

-- Talent Course Enrollments
create table if not exists talent_enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  course_id         uuid not null references talent_courses on delete cascade,
  progress          int default 0,
  completed_modules int[] default '{}',
  completed_at      timestamptz,
  created_at        timestamptz default now(),
  unique (user_id, course_id)
);

-- Talent Webinars
create table if not exists talent_webinars (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  scheduled_at     timestamptz,
  duration_minutes int,
  meeting_url      text,
  is_published     bool default false,
  created_at       timestamptz default now()
);

-- Admin Internal Notes on Talent
create table if not exists talent_admin_notes (
  id         uuid primary key default gen_random_uuid(),
  talent_id  uuid not null references talent_profiles on delete cascade,
  admin_id   uuid not null references auth.users,
  note       text not null,
  created_at timestamptz default now()
);

-- RLS
alter table talent_profiles enable row level security;
alter table brand_profiles enable row level security;
alter table talent_courses enable row level security;
alter table talent_enrollments enable row level security;
alter table talent_webinars enable row level security;
alter table talent_admin_notes enable row level security;

-- talent_profiles policies
create policy "talent can manage own profile"
  on talent_profiles for all
  using (auth.uid() = id);

create policy "admin can manage all talent profiles"
  on talent_profiles for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- brand_profiles policies
create policy "brand can manage own profile"
  on brand_profiles for all
  using (auth.uid() = id);

create policy "admin can manage all brand profiles"
  on brand_profiles for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_courses policies
create policy "published courses readable by all authenticated"
  on talent_courses for select
  using (is_published = true and auth.role() = 'authenticated');

create policy "admin can manage courses"
  on talent_courses for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_enrollments policies
create policy "user can manage own enrollments"
  on talent_enrollments for all
  using (auth.uid() = user_id);

create policy "admin can manage all enrollments"
  on talent_enrollments for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_webinars policies
create policy "published webinars readable by authenticated"
  on talent_webinars for select
  using (is_published = true and auth.role() = 'authenticated');

create policy "admin can manage webinars"
  on talent_webinars for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');

-- talent_admin_notes policies
create policy "admin can manage notes"
  on talent_admin_notes for all
  using ((auth.jwt() -> 'user_metadata' ->> 'account_type') = 'admin');
