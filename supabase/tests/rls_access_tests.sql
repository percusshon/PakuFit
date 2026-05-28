-- PakuFit RLSテスト（Supabase CLI local test）
-- pgTAP形式で出力する。

create extension if not exists pgtap;

create or replace function public.set_test_jwt(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, false);
  perform set_config('request.jwt.claim.role', 'authenticated', false);
  perform set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', p_user_id::text,
      'role', 'authenticated'
    )::text,
    false
  );
end;
$$;

\set USER_A_ID '00000000-0000-0000-0000-000000000001'
\set USER_B_ID '00000000-0000-0000-0000-000000000002'

set role postgres;

truncate table public.meal_recommendations restart identity;

INSERT INTO auth.users (id, email, is_sso_user, is_anonymous)
VALUES
  (:'USER_A_ID'::uuid, 'user-a@local.test', false, false),
  (:'USER_B_ID'::uuid, 'user-b@local.test', false, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.meal_entries (id, user_id, meal_label, intake_channel, estimated_total_calories, estimated_total_protein_g, estimated_total_fat_g, estimated_total_carbs_g)
VALUES
  ('11111111-1111-1111-1111-111111111101', :'USER_A_ID'::uuid, 'Lunch sample', 'manual', 520, 28, 18, 61),
  ('11111111-1111-1111-1111-111111111102', :'USER_B_ID'::uuid, 'Dinner sample', 'manual', 670, 32, 24, 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.nutrition_estimates (id, user_id, meal_entry_id, estimate_method, estimated_calories, estimated_protein_g, estimated_fat_g, estimated_carbs_g, estimated_fiber_g, estimated_salt_g)
VALUES
  ('00000000-0000-0000-0000-000000000101', :'USER_A_ID'::uuid, '11111111-1111-1111-1111-111111111101', 'manual', 520, 28, 18, 61, 2.5, 1.1),
  ('00000000-0000-0000-0000-000000000102', :'USER_B_ID'::uuid, '11111111-1111-1111-1111-111111111102', 'manual', 670, 32, 24, 74, 4.2, 1.8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_goals (user_id, goal_category, target_calories_per_day, target_protein_g, target_fat_g, target_carbs_g)
VALUES
  (:'USER_A_ID'::uuid, 'weight_management', 1800, 95, 55, 210),
  (:'USER_B_ID'::uuid, 'protein_focus', 1900, 115, 52, 200)
ON CONFLICT (user_id, goal_category) DO NOTHING;

INSERT INTO public.meal_recommendations (
  id,
  user_id,
  recommendation_date,
  candidate_name,
  recommendation_type,
  explanation,
  candidate_key,
  goal_category,
  data_completeness,
  reason_code,
  reason_label,
  caution_text,
  source,
  generated_at,
  snapshot
)
VALUES
  (
    '00000000-0000-0000-0000-000000000201'::uuid,
    :'USER_A_ID'::uuid,
    current_date,
    '保存済みサンプル',
    'any',
    '保存済み候補の説明',
    'rule-bp',
    'weight_management',
    0.60,
    'sample_reason',
    'サンプル理由',
    'サンプル注意',
    'rule_based',
    timezone('utc', now()),
    '{"context":"seed"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000202'::uuid,
    :'USER_B_ID'::uuid,
    current_date,
    '保存済みサンプルB',
    'any',
    '保存済み候補Bの説明',
    'rule-carb',
    'balanced_meals',
    0.55,
    'sample_reason_b',
    'サンプル理由B',
    'サンプル注意B',
    'rule_based',
    timezone('utc', now()),
    '{"context":"seed"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

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

select plan(28);

select public.set_test_jwt(:'USER_A_ID'::uuid);
set role authenticated;

-- 1) user A は自分のmeal_entriesを読める
select is(
  (select count(*)::int from public.meal_entries),
  1,
  'user A は自分のmeal_entriesを読める'
);

-- 2) user A はuser Bのmeal_entriesを読めない
select is(
  (select count(*)::int from public.meal_entries where user_id = :'USER_B_ID'::uuid),
  0,
  'user A はuser Bのmeal_entriesを読めない'
);

-- 3) user A は自分のuser_goalsを更新できる
update public.user_goals
set target_calories_per_day = 1750
where user_id = :'USER_A_ID'::uuid and goal_category = 'weight_management';
select is(
  (select target_calories_per_day from public.user_goals where user_id = :'USER_A_ID'::uuid and goal_category = 'weight_management'),
  1750,
  'user A は自分のuser_goalsを更新できる'
);

-- 4) user A は user B のuser_goalsを更新できない（user Bの値は維持）
update public.user_goals
set target_calories_per_day = 1500
where user_id = :'USER_B_ID'::uuid and goal_category = 'protein_focus';
set role postgres;
select is(
  (select target_calories_per_day from public.user_goals where user_id = :'USER_B_ID'::uuid and goal_category = 'protein_focus'),
  1900,
  'user A はuser Bのuser_goalsを更新できない'
);
set role authenticated;

-- 5) partner_productsは一般ユーザーがinsertできない
select throws_ok(
  $$insert into public.partner_products (id, product_name) values ('00000000-0000-0000-0000-000000000013', 'forbidden product');$$,
  42501,
  'new row violates row-level security policy for table "partner_products"',
  'user A はpartner_productsをinsertできない'
);

-- 6) partner_productsは一般ユーザーがupdateしても値が変わらない
update public.partner_products
set product_name = 'forbidden update'
where id = '00000000-0000-0000-0000-000000000011';
set role postgres;
select is(
  (select product_name from public.partner_products where id = '00000000-0000-0000-0000-000000000011'),
  'Candidate sample',
  'user A はpartner_productsをupdateしても値を更新できない'
);
set role authenticated;

-- 7) partner_productsは一般ユーザーがdeleteしても削除できない
delete from public.partner_products
where id = '00000000-0000-0000-0000-000000000011';
set role postgres;
select is(
  (select count(*)::int from public.partner_products where id = '00000000-0000-0000-0000-000000000011'),
  1,
  'user A はpartner_productsをdeleteしても削除できない'
);
set role authenticated;

-- 8) partner_storesは一般ユーザーがinsertできない
select throws_ok(
  $$insert into public.partner_stores (id, store_name) values ('00000000-0000-0000-0000-000000000021', 'Forbidden Store');$$,
  42501,
  'new row violates row-level security policy for table "partner_stores"',
  'user A はpartner_storesをinsertできない'
);

-- 9) partner_storesは一般ユーザーがupdateしても値が変わらない
update public.partner_stores
set store_name = 'forbidden update'
where id = '00000000-0000-0000-0000-000000000010';
set role postgres;
select is(
  (select store_name from public.partner_stores where id = '00000000-0000-0000-0000-000000000010'),
  'Partner Store Sample',
  'user A はpartner_storesをupdateしても値を更新できない'
);
set role authenticated;

-- 10) partner_storesは一般ユーザーがdeleteしても削除できない
delete from public.partner_stores
where id = '00000000-0000-0000-0000-000000000010';
set role postgres;
select is(
  (select count(*)::int from public.partner_stores where id = '00000000-0000-0000-0000-000000000010'),
  1,
  'user A はpartner_storesをdeleteしても削除できない'
);
set role authenticated;

-- 11) audit_logsは一般ユーザーがselectできない
select is(
  (select count(*)::int from public.audit_logs),
  0,
  'user A はaudit_logsをselectできない'
);

-- 12) audit_logsは一般ユーザーがupdateできない
update public.audit_logs
set action = 'denied'
where id = '00000000-0000-0000-0000-000000000031';
set role postgres;
select is(
  (select action from public.audit_logs where id = '00000000-0000-0000-0000-000000000031'),
  'seed',
  'user A はaudit_logsをupdateできない'
);
set role authenticated;

-- 13) audit_logsは一般ユーザーがdeleteできない
delete from public.audit_logs
where id = '00000000-0000-0000-0000-000000000031';
set role postgres;
select is(
  (select count(*)::int from public.audit_logs where id = '00000000-0000-0000-0000-000000000031'),
  1,
  'user A はaudit_logsをdeleteできない'
);

-- 14) user A は自分のnutrition_estimatesを読める
select is(
  (select count(*)::int from public.nutrition_estimates where user_id = :'USER_A_ID'::uuid),
  1,
  'user A は自分のnutrition_estimatesを読める'
);

-- 15) user A は自分のnutrition_estimatesをinsertできる
insert into public.nutrition_estimates
  (id, user_id, meal_entry_id, estimate_method, estimated_protein_g, estimated_fat_g, estimated_carbs_g)
values
  ('00000000-0000-0000-0000-000000000103', :'USER_A_ID'::uuid, '11111111-1111-1111-1111-111111111101', 'manual', 12.0, 8.0, 30.0);
select is(
  (select count(*)::int from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000103'),
  1,
  'user A はnutrition_estimatesをinsertできる'
);

-- 16) user A は自分のnutrition_estimatesをupdateできる
update public.nutrition_estimates
set estimated_fiber_g = 3.5
where id = '00000000-0000-0000-0000-000000000103';
select is(
  (select estimated_fiber_g::text from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000103'),
  '3.50',
  'user A はnutrition_estimatesをupdateできる'
);

-- 17) user A は自分のnutrition_estimatesをdeleteできる
delete from public.nutrition_estimates
where id = '00000000-0000-0000-0000-000000000103';
select is(
  (select count(*)::int from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000103'),
  0,
  'user A はnutrition_estimatesをdeleteできる'
);

-- 18) user A はuser Bのnutrition_estimatesを読めない
set role authenticated;
select is(
  (select count(*)::int from public.nutrition_estimates where user_id = :'USER_B_ID'::uuid),
  0,
  'user A はuser Bのnutrition_estimatesを読めない'
);

-- 19) user A はuser Bのnutrition_estimatesをinsertできない
select is(
  (select count(*)::int from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000104'::uuid),
  0,
  'user A はuser Bのnutrition_estimatesをinsertしていない'
);
do $$
begin
  begin
    insert into public.nutrition_estimates (id, user_id, meal_entry_id, estimate_method, estimated_protein_g)
      values ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111102', 'manual', 10);
  exception
    when insufficient_privilege then
      null;
  end;
end $$;
select is(
  (select count(*)::int from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000104'::uuid),
  0,
  'user A はuser Bのnutrition_estimatesをinsertできない'
);

-- 20) user A はuser Bのnutrition_estimatesをupdateできない
set role authenticated;
update public.nutrition_estimates
set estimated_fat_g = 99
where id = '00000000-0000-0000-0000-000000000102'::uuid;
set role postgres;
select is(
  (select estimated_fat_g::numeric(8,2) from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000102'::uuid),
  24.00::numeric(8,2),
  'user A はuser Bのnutrition_estimatesをupdateできない'
);
set role authenticated;

-- 21) user A はuser Bのnutrition_estimatesをdeleteできない
delete from public.nutrition_estimates
where id = '00000000-0000-0000-0000-000000000102';
set role postgres;
select is(
  (select count(*)::int from public.nutrition_estimates where id = '00000000-0000-0000-0000-000000000102'),
  1,
  'user A はuser Bのnutrition_estimatesをdeleteできない'
);
set role authenticated;

-- 22) user A は自分のmeal_recommendationsを読める
select is(
  (select count(*)::int from public.meal_recommendations where user_id = :'USER_A_ID'::uuid),
  1,
  'user A は自分のmeal_recommendationsを読める'
);

-- 23) user A はuser Bのmeal_recommendationsを読めない
select is(
  (select count(*)::int from public.meal_recommendations where user_id = :'USER_B_ID'::uuid),
  0,
  'user A はuser Bのmeal_recommendationsを読めない'
);

-- 24) user A は自分のmeal_recommendationsをinsertできる
insert into public.meal_recommendations (
  id,
  user_id,
  recommendation_date,
  candidate_name,
  recommendation_type,
  explanation,
  candidate_key,
  source,
  goal_category,
  data_completeness
)
values (
  '00000000-0000-0000-0000-000000000203'::uuid,
  :'USER_A_ID'::uuid,
  current_date,
  'phase7 candidate',
  'any',
  'phase7 test',
  'rule-phase7',
  'rule_based',
  'higher_protein',
  0.7
);
select is(
  (select count(*)::int from public.meal_recommendations where id = '00000000-0000-0000-0000-000000000203'::uuid),
  1,
  'user A は自分のmeal_recommendationsをinsertできる'
);

-- 25) user A はuser Bのmeal_recommendationsをinsertできない
do $$
begin
  begin
    insert into public.meal_recommendations (
      id,
      user_id,
      recommendation_date,
      candidate_name,
      recommendation_type,
      explanation,
      candidate_key,
      source
    ) values (
      '00000000-0000-0000-0000-000000000204'::uuid,
      '00000000-0000-0000-0000-000000000002'::uuid,
      current_date,
      'forbidden insert',
      'any',
      'forbidden',
      'forbidden',
      'rule_based'
    );
  exception
    when insufficient_privilege then
      null;
  end;
end $$;
select is(
  (select count(*)::int from public.meal_recommendations where id = '00000000-0000-0000-0000-000000000204'::uuid),
  0,
  'user A はuser Bのmeal_recommendationsをinsertできない'
);

-- 26) user A はuser Bのmeal_recommendationsをupdateできない
set role authenticated;
update public.meal_recommendations
set caution_text = 'blocked'
where id = '00000000-0000-0000-0000-000000000202'::uuid;
set role postgres;
select is(
  (select caution_text from public.meal_recommendations where id = '00000000-0000-0000-0000-000000000202'::uuid),
  'サンプル注意B',
  'user A はuser Bのmeal_recommendationsをupdateできない'
);
set role authenticated;

-- 27) user A はuser Bのmeal_recommendationsをdeleteできない
delete from public.meal_recommendations
where id = '00000000-0000-0000-0000-000000000202'::uuid;
set role postgres;
select is(
  (select count(*)::int from public.meal_recommendations where id = '00000000-0000-0000-0000-000000000202'::uuid),
  1,
  'user A はuser Bのmeal_recommendationsをdeleteできない'
);
set role authenticated;

select * from finish();
