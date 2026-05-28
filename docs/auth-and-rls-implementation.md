# PakuFit Auth / RLS実装メモ（Phase 2）

## 目的

- Next.js App Router で Supabase Auth の導線を最小構成で整える。
- Magic Link でのログイン + ログアウト + コールバック処理を用意する。
- `profiles`, `user_goals`, `meal_entries` などのユーザー関連テーブルを本人限定で参照/更新できるRLS前提にする。
- `service_role` を使わず、`public anon key` のみで動く形を前提にする。

## Auth実装

- クライアント側
  - `lib/supabase/client.ts` を `@supabase/ssr` の `createBrowserClient` で統一。
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` を使用。
- サーバー側
  - `lib/supabase/server.ts` を `createServerClient` + `cookies()` 対応で実装。
  - `getServerUser`, `requireAuthUser` ヘルパーを追加。
- ログイン導線
  - `app/login/page.tsx` にメールアドレス入力フォームを実装。
  - `signInWithOtp` で Magic Link を送信。
  - エラーハンドリングは簡易なステート（`sent`, `error`）で表示。
- callback
  - `app/auth/callback/route.ts`
  - `code` を受けて `exchangeCodeForSession` を実行。
  - 成功時は `/meals` へ遷移。
  - 失敗時は `/login?error=auth_callback_failed`。
- logout
  - `app/logout/route.ts` で `signOut`。
  - 成功時は `/login` に戻す。

## 保護ページ

以下のページは `requireAuthUser` 経由で未認証時 `/login` に遷移する。

- `/meals`
- `/meals/new`
- `/summary`
- `/recommendations`
- `/settings/goals`

## RLS方針

- 本人データテーブルは、`auth.uid() = user_id` を基準に `select/insert/update/delete` を制御。
- `partner_products` と `partner_stores` は初期は読み取りのみ。
  - 認証ユーザーのみ `select`
  - insert/update/delete は未許可（クライアント側経由不可）。
- `audit_logs` は初期状態でクライアントからの操作を許可しない。
- すべて `service_role` 非依存のRLS前提。

## 未実装範囲

- 画像アップロード/API連携による保存
- 食事の実保存フロー（`/meals/new` の送信処理）
- 実運用向けのリフレッシュトークン再試行ポリシー
- バックグラウンドジョブや監査運用ロール

## 安全表現

- カロリー/PFCは「概算」として扱う。
- 記録・提案は「次の食事候補」「参考情報」として表示。
- 医療的な断定表現は表示しない。

## ローカルRLS検証（Phase 2.5）

- 実行コマンド:
  - `supabase start`
  - `supabase db reset`
  - `supabase test db`
- 初回は `supabase start` が長時間停止し、既存の他プロジェクトコンテナとのポート競合を回避するため、
  `supabase/config.toml` のポートをPakuFit専用（`5432`系を避けた）に変更。
- migrationは `policy` 文で `IF NOT EXISTS` を使用していたため、`supabase db reset` 時に構文エラーが発生したため除去。
- `supabase/tests/rls_access_tests.sql` を pgTAP 形式に更新し、`plan` を定義して `supabase test db` に適合させた。
- テスト内容:
  - `meal_entries` の本人読取/他人不可
  - `user_goals` の本人更新可/他人更新不可
  - `partner_products` `insert/update/delete` の一般ユーザー拒否
  - `partner_stores` `insert/update/delete` の一般ユーザー拒否
  - `audit_logs` の `select/update/delete` 拒否
- `supabase/tests/rls_access_tests.sql` では JWT クレームを `request.jwt.claims` にセットし、
  `public.set_test_jwt()` で `authenticated` コンテキストを再現。
- `supabase/seed/rls_test_seed.sql` に `auth.users` の固定IDを含む最小ダミーデータを追加し、
  FK制約を満たしたテーブル参照を前提にしたテストを実行可能にした。

### 変更点の要約

- `supabase/seed/rls_test_seed.sql`: テストユーザー、食事、目標、パートナー候補、auditログをダミー登録。
- `supabase/tests/rls_access_tests.sql`: pgTAP化、拒否ケースを `throws_ok` で明示化。
- `supabase/config.toml`: ローカル起動時のポートをPakuFit用に調整。
- service_roleキーや実データを使わず、`public anon key` 前提の検証のみを実施。
