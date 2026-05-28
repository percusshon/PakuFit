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

INSERT INTO public.user_goals (user_id, goal_category, target_calories_per_day, target_protein_g, target_fat_g, target_carbs_g)
VALUES
  (:'USER_A_ID'::uuid, 'weight_management', 1800, 95, 55, 210),
  (:'USER_B_ID'::uuid, 'protein_focus', 1900, 115, 52, 200)
ON CONFLICT (user_id, goal_category) DO NOTHING;

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

select plan(13);

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

select * from finish();
