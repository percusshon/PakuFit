-- Supabase RLS テスト用シード（ローカル環境想定）
-- このファイルは auth ユーザー ID を固定値で置き換えて利用する。

-- 例: 下記UUIDを環境のテストユーザーIDに差し替える
\set user_a_id '00000000-0000-0000-0000-000000000001'
\set user_b_id '00000000-0000-0000-0000-000000000002'

-- 事前に auth.users のテストユーザーを2名作成しておくこと。
-- 代表的な seed データ
INSERT INTO public.meal_entries (id, user_id, meal_label, intake_channel, estimated_total_calories, estimated_total_protein_g, estimated_total_fat_g, estimated_total_carbs_g)
VALUES
  ('11111111-1111-1111-1111-111111111101', :user_a_id, 'Lunch sample', 'manual', 520, 28, 18, 61),
  ('11111111-1111-1111-1111-111111111102', :user_b_id, 'Dinner sample', 'manual', 670, 32, 24, 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_goals (user_id, goal_category, target_calories_per_day, target_protein_g, target_fat_g, target_carbs_g)
VALUES
  (:user_a_id, 'weight_management', 1800, 95, 55, 210),
  (:user_b_id, 'protein_focus', 1900, 115, 52, 200)
ON CONFLICT (user_id, goal_category) DO NOTHING;
