# PakuFit 食事登録MVP（Phase 4）

## 実装範囲

- `/meals/new` で食事記録の保存に加え、概算PFCを任意入力できる
- `/meals` に本人の食事記録一覧を表示（カロリー/PFCの表示を追加）
- `/summary` で本日件数、概算カロリーと概算PFC合計を表示
- `meal_entries` を主キー情報とし、`nutrition_estimates` へPFCを保存

## PFC入力拡張

- 追加入力項目（任意）
  - たんぱく質（g）
  - 脂質（g）
  - 炭水化物（g）
  - 食物繊維（g）
  - 食塩相当量（g）
- すべて `0` 以上で上限あり、入力ミス防止ルールで検証
- 負の値・上限超過は保存不可（サーバー側で判定）

## 保存先テーブル

- カロリーは従来どおり `meal_entries.estimated_calories` を一覧・サマリーの基礎として扱う
- PFCは`nutrition_estimates`に保存
  - `estimated_protein_g`
  - `estimated_fat_g`
  - `estimated_carbs_g`
  - `estimated_fiber_g`
  - `estimated_salt_g`
- いずれもユーザー入力の任意値として扱う

## `user_id` の扱い

- 保存時はクライアント入力は使わず、`requireAuthUser()` で得た認証ユーザーIDを使う
- `meal_entries` と `nutrition_estimates` の双方で `user_id = auth.uid()` を必須化するRLS前提を維持

## RLS方針

- 食事本人情報のみ参照可能な制御を維持
- `nutrition_estimates` は本人のデータのみ読取/更新
- 他ユーザーの `nutrition_estimates` に対してはアクセス不可

## Phase 5連携

- `nutrition_estimates` の当日合計値とPFC入力件数を、次の食事候補の固定ルールロジックに渡す前提です。
- 候補側は `meal_entries` の保存後データを前提に、AI推定ではなく説明可能なルールで表示します。

## 非実装範囲

- 写真アップロード
- AI Vision/自動推定
- バーコード/JANコード連携
- コンビニDB/提携候補/広告導線
- 自動目標達成判定・減量助言

## 安全表現ポリシー

- 「概算」「任意入力」「ユーザー確認が必要」を明示
- 「この食事で痩せる」等の断定表現を避ける

## 補足（入力制限）

- `たんぱく質/脂質/炭水化物`: `0〜500 g`
- `食物繊維`: `0〜100 g`
- `食塩相当量`: `0〜50 g`
- 上限は医療判断ではなく入力ミス防止の暫定ルール
