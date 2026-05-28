# PakuFit App Scaffold

## 追加した画面

- `/`（トップ）
  - 概要、主要機能、開発中ステータス
- `/login`
  - 認証UI雛形（接続は次フェーズ）
- `/meals`
  - 食事記録一覧（サンプルデータ表示）
- `/meals/new`
  - 食事登録フォーム（写真/テキスト）
- `/summary`
  - 1日サマリ（カロリー/PFC概算）
- `/recommendations`
  - 次の食事候補提示（固定ルール前提）
- `/privacy`
  - プライバシー方針
- `/safety`
  - 表現ルール・安全原則
- `/settings/goals`
  - 目標設定

## 追加した共通コンポーネント

- `components/app-header.tsx`
  - 共通ヘッダーと主要導線
- `components/page-container.tsx`
  - 各ページの共通レイアウト
- `components/safety-notice.tsx`
  - 共通安全文言
- `components/feature-card.tsx`
  - ランディングのカードUI
- `components/status-badge.tsx`
  - データ状態を表す簡易バッジ

## Supabase接続方針

- `lib/supabase/client.ts`
  - ブラウザ側から`@supabase/supabase-js`の`createClient`を使う土台
- `lib/supabase/server.ts`
  - サーバー側で同一認証情報を使ってクライアントを生成する土台
- `lib/env.ts`
  - `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`を利用
- `service_role`キーは使わず、匿名キー前提
- 現段階は接続成立前提のUI検証ができる構造に留める

## 未実装範囲（本フェーズ）

- 実Supabaseプロジェクト接続（URL/APIキー未設定）
- 実AI Vision API
- JAN/バーコードAPI
- コンビニDB連携
- 決済・広告・アフィリエイト
- 実際のカロリー計算ロジック（現在は型・画面上のサンプル）

## 安全表現方針

- 禁止
  - 「必ず食べるべき」
  - 「この食事で痩せる」
  - 「病気を防ぐ」
  - 「AI栄養指導」
- 推奨
  - 「食事記録をサポート」
  - 「カロリー/PFCを概算」
  - 「ユーザー確認が必要」
  - 「次の食事候補」
