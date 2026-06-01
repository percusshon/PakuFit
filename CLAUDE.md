# PakuFit / パクフィット — プロジェクト CLAUDE.md

このファイルは PakuFit リポジトリ固有の仕様・前提・コマンドをまとめる。
共通の作業ルール（指示優先順位、最小差分、Git操作、検証手順、報告形式など）はグローバル CLAUDE.md に従う。ここには重複して書かない。

## コンセプト

- 食事記録をサポートする MVP アプリ（Next.js 14 App Router + Supabase）。
- カロリー/PFC は「概算」として扱う。確定値・診断値ではない。
- 食事提案は「次の食事候補」「バランスを取りやすい候補」として中立提示する。AI 推薦や診断・治療を示すものではない。
- 想定ユーザー: 忙しく記録が続きにくい成人、コンビニ/外食中心、極端なダイエットより日常のバランスを育てたい層。

## セーフティ・ポリシー（実装時の必須制約）

- 医療・診断・治療目的の断定表現を使わない。
- 「食べるべき」「痩せる」「治療」「効果がある」等の断定/結果保証表現を出力に混入させない（推薦ロジックのテストで自動検査している。`lib/recommendations/calculate-meal-recommendations.test.ts` 参照）。
- 極端な減量・断食・過度なカロリー制限の提案をしない。
- 推定値は「推定」「目安」「ユーザー確認が必要」であることを UI 上で明示する。
- 健康不安には専門家相談を促す（断定的助言をしない）。
- 食事写真・体重・履歴は本人に紐づくセンシティブ寄りデータとして扱う。

## 認証・データアクセス前提

- 認証は Supabase Magic Link。
- 全データアクセスは本人認証 + RLS（行レベルセキュリティ）前提。`requireAuthUser` と RLS を必ず通す。
- `service_role` キーは使用しない。クライアントは `public anon key` のみ。
- 新規テーブル/カラムを追加する場合は、対応する RLS ポリシーと `supabase/tests/` のアクセステストを必ず併せて追加する。

## 技術構成

- Next.js `^14.2`（App Router、`typedRoutes` 実験機能有効）、React 18、TypeScript。
- Supabase（`@supabase/ssr` + `@supabase/supabase-js`）。
- Tailwind CSS。
- テスト: Vitest。

## ディレクトリ構成（抜粋）

- `app/`: 画面ルート（`/meals`・`/meals/new`・`/summary`・`/recommendations`・`/recommendations/history`・`/settings/goals`・`/login`・`/privacy`・`/safety` など）。
- `app/api/`: API ルート（`meals/estimate` は写真AI概算）。
- `components/`: 共通 UI。
- `lib/supabase/`: client/server ヘルパ。
- `lib/meals/` `lib/recommendations/` `lib/summary/` `lib/goals/`: ドメインロジック（actions/queries）。
- `lib/ai/`: 写真AI栄養概算（provider 差し替え式）。
- `lib/types/`: 型定義。
- `supabase/migrations/`: DB 定義（連番）。`supabase/tests/`: RLS テスト。`supabase/seed/`: テスト用 seed。
- `docs/`: 設計・要件・RLS・ロードマップ・Phase 別検証手順。仕様の一次情報はここ。

## 環境変数

`.env.example` を `.env.local` にコピーして設定（`.env.local` は gitignore 済み。実値・本番値をコミットしない）。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`（例: `http://localhost:3000`）
- （写真AI用・任意）`PAKUFIT_VISION_PROVIDER` / `ANTHROPIC_API_KEY`。未設定ならモック provider、設定で実 Anthropic vision 呼び出し（失敗時はモック fallback）。

## ローカル環境（Supabase Local）

`supabase/config.toml`（project_id = `pakufit-local`）でポートを専用化済み。

- API: `http://127.0.0.1:55433`
- DB: `55432`（shadow `55431`）
- Studio: `55434`
- Inbucket / Mailpit（メール確認）: `55435`
- Analytics: `55436`
- Auth `site_url`: `http://localhost:3000`、redirect: `/auth/callback`

起動・リセット:

```bash
supabase start       # 先に起動していないと test db / db reset は失敗する
supabase db reset    # migrations を全適用
supabase test db     # RLS アクセステスト
```

ブラウザ起動は `npm run dev`（`http://localhost:3000`）。

## 検証コマンド

軽い順に実行する（グローバル CLAUDE.md の検証ルールに従う）。

```bash
npm run lint        # next lint
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
npm run build       # next build
supabase test db    # DB/RLS（supabase start 後）
```

## Phase 進捗

実装済み:

- Phase 1: Next.js + Supabase scaffold
- Phase 2: Auth / RLS 土台
- Phase 2.5: Supabase local RLS 検証
- Phase 3: 食事登録 MVP（登録・一覧・当日サマリー）
- Phase 4: PFC/栄養概算入力 MVP
- Phase 5: 次の食事候補（固定ルール MVP）
- Phase 5.5: 推薦ロジック単体テスト
- Phase 6: user_goals を推薦へ反映
- Phase 7: 次の食事候補履歴 MVP（保存・履歴表示）
- Phase 7.5: 推薦保存フロー検証（重複保存抑制）
- Phase 8: サマリー読み取りガイド MVP
- 写真AI栄養概算（`lib/ai/`・`app/api/meals/estimate`・`components/meal-photo-estimator.tsx`）。モック既定 + Anthropic vision 差し替え可能（commit 438eaf5）。
- PWA 基盤（`app/manifest.ts`・`app/icon.svg`・`public/icons/`・`public/sw.js`・`public/offline.html`・`components/pwa-register.tsx`）。インストール可能化 + ナビゲーション network-first + オフラインフォールバック（commit 3f2e496）。

進行中 / 未確定:

- （現在なし）

未着手（ロードマップ）— いずれも外部 API・データソース・収益モデル等の方針決定が必要なため、独断で確定実装しない:

- 写真AI 実プロバイダ確定
- バーコード/JAN 読取・JAN 一致時の候補補完
- コンビニ/スーパー商品DB 連携（在庫・価格・地域）
- 提携/広告/収益化（透明性付き導線）
- PWA 高度化（カメラ連携・高度なオフライン対応）※インストール可能化・基本オフラインは実装済み

## 用語の徹底

- 栄養値 = 「概算」「推定」「目安」。
- 食事提案 = 「候補」「判断材料」。「選択させる」「指示する」表現は避ける。
- 保存済み参考候補は `source=rule_based` 固定として扱う。

## このプロジェクトでの未確認点（着手前に要確認）

- 写真AI 実プロバイダの確定（モデル・コスト・プライバシー）。
- JAN/商品 DB の外部データソース選定と契約条件。
- 公開規制・地域法・個人情報保護法への詳細照合、商標（弁理士）レビュー。
