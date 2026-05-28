# PakuFit 目標連携型推薦MVP（Phase 6）

## 実装範囲

- `/settings/goals` で保存した目標を取得し、`/recommendations` の固定ルール候補表示に反映する。
- 目標は「断定」ではなく、候補表示の調整として扱う。
- `user_id` は常にサーバー側認証ユーザー由来とする。

## 目標タイプ（MVP）

- `weight_management`
- `balanced_meals`
- `higher_protein`
- `lower_fat`
- `convenience_store_friendly`

既存DBの `user_goals` にある旧キー（`balance_improvement` / `protein_focus` / `fat_moderation` / `convenience_balance`）は、段階移行互換として補正して吸収する。

## 推薦ロジックへの反映

- 目標に応じて候補の優先度をわずかに変える。
  - `higher_protein`: たんぱく質候補の優先を上げる。
  - `lower_fat`: 脂質コントロール候補の優先を上げる。
  - `balanced_meals`: バランス系候補の案内を補強する。
  - `convenience_store_friendly`: 外食/コンビニでも選びやすいカテゴリ文言を補う。
  - `weight_management`: 記録継続を前提にした安全文言を補う。
- 禁止表現は引き続き出さない。

## 禁止表現

- `痩せる` / `減量できる`
- `脂肪が落ちる`
- `食べるべき`
- `血糖値が改善`
- `病気を防ぐ`
- `治療` / `診断` / `疾病改善`

## 未実装

- 個別商品名の選定や自動レコメンド最適化は未実装。
- 今回は固定ルール＋目標反映を最小MVPとする。

## 将来接続

- 目標を参照した「予算」「時間帯」「カテゴリ制約」などの精緻化は将来フェーズで検討する。
- 提携商品提示は当面カテゴリ提示を維持し、表示は透明性を担保する。
