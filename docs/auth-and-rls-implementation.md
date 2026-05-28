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
