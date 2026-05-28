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
