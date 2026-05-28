# PakuFit DB設計（draft）

## 方針

- ユーザー本体は `auth.users` と `profiles` を UUID で紐づける。
- 食事・推定・提案・目標情報は `user_id` をキーに本人データとして保持。
- AI推定値は `estimated_*` で扱い、確定値を示す語彙は使わない。
- ここでは保存時の整形や実カロリー確定ロジックは持たず、MVPでは概算表示を前提にする。

## テーブル

- `profiles`
  - `id`: `auth.users.id` と一致
  - `display_name`
  - `created_at`, `updated_at`

- `user_goals`
  - `user_id`, `goal_category`, `target_calories_per_day`, `target_protein_g`, `target_fat_g`, `target_carbs_g`, `notes`
  - 目標カテゴリ別に複数保持可能（`user_id + goal_category` 一意）

- `meal_entries`
  - `user_id`, `eaten_at`, `meal_label`, `food_description`, `intake_channel`
  - `estimated_total_calories`, `estimated_total_protein_g`, `estimated_total_fat_g`, `estimated_total_carbs_g`

- `meal_photos`
  - `user_id`, `meal_entry_id`, `storage_bucket`, `storage_path`, `photo_url`
  - 今は文字列パス/URLの保存のみ

- `food_items`
  - `meal_entry_id`, `estimated_dish_name`, `estimated_food_name`, `estimated_amount_g`, `estimated_*` 系

- `nutrition_estimates`
  - 食事推定の母体。`estimated_*` と `estimate_method`, `is_user_confirmed`, `source_metadata`

- `daily_nutrition_summaries`
  - `user_id`, `summary_date`, `estimated_*_day`
  - 日次の合計

- `meal_recommendations`
  - `user_id`, `recommendation_date`, `shortage_summary`, `candidate_name`, `estimated_*`, `recommendation_type`, `explanation`
  - 「次の食事候補」を保存するテーブル

- `partner_products`
  - `store_id`, `product_name`, `product_code`, `price_jpy`, `estimated_*`
  - 将来提携候補候補データ（初期は未使用）

- `partner_stores`
  - `store_code`, `store_name`, `region`
  - 将来ローカル商圏の候補表示用

- `audit_logs`
  - `actor_user_id`, `action`, `target_table`, `target_id`, `details`
  - 将来監査目的（個人同定を伴う閲覧ログ）

## migrationとの差分

- Phase 2 の migration (`supabase/migrations/0001_initial_schema.sql`) で上記の基本カラムを SQL 定義化。
- RLSは初期時点で `profiles/user_goals/meal_* / nutrition_* / recommendations` の4系を本人限定に固定。
