-- meal_recommendations の保存履歴MVPに必要な最小カラムを追加

ALTER TABLE public.meal_recommendations
  ADD COLUMN IF NOT EXISTS candidate_key text,
  ADD COLUMN IF NOT EXISTS goal_category text,
  ADD COLUMN IF NOT EXISTS data_completeness numeric(5,2),
  ADD COLUMN IF NOT EXISTS reason_code text,
  ADD COLUMN IF NOT EXISTS reason_label text,
  ADD COLUMN IF NOT EXISTS caution_text text,
  ADD COLUMN IF NOT EXISTS source text not null default 'rule_based',
  ADD COLUMN IF NOT EXISTS snapshot jsonb,
  ADD COLUMN IF NOT EXISTS generated_at timestamptz not null default timezone('utc', now());

-- 既存カラムの用途明確化（既存データがある場合は維持）
UPDATE public.meal_recommendations
SET
  generated_at = created_at,
  candidate_key = COALESCE(candidate_key, 'manual'),
  source = COALESCE(source, 'rule_based')
WHERE generated_at IS NULL OR source IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_recommendations_source_check'
      AND conrelid = 'public.meal_recommendations'::regclass
  ) THEN
    ALTER TABLE public.meal_recommendations
      ADD CONSTRAINT meal_recommendations_source_check
      CHECK (source IN ('rule_based'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_recommendations_data_completeness_check'
      AND conrelid = 'public.meal_recommendations'::regclass
  ) THEN
    ALTER TABLE public.meal_recommendations
      ADD CONSTRAINT meal_recommendations_data_completeness_check
      CHECK (data_completeness IS NULL OR (data_completeness >= 0 AND data_completeness <= 1));
  END IF;
END;
$$;
