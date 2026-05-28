# PakuFit / パクフィット

PakuFit は食事記録をサポートするためのMVPアプリです。

カロリー/PFCは「概算」として扱い、食事候補は「次の食事候補 / バランスを取りやすい候補」として提示します。

## 開発ステータス

- Phase 1: Next.js + Supabase scaffold
- Phase 2: Auth / RLS土台
- Phase 2.5: Supabase local RLS検証
- Phase 3: 食事登録MVP（本登録、一覧、当日サマリー）

## 主要ポリシー

- 医療・診断・治療目的の断定表現は使いません。
- 極端な減量・断食推奨は行いません。
- 食事データの保存・参照は本人認証前提（RLS + Supabaseの`public anon key`）です。

## セットアップ

```bash
npm install
cp .env.example .env.local
```

必要な環境変数（`.env.example`）:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

`service_role` キーは使用しません。

## 起動・検証コマンド

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Phase3の食事保存フローを検証する場合:

```bash
supabase start
supabase db reset
supabase test db
npm run lint
npm run typecheck
npm run build
```

## 検証時の補足

- `supabase test db` はローカルDB起動後に実行します。
- `.env.local` は Git 管理対象外です（`.gitignore` で除外）。
- `service_role` の利用は想定せず、`requireAuthUser` と RLS 前提で実装します。

## フォルダ構成（抜粋）

- `app/`: 画面ルート
- `components/`: 共通UI
- `lib/supabase/`: Supabase client helper
- `lib/meals/`: 食事保存/取得ロジック
- `lib/types/`: 型定義
- `supabase/migrations/`: DB定義
- `docs/`: 設計・RLS・進捗

## Phase3での保存対象

- `/meals/new`: 食事フォーム（`meal_type` / `eaten_at` / `title` / `description` / `estimated_calories` / `portion_note` / `preparation_note`）
- `/meals`: ログイン中ユーザーの最新50件を表示
- `/summary`: 本日件数と概算カロリー合計を表示

今後は写真アップロード、AI推定、バーコード/JANコード、PFC詳細自動計算、提携候補導線を拡張予定です。
