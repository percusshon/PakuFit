# PakuFit 次の食事候補履歴MVP（Phase 7）

## 実装範囲

- 固定ルール候補を表示する `/recommendations` 画面から、本人が任意で候補を保存する。
- 保存した候補を `/recommendations/history` で本人分の履歴として閲覧する。
- 保存対象は候補表示の運用情報に限定し、個別写真・自由記述メモ本文・体重データ・医療的評価結果は保存しない。
- `service_role` は使わず、`requireAuthUser('/login')` 由来の本人認証IDでサーバー側保存する。

## 保存するデータ

- 保存日時（`generated_at`）
- 目標タイプ（`goal_category`）
- データ充足度（`data_completeness`）
- 候補キー（`candidate_key`）
- 候補タイトル / 説明（`candidate_name`, `explanation`）
- 理由コード / 理由ラベル（`reason_code`, `reason_label`）
- 注意文（`caution_text`）
- 保存元（`source`、`rule_based`）
- 最小限の `snapshot`

## 保存しないデータ

- 食事写真や保存された画像URL
- 自由記述の個別メモ本文
- 体重や診断結果などの個別生体指標
- 商品名の医療的判定や治療的なラベル

## RLS方針

- 既存 `meal_recommendations` RLS は本人データ専用の select/insert/update/delete を維持。
- 取得関数では `eq('user_id', user.id)` を明示し、保存/表示ともサーバー側認証ユーザーID起点で運用。

## Phase 7.5: 重複保存抑制

- 現状の保存フローは `server action` 側で同一ユーザーの重複保存を抑制。
- 抑制条件:
  - `user_id` が同一
  - `recommendation_date` が同一
  - `candidate_key` が同一
  - `source = 'rule_based'`
- 条件が重複した場合は `meal_recommendations` へ `insert` せず、保存結果ページへ `?status=already_saved` を付与して遷移。
- 保存成功時は `?status=saved`、保存失敗時は `?error=save_failed` へ遷移。
- 本段階では DB 側の unique 制約は追加せず、既存 0005 仕様を維持した最小変更にしています。

## 履歴表示

- `/recommendations/history` で保存履歴を新しい順に一覧表示。
- 空状態では「保存済みの候補はまだありません」とし、候補一覧へ導線を提示。
- `source` は `rule_based` 固定で、今後AI推定保存へは拡張しない。

### 履歴ページの表示ステータス

- `?status=saved`: 保存しました（固定ルール由来の参考候補）
- `?status=already_saved`: 本日分の同一候補がすでに保存済み
- `?error=save_failed`: 保存処理が失敗

### 実ブラウザ確認（ローカル）

- 未ログインで `/recommendations/history` にアクセスした場合は `/login` へ誘導されることを確認。
- 保存ボタンから `/recommendations` → `/recommendations/history` の導線が機能することを前提に確認。
- 重複保存時に同一候補が再作成されず、ステータスメッセージが切り替わる想定で実装。

## 未実装範囲

- 具体的なコンビニ商品名や提携商品の最適化提案の保存は未実装。
- 重複排除の高度制御（完全なデデュープ）は導入しない。

## 安全な運用メッセージ

- 候補は「固定ルールによる参考候補」であり、指示ではない。
- 表現は「概算」「ユーザー確認が必要」「一般的な食事管理の参考情報」を前提とする。
- AI診断・治療・疾病改善を示唆する文言は採用しない。
