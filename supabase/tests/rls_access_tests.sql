-- Supabase RLS テスト（ローカル実行想定）
-- Supabase SQL editor 上でユーザー切替トークンを差し替えて実行する。

create or replace function public.set_test_jwt(p_user_id uuid)
returns void
language sql
as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text, true);
$$;

-- ユーザーA/B の固定ID
\set user_a_id '00000000-0000-0000-0000-000000000001'
\set user_b_id '00000000-0000-0000-0000-000000000002'

-- 1) user A は自分のmeal_entriesを読める
select public.set_test_jwt(:'user_a_id');
select count(*) as meal_entries_visible_by_a
from public.meal_entries
where user_id = :'user_a_id';

-- 2) user A は user B のmeal_entriesを読めない
select count(*) as meal_entries_blocked_from_a
from public.meal_entries
where user_id = :'user_b_id';

-- 3) user A は自分のuser_goalsを更新できる
update public.user_goals
set target_calories_per_day = 1700
where user_id = :'user_a_id'
  and goal_category = 'weight_management';

-- 4) user A は user B のuser_goalsを更新できない（拒否される想定）
update public.user_goals
set target_calories_per_day = 1500
where user_id = :'user_b_id'
  and goal_category = 'weight_management';

-- 5) partner_productsは一般ユーザーがinsert/update/deleteできない
insert into public.partner_products (product_name)
values ('forbidden product');

update public.partner_products
set product_name = 'forbidden update'
where id = '00000000-0000-0000-0000-000000000011';

delete from public.partner_products
where id = '00000000-0000-0000-0000-000000000011';

-- 6) audit_logsは一般ユーザーが自由に読み書きできない
select count(*) from public.audit_logs;
update public.audit_logs
set action = 'forbidden';

delete from public.audit_logs;

-- 上記は想定どおり失敗/空結果が返ることを確認する。
