# PakuFit / パクフィット

PakuFit は食事記録をサポートするためのMVPアプリです。

カロリー/PFCは「概算」として扱い、食事候補は「次の食事候補 / バランスを取りやすい候補」として提示します。

## 開発ステータス

- Phase 1: Next.js + Supabase scaffold
- Phase 2: Auth / RLS土台
- Phase 2.5: Supabase local RLS検証
- Phase 3: 食事登録MVP（本登録、一覧、当日サマリー）
- Phase 4: PFC/栄養概算入力MVP
- Phase 5: 次の食事候補（固定ルールMVP）
- Phase 5.5: 固定ルール推薦ロジックの単体テスト追加
- Phase 6: user_goalsを推薦へ反映

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
npm run test
```

Phase3の食事保存フロー検証:

```bash
supabase start
supabase db reset
supabase test db
npm run lint
npm run typecheck
npm run build
```

Phase4のPFC入力MVP検証:

```bash
supabase start
supabase db reset   # migrations 0001/0002/0003 が適用されること
supabase test db    # nutrition_estimates のRLSを含むテスト
npm run lint
npm run typecheck
npm run build
```

Phase5の次の食事候補MVP検証:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
supabase test db
```

補足:

- 候補表示は「固定ルールによる参考候補」であり、AI推薦や診断・治療を示すものではありません。
- 本フェーズは表示優先のため、候補履歴の保存は次フェーズで追加する方針です。

Phase5.5（推薦ロジックテスト）:

```bash
npm run test
```

- `lib/recommendations/calculate-meal-recommendations.ts` の主要分岐（未記録/PFC未入力/低たんぱく/高脂質/低炭水化物/時間帯）を固定の期待結果で検証。
- 禁止表現（「食べるべき」「痩せる」「治療」など）が出力文字列に含まれないことを自動確認。

Phase6（user_goals推薦連携）:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
supabase test db
```

- 目標保存（`/settings/goals`）と、`/recommendations` の候補表示で目標反映が成立することを確認。
- 固定ルールは「次の食事候補」「バランスを取りやすい候補」に限定し、医療・診断・治療として扱わないことを前提に維持。

## 検証時の補足

- `supabase test db` はローカルDB起動後に実行します。
- `.env.local` は Git 管理対象外です（`.gitignore` で除外）。
- Supabase Local 環境が未起動の場合、`test db` も `db reset` も失敗するため先に `supabase start` が必要です。
- `service_role` の利用は想定せず、`requireAuthUser` と RLS 前提で実装します。

## フォルダ構成（抜粋）

- `app/`: 画面ルート
- `components/`: 共通UI
- `lib/supabase/`: Supabase client helper
- `lib/meals/`: 食事保存/取得ロジック
- `lib/types/`: 型定義
- `supabase/migrations/`: DB定義
- `docs/`: 設計・RLS・進捗

## Phase4での保存対象

- `/meals/new`: 食事フォーム（`meal_type` / `eaten_at` / `title` / `description` / `estimated_calories` / `portion_note` / `preparation_note`）
  - 追加: `estimated_protein_g` / `estimated_fat_g` / `estimated_carbs_g` / `estimated_fiber_g` / `estimated_salt_g`（任意）
- `/meals`: 本人ログインユーザーの最新50件を表示
- `/summary`: 本日件数、概算カロリー、概算たんぱく質/脂質/炭水化物合計、任意で食物繊維/食塩相当量を表示

今後は写真アップロード、AI推定、バーコード/JANコード、PFC自動計算、提携候補導線を拡張予定です。
