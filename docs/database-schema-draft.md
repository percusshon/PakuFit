# DB設計ドラフト（初期MVP）

## 全体方針

- PostgreSQL（Supabase想定）
- PIIを最小化し、本人参照を`auth.users.id`に紐づけ
- 推定は確定値として扱わず、補正後値の監査可能な追跡を残す
- 将来連携を見据え、`partner_products`と`partner_stores`を事前に準備

## profiles

- 目的: ユーザー基本情報と利用同意状態
- 主要カラム
  - `id uuid PK`（`auth.users.id`）
  - `display_name text`
  - `nickname text`
  - `birth_year int4`（任意）
  - `consent_minor_note text`
  - `health_risk_disclosure_accepted boolean`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本人のみ参照/更新

## user_goals

- 目的: 1日の目標設定を保持
- 主要カラム
  - `id uuid PK`
  - `user_id uuid FK`
  - `goal_type text`（体重管理/食事バランス改善/高たんぱく/脂質控えめ/外食対応）
  - `target_calories int4`
  - `target_protein_g numeric`
  - `target_fat_g numeric`
  - `target_carb_g numeric`
  - `meal_preference text`（自炊/コンビニ/外食/バランス）
  - `notes text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本人のみ参照/更新

## meal_entries

- 目的: 1回分の食事記録（食事単位）を管理
- 主要カラム
  - `id uuid PK`
  - `user_id uuid FK`
  - `eaten_at timestamptz`
  - `meal_label text`（朝/昼/夜/夜食）
  - `source text`（photo/text）
  - `memo text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本人のみ参照/作成/更新/削除

## meal_photos

- 目的: 食事ごとの画像参照
- 主要カラム
  - `id uuid PK`
  - `meal_entry_id uuid FK`
  - `storage_path text`
  - `file_hash text`
  - `mime_type text`
  - `status text`（uploading/done/failed）
  - `captured_at timestamptz`
  - `created_at timestamptz`
- RLS
  - 本人のみ、meal_entryの所有者経由で参照
  - 管理者は原則非閲覧（監査要件時は匿名化済み情報のみ）

## food_items

- 目的: 1食事内の料理/食材単位
- 主要カラム
  - `id uuid PK`
  - `meal_entry_id uuid FK`
  - `food_name text`
  - `normalized_food_name text`
  - `quantity numeric`
  - `unit text`（g/ml/個/杯）
  - `cooking_method text`
  - `eaten_ratio numeric`
  - `source text`（ai/manual/ai-corrected）
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本人のみ参照/更新

## nutrition_estimates

- 目的: 推定値と補正値の履歴管理
- 主要カラム
  - `id uuid PK`
  - `food_item_id uuid FK`
  - `estimated_calories numeric`
  - `estimated_protein_g numeric`
  - `estimated_fat_g numeric`
  - `estimated_carb_g numeric`
  - `corrected_calories numeric`
  - `corrected_protein_g numeric`
  - `corrected_fat_g numeric`
  - `corrected_carb_g numeric`
  - `confidence_score numeric`
  - `estimator_type text`（vision/manual-rule）
  - `correction_reason text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本人のみ

## daily_nutrition_summaries

- 目的: 日次サマリの保存（計算補助）
- 主要カラム
  - `id uuid PK`
  - `user_id uuid FK`
  - `summary_date date`
  - `total_calories numeric`
  - `total_protein_g numeric`
  - `total_fat_g numeric`
  - `total_carb_g numeric`
  - `remaining_calories numeric`
  - `remaining_protein_g numeric`
  - `remaining_fat_g numeric`
  - `remaining_carb_g numeric`
  - `confidence_note text`
  - `updated_at timestamptz`
  - `created_at timestamptz`
- RLS
  - 本人のみ

## meal_recommendations

- 目的: 提案履歴の保存
- 主要カラム
  - `id uuid PK`
  - `user_id uuid FK`
  - `recommendation_date date`
  - `generated_at timestamptz`
  - `context_json jsonb`
  - `recommendation_json jsonb`
  - `safety_notice text`
  - `is_followed boolean`
  - `clicked_item_id uuid`
  - `created_at timestamptz`
- RLS
  - 本人のみ

## partner_products

- 目的: 将来連携向けの商品マスタ（非MVPでも設計）
- 主要カラム
  - `id uuid PK`
  - `store_id uuid FK`
  - `product_name text`
  - `brand text`
  - `nutrition_json jsonb`
  - `price_jpy numeric`
  - `availability_status text`
  - `region_codes text[]`
  - `is_partnered boolean`
  - `ad_type text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 管理運用テーブルとして、一般ユーザーは原則参照不可
  - 推奨候補は匿名化または必要最小限表示

## partner_stores

- 目的: 店舗・提携元管理
- 主要カラム
  - `id uuid PK`
  - `store_name text`
  - `chain_name text`
  - `region_code text`
  - `address text`
  - `is_active boolean`
  - `api_endpoint_url text`
  - `partner_contract_status text`
  - `created_at timestamptz`
  - `updated_at timestamptz`
- RLS
  - 本システム管理者向け管理テーブルとして参照制限

## audit_logs

- 目的: 重要操作の監査
- 主要カラム
  - `id uuid PK`
  - `actor_user_id uuid`
  - `actor_role text`
  - `target_table text`
  - `target_id uuid`
  - `action text`（insert/update/delete/view）
  - `metadata jsonb`
  - `created_at timestamptz`
- RLS
  - 一般ユーザー不可
  - 運用監査ロールのみ必要最小アクセス

## 追加前提（未確認）

- `enum`設計は初期は`text`で代替し、必要時に`CHECK`制約や`enum`化を検討
- 監査対象の範囲は開示可能範囲と規制対応を確認して最終決定
