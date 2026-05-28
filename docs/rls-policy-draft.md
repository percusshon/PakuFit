# PakuFit RLS方針（Phase 2 実装版）

## 基本方針

- `auth.uid()` を使った本人確認を前提にする。
- `service_role` key は使用しない。
- 管理画面は未実装のため、ユーザー側は原則 CRUD のみ `自分の` データ。

## ユーザー所有テーブル

以下のテーブルは以下を原則とする。

- select: `auth.uid() = user_id`
- insert: `auth.uid() = user_id`
- update: `auth.uid() = user_id`
- delete: `auth.uid() = user_id`

対象:
- `profiles`（`id` と `auth.uid()` を比較）
- `user_goals`
- `meal_entries`
- `meal_photos`
- `food_items`
- `nutrition_estimates`
- `daily_nutrition_summaries`
- `meal_recommendations`

## partner 系テーブル

- `partner_products`, `partner_stores` は Phase2 では「認証済みユーザーのみ select」。
- insert/update/delete は未提供（MVPの安全側）

## audit_logs

- 初期ではクライアントから操作不可。
- 将来は管理ジョブや監査権限を持つ別 role 経由で運用。

## migration反映

- `supabase/migrations/0001_initial_schema.sql` にて `enable row level security` と Policy をSQL化。
- 各テーブルに対して `create policy if not exists` を付与。

## 検証方針

- `supabase/tests/rls_access_tests.sql` を使って主要シナリオを確認。
  - user A が自分を読む/他ユーザーを読むと拒否
  - user_goals の更新権限の本人限定
  - partner/productsとaudit_logsの過剰権限拒否
