-- PakuFit nutrition_estimates のPFC拡張（Phase4）
-- PFCは段階的に「概算・任意入力」で扱い、ユーザー入力値の保存先を明確化する。

alter table public.nutrition_estimates
  add column if not exists estimated_fiber_g numeric(8,2);

alter table public.nutrition_estimates
  add column if not exists estimated_salt_g numeric(8,2);
