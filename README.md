# PakuFit / パクフィット

PakuFit は食事の写真・テキスト記録をサポートし、カロリー/PFCを**概算**として扱う BtoC向け食事記録アプリのMVPです。

## 開発ステータス

- Phase 1: Next.js + Supabaseの設計スキャフォールド（完了）
- Phase 2: Supabase Auth + 初期DB migration + RLS土台（完了）
- Phase 2.5: Supabase local RLS検証（完了）

## 重要な方針

- サービス上の表現は「次の食事候補」「バランスを取りやすい候補」「概算」「ユーザー確認が必要」を基本語彙にする。
- 医療的判断や結果保証を目的とする表現や断定を避けます。
- AI推定は確定値として扱わず、あくまで参考情報。

## セットアップ

```bash
npm install
```

## 起動・検証

```bash
cp .env.example .env.local
npm run dev
npm run lint
npm run typecheck
npm run build
npm run lint
npm run typecheck

## Supabase ローカル検証

```bash
supabase start
supabase db reset
supabase test db
```
```

## 環境変数（`.env.example`）

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

> `service_role` キーは使用しません。

## Supabase

- `supabase/migrations/0001_initial_schema.sql` に初期テーブルとRLSを定義
- RLS確認用に `supabase/seed/rls_test_seed.sql`, `supabase/tests/rls_access_tests.sql` を追加

## Phase 2完了内容

- App Router 側の Magic Link ログイン導線
- callback/logout ルート
- 認証必要ページの保護
- `@supabase/ssr` を使ったクライアント/サーバー両面ヘルパー
- 初期DB migration とRLS基盤

## セーフティ

- 摂食障害リスク、未成年配慮、体調面の注意文言をUI上で維持。
- 商用運用前に運用監視と文言監査を実施。
