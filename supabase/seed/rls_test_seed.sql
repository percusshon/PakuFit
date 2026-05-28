-- Supabase RLS テスト用シード（ローカル環境想定）
-- 実ユーザーではなく固定UUIDを使ったダミーデータのみを登録する。

\set USER_A_ID '00000000-0000-0000-0000-000000000001'
\set USER_B_ID '00000000-0000-0000-0000-000000000002'

-- auth.users を先に登録（外部キー制約対策）
INSERT INTO auth.users (id, email, is_sso_user, is_anonymous)
VALUES
  (:'USER_A_ID'::uuid, 'user-a@local.test', false, false),
  (:'USER_B_ID'::uuid, 'user-b@local.test', false, false)
ON CONFLICT (id) DO NOTHING;

-- 本人データ（テーブル間の参照を担保する最小データ）
INSERT INTO public.meal_entries (id, user_id, meal_label, intake_channel, estimated_total_calories, estimated_total_protein_g, estimated_total_fat_g, estimated_total_carbs_g)
VALUES
  ('11111111-1111-1111-1111-111111111101', :'USER_A_ID'::uuid, 'Lunch sample', 'manual', 520, 28, 18, 61),
  ('11111111-1111-1111-1111-111111111102', :'USER_B_ID'::uuid, 'Dinner sample', 'manual', 670, 32, 24, 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_goals (user_id, goal_category, target_calories_per_day, target_protein_g, target_fat_g, target_carbs_g)
VALUES
  (:'USER_A_ID'::uuid, 'weight_management', 1800, 95, 55, 210),
  (:'USER_B_ID'::uuid, 'protein_focus', 1900, 115, 52, 200)
ON CONFLICT (user_id, goal_category) DO NOTHING;

-- パートナー候補データ（RLSで保護対象）
INSERT INTO public.partner_stores (id, store_code, store_name, region, prefecture, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'STORE-A', 'Partner Store Sample', 'Tokyo', 'Tokyo', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.partner_products (id, store_id, product_code, product_name, product_category, price_jpy, calories_per_unit, estimated_protein_g, estimated_fat_g, estimated_carbs_g, is_visible)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'PROD-001', 'Candidate sample', 'meal', 540, 340, 20.0, 12.0, 38.0, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_logs (id, actor_user_id, action, target_table, target_id, details)
VALUES
  ('00000000-0000-0000-0000-000000000031', :'USER_A_ID'::uuid, 'seed', 'meal_entries', '11111111-1111-1111-1111-111111111101'::uuid, '{"source":"seed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
