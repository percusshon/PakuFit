-- 写真AI概算の補正率・精度観測（開発者向け内部集計）
--
-- 用途: photo_estimate_logs（migration 0006）に蓄積された
--   「AI元概算(ai_*)」と「ユーザー最終保存値(final_*)」の差から、
--   プロバイダ別の補正率・平均補正量を観測する。
-- 注意: これは開発者/運用向けの内部集計であり、エンドユーザー画面には出さない。
--   実行は Supabase Studio または psql で行う。
--
-- ローカル実行例:
--   psql "postgresql://postgres:postgres@127.0.0.1:55432/postgres" -f scripts/estimate-accuracy.sql
-- （接続先は `supabase status` の DB ポートに合わせる）

select
  provider,
  count(*)                                                   as logs,
  round(avg(confidence)::numeric, 3)                         as avg_confidence,
  -- カロリーの平均絶対補正量（kcal）
  round(avg(abs(final_calories - ai_calories))::numeric, 1)  as avg_abs_kcal_delta,
  -- カロリーが補正された割合（final と ai が異なる行の割合, %）
  round(
    100.0 * count(*) filter (where final_calories is distinct from ai_calories)
      / nullif(count(*), 0),
    1
  )                                                          as kcal_corrected_pct,
  round(avg(abs(final_protein_g - ai_protein_g))::numeric, 2) as avg_abs_protein_delta,
  round(avg(abs(final_fat_g - ai_fat_g))::numeric, 2)         as avg_abs_fat_delta,
  round(avg(abs(final_carbs_g - ai_carbs_g))::numeric, 2)     as avg_abs_carbs_delta,
  round(avg(abs(final_fiber_g - ai_fiber_g))::numeric, 2)     as avg_abs_fiber_delta,
  round(avg(abs(final_salt_g - ai_salt_g))::numeric, 2)       as avg_abs_salt_delta
from public.photo_estimate_logs
group by provider
order by logs desc;
