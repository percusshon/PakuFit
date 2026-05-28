# RLSポリシー草案（Supabase想定）

## 基本方針

- ユーザーは自分の食事データを本人のみ読める/書ける
- 管理者でも個別画像・個別食事内容には原則アクセスしない
- 外部提携先には個人を特定できる粒度の食事データを渡さない
- 集計時は匿名化・最小化し、再識別が難しい形に変換

## 各テーブル方針

### profiles / user_goals / meal_entries / meal_photos / food_items / nutrition_estimates / daily_nutrition_summaries / meal_recommendations

- SELECT
  - `auth.uid() = user_id`
- INSERT/UPDATE/DELETE
  - `auth.uid() = user_id`
- meal_photosはmeal_entriesを経由した所有者確認を追加
  - `exists (select 1 from meal_entries me where me.id = meal_photos.meal_entry_id and me.user_id = auth.uid())`

### partner_products / partner_stores

- 原則読み取りは管理ロールのみ
- 一般ユーザーは候補表示時の必要データをAPIで匿名化して返す（候補IDと非個人情報のみ）

### audit_logs

- 一般ユーザー不可
- 運用監査ロールのみ
- ログ閲覧も監査者個人が個人情報を復元しない設計

## 管理者ポリシー（暫定）

- `app_admin`はメタ情報監査が主で、
  - 原則、`meal_photos`の画像本体には直接アクセスしない
  - 個人識別子を伴う食事履歴の一括取得を避ける
- 例外時でも、データ匿名化レイヤを経由して参照

## 将来連携時の個人情報分離

- 提携企業向けデータは以下を除外
  - 氏名、メール、詳細履歴
  - 生年月日、体重推移の識別できる履歴
- 代替データ
  - 年代別・時間帯別の匿名統計
  - 併存フラグの匿名分布

## SQL方針（草案）

```sql
-- 例: meal_entries
create policy "meal entries own select" on meal_entries
  for select using (auth.uid() = user_id);

create policy "meal entries own insert" on meal_entries
  for insert with check (auth.uid() = user_id);

-- 例: meal_photos
create policy "meal photos own access via meal" on meal_photos
  for select using (
    exists (
      select 1 from meal_entries me
      where me.id = meal_photos.meal_entry_id and me.user_id = auth.uid()
    )
  );
```

上記は実装前提であり、最終的なRLS名・ロールは認証基盤実装時に確定する。
