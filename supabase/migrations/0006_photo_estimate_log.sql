-- Phase 5: 写真AI概算の精度ログ観測
-- 写真AI概算を反映した食事保存時に、AIの元概算とユーザー最終保存値（補正後）を
-- 追記専用ログとして記録し、後から補正率/精度を観測できるようにする。
-- 本人のみアクセス可（RLS）。更新は許可せず append-only として扱う。

create table if not exists public.photo_estimate_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_entry_id uuid references public.meal_entries (id) on delete set null,
  provider text not null check (provider in ('mock', 'openai', 'anthropic')),
  guessed_label text,
  confidence numeric(5,2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  -- AIの元概算
  ai_calories integer,
  ai_protein_g numeric(8,2),
  ai_fat_g numeric(8,2),
  ai_carbs_g numeric(8,2),
  ai_fiber_g numeric(8,2),
  ai_salt_g numeric(8,2),
  -- ユーザーが最終保存した値（補正後）
  final_calories integer,
  final_protein_g numeric(8,2),
  final_fat_g numeric(8,2),
  final_carbs_g numeric(8,2),
  final_fiber_g numeric(8,2),
  final_salt_g numeric(8,2),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists photo_estimate_logs_user_created_idx
  on public.photo_estimate_logs (user_id, created_at desc);

alter table public.photo_estimate_logs enable row level security;

-- 本人のみ select / insert / delete 可。update ポリシーは作らず追記専用とする。
create policy "photo_estimate_logs_select_own"
  on public.photo_estimate_logs for select
  using (auth.uid() = user_id);

create policy "photo_estimate_logs_insert_own"
  on public.photo_estimate_logs for insert
  with check (auth.uid() = user_id);

create policy "photo_estimate_logs_delete_own"
  on public.photo_estimate_logs for delete
  using (auth.uid() = user_id);
