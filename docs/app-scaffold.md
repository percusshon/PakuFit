# PakuFit App Scaffold（現状）

## Phase 1（完了）

- Next.js 14 App Router + TypeScript + Tailwind の土台
- 主要画面追加
  - `/`
  - `/login`
  - `/meals`
  - `/meals/new`
  - `/summary`
  - `/recommendations`
  - `/privacy`
  - `/safety`
  - `/settings/goals`
- 共通コンポーネント導入
  - `components/app-header.tsx`
  - `components/page-container.tsx`
  - `components/safety-notice.tsx`
  - `components/feature-card.tsx`
  - `components/status-badge.tsx`

## Phase 2（本対応）

- Auth基盤を追加
  - `app/login/page.tsx`: メールアドレスによる Magic Link 入力
  - `app/auth/callback/route.ts`: `code` を使ってセッション確立
  - `app/logout/route.ts`: ログアウト
- Auth状態表示
  - `components/app-header.tsx` をログイン状態に応じて差し替え
  - ログイン中はメールとログアウトリンク表示
- 保護ページ
  - `/meals`, `/meals/new`, `/summary`, `/recommendations`, `/settings/goals` を server 側で未ログイン時 `/login` 遷移
- Supabase helperをSSR前提へ
  - `lib/supabase/server.ts` を cookie 対応に
  - `lib/env.ts` で必須環境変数名を確認
- DB migration + RLS土台
  - `supabase/migrations/0001_initial_schema.sql` 追加
  - `supabase/tests/rls_access_tests.sql` / `supabase/seed/rls_test_seed.sql` 追加

## Phase 3（食事登録MVP）

- 食事保存MVP（`meal_entries`）を実装し、本人データだけを一覧/保存・集計へ接続
- 追加・更新ファイル
  - `lib/meals/actions.ts`（Server Action `createMealEntry`）
  - `lib/meals/queries.ts`（`getRecentMealEntries`, `getTodayMealSummary`）
  - `app/meals/page.tsx`（本人の食事一覧）
  - `app/meals/new/page.tsx`（食事登録フォーム）
  - `app/summary/page.tsx`（本日件数と概算カロリー）
- 追加migration
  - `supabase/migrations/0002_meal_entry_mvp.sql`（`meal_type` などMVPフィールド）
- `/recommendations` は表示文言を、記録ベースの候補設計前提に更新

## Phase 4（PFC/栄養概算入力MVP）

- `/meals/new` にPFC任意入力欄を追加（たんぱく質/脂質/炭水化物/食物繊維/食塩相当量）
- 保存時は `meal_entries` に加えて `nutrition_estimates` へ関連レコードを保存
- `/meals` に概算PFCを表示
- `/summary` に本日PFC合計を追加表示
- 新規migration
  - `supabase/migrations/0003_nutrition_estimate_mvp.sql`（`nutrition_estimates` のPFC拡張）
- RLSテストを `nutrition_estimates` 操作観点で拡張

## Phase 5（次の食事候補：固定ルールMVP）

- `/recommendations` を実データ接続し、`getTodayMealSummary` の結果を元に固定ルール候補を表示
- `lib/recommendations/calculate-meal-recommendations.ts` を新規追加
- 候補条件の例
  - 今日の記録が0件: 記録を促す導線を優先表示
  - PFC入力不足: 不確実性文言を明示
  - たんぱく質不足・脂質高め・炭水化物不足を条件化
  - 18時以降は「重すぎない候補」を追加
- 表示文言は「AI推薦ではなく固定ルールによる参考候補」に統一
- `/summary` に `/recommendations` 導線を追加

## Phase 6（user_goals接続）

- `user_goals` 取得処理を追加 (`lib/goals/queries.ts`) し、`getCurrentUserGoal` でログインユーザーの有効目標を参照。
- `/recommendations` に目標表示を追加し、目標未設定時は設定画面誘導を表示。
- `calculateMealRecommendations` の入力に目標情報を追加して、候補の優先順位と文言を目標別に最小調整。
- `/settings/goals` は新目標キーへ更新（旧キーは表示上引き継ぎ可能）。

## Phase 7（次の食事候補履歴MVP）

- `lib/recommendations/actions.ts` を追加し、表示候補を本人ユーザーとして保存。
- `lib/recommendations/queries.ts` を追加し、保存履歴を本人分新着順で取得。
- `/recommendations` へ候補保存ボタンを追加し、保存後に履歴画面へ遷移可能に。
- `/recommendations/history` を追加し、保存済み候補履歴一覧を実装。
- `lib/types/recommendation.ts` を `SavedMealRecommendation` 系で拡張。

## Phase 7.5（保存フロー検証と重複抑制）

- `/recommendations` の保存アクションを更新し、同一ユーザー同一日同一候補の重複保存をサーバー側で抑制。
- 保存結果を `/recommendations/history` 側で `saved` / `already_saved` / `save_failed` のステータス表示に反映。
- `/recommendations/history` は本人の履歴一覧に加え、保存結果メッセージを表示するよう更新。
