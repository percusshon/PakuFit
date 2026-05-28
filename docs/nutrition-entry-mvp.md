# PakuFit 栄養値入力MVP（Phase 4）

## 実装範囲

- 食事登録時に概算カロリーに加えて、PFC（概算）を手入力で保存
  - たんぱく質（g）
  - 脂質（g）
  - 炭水化物（g）
  - 食物繊維（g）
  - 食塩相当量（g）
- `/meals` と `/summary` で保存済みのPFCを表示
- `nutrition_estimates` をPFC保存の専用テーブルとして使用

## 手入力を優先する理由

- Phase 4ではAI推定や自動計算を行わない
- まずは本人が「概算」を短時間で登録できる導線を優先
- 後続Phaseで写真推定結果や学習結果と突き合わせる前提を保留

## 自動推定ではないこと

- 本フェーズは入力値の記録が主目的
- カロリー/PFCは初期表示値であり、最終判断は本人の確認が必要
- 「自動最適化」「診断」は行わない

## 入力上限（入力ミス防止）

- たんぱく質/脂質/炭水化物: `0〜500 g`
- 食物繊維: `0〜100 g`
- 食塩相当量: `0〜50 g`
- これらは医療判断ではなく、過大・未入力の誤防止を目的とした暫定ルール

## 保存先テーブル

- `meal_entries`:
  - 従来の `estimated_calories` を引き続き表示/集計基盤として保持
- `nutrition_estimates`:
  - `estimated_protein_g` / `estimated_fat_g` / `estimated_carbs_g`
  - `estimated_fiber_g` / `estimated_salt_g`
  - `user_id`, `meal_entry_id` は認証ユーザー起点で保存

## RLS方針

- `meal_entries` と同様に本人限定読み取り・更新
- `user_id` はクライアントから受け取らず、`requireAuthUser()` 由来で決定

## 未実装範囲

- 写真AI推定
- バーコード/JANコード
- コンビニ提携候補の自動推薦
- PFC不足時の医療的な評価（助言）
