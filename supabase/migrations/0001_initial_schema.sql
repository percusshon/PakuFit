-- PakuFit 初期スキーマ（MVP）
-- 目的: 本人データを本人だけが扱える前提の土台を作る
-- 注意: 推定値はestimated_*で扱い、確定値として誤解しない。

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  profile_type text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_category text not null check (
    goal_category in (
      'weight_management',
      'balance_improvement',
      'protein_focus',
      'fat_moderation',
      'convenience_balance'
    )
  ),
  target_calories_per_day integer,
  target_protein_g numeric(8,2),
  target_fat_g numeric(8,2),
  target_carbs_g numeric(8,2),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, goal_category)
);

create table if not exists public.meal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_label text,
  eaten_at timestamptz not null default timezone('utc', now()),
  food_description text,
  intake_channel text not null default 'manual' check (intake_channel in ('manual', 'photo', 'barcode', 'import')),
  estimated_total_calories integer,
  estimated_total_protein_g numeric(8,2),
  estimated_total_fat_g numeric(8,2),
  estimated_total_carbs_g numeric(8,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meal_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_entry_id uuid references public.meal_entries (id) on delete cascade,
  storage_bucket text not null default 'meal-photos',
  storage_path text,
  photo_url text,
  memo text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.food_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_entry_id uuid not null references public.meal_entries (id) on delete cascade,
  estimated_dish_name text,
  estimated_food_name text,
  estimated_amount_g numeric(8,2),
  estimated_calories integer,
  estimated_protein_g numeric(8,2),
  estimated_fat_g numeric(8,2),
  estimated_carbs_g numeric(8,2),
  estimated_cooking_method text,
  estimated_consumed_ratio numeric(5,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.nutrition_estimates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_entry_id uuid references public.meal_entries (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete set null,
  estimated_calories integer,
  estimated_protein_g numeric(8,2),
  estimated_fat_g numeric(8,2),
  estimated_carbs_g numeric(8,2),
  estimate_method text not null default 'photo' check (estimate_method in ('photo', 'manual', 'barcode', 'import')), 
  estimated_confidence numeric(5,2),
  is_user_confirmed boolean not null default false,
  source_metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_nutrition_summaries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary_date date not null,
  estimated_calories integer,
  estimated_protein_g numeric(8,2),
  estimated_fat_g numeric(8,2),
  estimated_carbs_g numeric(8,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, summary_date)
);

create table if not exists public.meal_recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recommendation_date date not null default current_date,
  meal_timing text,
  remaining_calories integer,
  shortage_summary jsonb,
  candidate_name text not null,
  estimated_calories integer,
  estimated_protein_g numeric(8,2),
  estimated_fat_g numeric(8,2),
  estimated_carbs_g numeric(8,2),
  recommendation_type text check (recommendation_type in ('convenience', 'home', 'restaurant', 'any')), 
  explanation text,
  is_followed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.partner_stores (
  id uuid primary key default uuid_generate_v4(),
  store_code text unique,
  store_name text not null,
  region text,
  city text,
  prefecture text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.partner_products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.partner_stores (id) on delete set null,
  product_code text,
  product_name text not null,
  product_category text,
  price_jpy integer,
  calories_per_unit integer,
  estimated_protein_g numeric(8,2),
  estimated_fat_g numeric(8,2),
  estimated_carbs_g numeric(8,2),
  tags text[],
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at()
returns trigger as
$$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger user_goals_updated_at before update on public.user_goals
for each row execute function public.touch_updated_at();

create trigger meal_entries_updated_at before update on public.meal_entries
for each row execute function public.touch_updated_at();

create trigger food_items_updated_at before update on public.food_items
for each row execute function public.touch_updated_at();

create trigger nutrition_estimates_updated_at before update on public.nutrition_estimates
for each row execute function public.touch_updated_at();

create trigger daily_summaries_updated_at before update on public.daily_nutrition_summaries
for each row execute function public.touch_updated_at();

create trigger meal_recommendations_updated_at before update on public.meal_recommendations
for each row execute function public.touch_updated_at();

create trigger partner_stores_updated_at before update on public.partner_stores
for each row execute function public.touch_updated_at();

create trigger partner_products_updated_at before update on public.partner_products
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.meal_entries enable row level security;
alter table public.meal_photos enable row level security;
alter table public.food_items enable row level security;
alter table public.nutrition_estimates enable row level security;
alter table public.daily_nutrition_summaries enable row level security;
alter table public.meal_recommendations enable row level security;
alter table public.partner_products enable row level security;
alter table public.partner_stores enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy if not exists "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- user_goals
create policy if not exists "user_goals_select_own"
  on public.user_goals for select
  using (auth.uid() = user_id);

create policy if not exists "user_goals_insert_own"
  on public.user_goals for insert
  with check (auth.uid() = user_id);

create policy if not exists "user_goals_update_own"
  on public.user_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "user_goals_delete_own"
  on public.user_goals for delete
  using (auth.uid() = user_id);

-- meal_entries
create policy if not exists "meal_entries_select_own"
  on public.meal_entries for select
  using (auth.uid() = user_id);

create policy if not exists "meal_entries_insert_own"
  on public.meal_entries for insert
  with check (auth.uid() = user_id);

create policy if not exists "meal_entries_update_own"
  on public.meal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "meal_entries_delete_own"
  on public.meal_entries for delete
  using (auth.uid() = user_id);

-- meal_photos
create policy if not exists "meal_photos_select_own"
  on public.meal_photos for select
  using (auth.uid() = user_id);

create policy if not exists "meal_photos_insert_own"
  on public.meal_photos for insert
  with check (auth.uid() = user_id);

create policy if not exists "meal_photos_update_own"
  on public.meal_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "meal_photos_delete_own"
  on public.meal_photos for delete
  using (auth.uid() = user_id);

-- food_items
create policy if not exists "food_items_select_own"
  on public.food_items for select
  using (auth.uid() = user_id);

create policy if not exists "food_items_insert_own"
  on public.food_items for insert
  with check (auth.uid() = user_id);

create policy if not exists "food_items_update_own"
  on public.food_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "food_items_delete_own"
  on public.food_items for delete
  using (auth.uid() = user_id);

-- nutrition_estimates
create policy if not exists "nutrition_estimates_select_own"
  on public.nutrition_estimates for select
  using (auth.uid() = user_id);

create policy if not exists "nutrition_estimates_insert_own"
  on public.nutrition_estimates for insert
  with check (auth.uid() = user_id);

create policy if not exists "nutrition_estimates_update_own"
  on public.nutrition_estimates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "nutrition_estimates_delete_own"
  on public.nutrition_estimates for delete
  using (auth.uid() = user_id);

-- daily_nutrition_summaries
create policy if not exists "daily_summaries_select_own"
  on public.daily_nutrition_summaries for select
  using (auth.uid() = user_id);

create policy if not exists "daily_summaries_insert_own"
  on public.daily_nutrition_summaries for insert
  with check (auth.uid() = user_id);

create policy if not exists "daily_summaries_update_own"
  on public.daily_nutrition_summaries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "daily_summaries_delete_own"
  on public.daily_nutrition_summaries for delete
  using (auth.uid() = user_id);

-- meal_recommendations
create policy if not exists "meal_recommendations_select_own"
  on public.meal_recommendations for select
  using (auth.uid() = user_id);

create policy if not exists "meal_recommendations_insert_own"
  on public.meal_recommendations for insert
  with check (auth.uid() = user_id);

create policy if not exists "meal_recommendations_update_own"
  on public.meal_recommendations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "meal_recommendations_delete_own"
  on public.meal_recommendations for delete
  using (auth.uid() = user_id);

-- partner_products / partner_stores: 読み取り専用に限定（service_role前提を想定しない安全設計）
create policy if not exists "partner_products_select_authenticated"
  on public.partner_products for select
  to authenticated
  using (true);

create policy if not exists "partner_stores_select_authenticated"
  on public.partner_stores for select
  to authenticated
  using (true);

-- audit_logsはクライアントからの直接参照を許可しない。service_role不要方針の初期状態。
-- 本番で監査運用する場合は管理ロール + バッチ基盤からのみ書き込み許可を追加。
