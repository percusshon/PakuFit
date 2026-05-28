# パクフィット / PakuFit

## 概要

パクフィット（PakuFit）は、食事写真・テキスト入力をもとに、1日あたりのカロリー/PFC（たんぱく質・脂質・炭水化物）を概算し、次の食事候補を提案する食事記録アプリです。

本プロジェクトは、**診断・治療・疾病改善を目的としない一般的な食事記録と行動サポート**を扱います。

### 現在の開発ステータス

- Phase0: 設計ドキュメント完了（READMEと各種要件・設計）
- Phase1: Next.js + Supabase scaffold 完了（本リリース）
- Phase2+: 食事記録MVP実装へ移行中

## 開発範囲（MVP）

- ユーザー登録/ログインUI（接続は次フェーズ）
- 食事写真アップロード導線（実接続は次フェーズ）
- 食事テキスト入力
- AI推定結果の表示（設計上の候補）
- 料理名・量・食べた割合・調理方法のユーザー補正
- カロリー/PFCは概算として表示
- 1日の合計・残量サマリー
- 次の食事候補提示
- 目標設定UIの土台

## 非MVP（本フェーズ未実装）

- 実AI Vision API接続
- JAN/バーコード/API連携
- コンビニ/スーパー商品DB連携
- 決済・広告・アフィリエイト
- 本格的な認証連携（Supabase接続は準備段階）

## 開始方法

```bash
npm install
npm run dev
```

開発サーバー: [http://localhost:3000](http://localhost:3000)

## scaffold後の検証コマンド

```bash
npm run lint
npm run typecheck
npm run build
```

## 環境変数（準備）

- 実データの接続情報は `env.example` 参照
- `.env`, `.env.local`, `.env.*.local` はGit管理対象外
- public anon keyのみを前提とし、`service_role`は使いません

## Phase1完了内容

- Next.js 14 + TypeScript + App Router + Tailwind土台
- 画面ルート追加
  - `/login`
  - `/meals`
  - `/meals/new`
  - `/summary`
  - `/recommendations`
  - `/privacy`
  - `/safety`
  - `/settings/goals`
- Supabase準備ヘルパー追加
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/env.ts`
- 型定義（表示前提）
  - `lib/types/meal.ts`
  - `lib/types/nutrition.ts`
  - `lib/types/recommendation.ts`
- 共通コンポーネント
  - `components/app-header.tsx`
  - `components/page-container.tsx`
  - `components/safety-notice.tsx`
  - `components/feature-card.tsx`
  - `components/status-badge.tsx`
- デモデータ追加
  - `lib/demo/demo-meals.ts`
  - `lib/demo/demo-recommendations.ts`

## 安全方針

- 医療・診断・治療の断定をしない
- 表示文言は「候補」「概算」「一般的な食事管理の参考情報」を基本とする
- 摂食障害リスク等への配慮文言を常設表示する

## ファイル構成メモ

- `docs/repository-structure.md` に推奨フォルダ名 `pakufit` と現状フォルダ名の関係を明記
- `docs/app-scaffold.md` に画面追加内容、未実装範囲、接続方針、安全表現を記載
