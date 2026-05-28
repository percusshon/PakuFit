-- PakuFit meal_entries MVP columns
-- Phase 3 最低限の食事登録フォーム（meal_type/タイトル/概算カロリー）を保存するための拡張

alter table public.meal_entries
  add column if not exists meal_type text
    check (
      meal_type is null
      or meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')
    );

alter table public.meal_entries
  add column if not exists title text;

alter table public.meal_entries
  add column if not exists description text;

alter table public.meal_entries
  add column if not exists estimated_calories integer;

alter table public.meal_entries
  add column if not exists portion_note text;

alter table public.meal_entries
  add column if not exists preparation_note text;
