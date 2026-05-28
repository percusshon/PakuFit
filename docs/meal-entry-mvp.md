# PakuFit 食事登録MVP（Phase 3）

## 実装範囲

- `/meals/new` から食事記録の最小保存
- `/meals` に本人の食事記録一覧を表示
- `/summary` で本日件数と概算カロリー合計を集計
- `meal_entries` の保存対象はフォーム入力値を中心に固定
- 認証ユーザーのみ保存・参照（RLS前提）

## 入力項目

- 食事区分（`meal_type`）
  - `breakfast` / `lunch` / `dinner` / `snack` / `other`
- 食べた日時（`eaten_at`）
- 食事名（`title`）
- メモ（`description`）
- 概算カロリー（`estimated_calories`）
- 食べた量メモ（`portion_note`）
- 調理/状態メモ（`preparation_note`）

## 保存先テーブル

- `meal_entries`（本人IDは `user_id`）

## `user_id` の扱い

- `user_id` はクライアントから受け取らず、`requireAuthUser()` / `auth.getUser()` 由来で決定
- `/meals/new` の保存処理は `user_id` をサーバー側で確定し、保存時に `user_id` を必ず付与
- クエリ側でも `.eq("user_id", user.id)` を入れて本人絞り込み

## RLS前提

- `meal_entries` は `auth.uid() = user_id` を条件にした `select/insert/update/delete` 方針を維持
- 保存成功後は `/meals` に戻り、本人一覧を表示

## 未実装範囲

- 写真アップロード
- AI Vision / 自動食材推定
- バーコード/JANコード連携
- PFC明細の自動計算
- 収益化導線

## 安全表現ポリシー

- 画面上文言は「概算」「ユーザー確認が必要」「参考情報」「次の食事候補」を前提
- 「この食事で痩せる」「必ず食べる」等の断定を避ける

## 補足

- `estimated_calories` は0〜5000 kcalを入力上限として、医療判断ではなく入力ミス抑止のための暫定ルールで扱う
