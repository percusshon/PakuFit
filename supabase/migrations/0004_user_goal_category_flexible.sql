-- user_goals の goal_category を既存値＋新基準値で許容する。
-- 既存データ互換を維持しつつ、新しい目標型を段階的に採用する。

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'user_goals_goal_category_check'
      AND n.nspname = 'public'
      AND t.relname = 'user_goals'
  ) THEN
    ALTER TABLE public.user_goals DROP CONSTRAINT user_goals_goal_category_check;
  END IF;
END
$$;

ALTER TABLE public.user_goals
  ADD CONSTRAINT user_goals_goal_category_check
  CHECK (
    goal_category IN (
      'weight_management',
      'balance_improvement',
      'protein_focus',
      'fat_moderation',
      'convenience_balance',
      'balanced_meals',
      'higher_protein',
      'lower_fat',
      'convenience_store_friendly'
    )
  );
