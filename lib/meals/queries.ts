import { requireAuthUser } from '@/lib/supabase/server';
import { createServerClientSafe } from '@/lib/supabase/server';
import { type MealEntry, type MealType } from '@/lib/types/meal';
import { type NutritionSummary } from '@/lib/types/nutrition';

type MealEntryRow = {
  id: string;
  eaten_at: string;
  meal_type: string | null;
  title: string | null;
  description: string | null;
  estimated_calories: number | string | null;
  portion_note: string | null;
  preparation_note: string | null;
  meal_label: string | null;
  food_description: string | null;
  estimated_total_calories: number | string | null;
  created_at: string;
  updated_at: string;
};

type NutritionEstimateRow = {
  id: string;
  meal_entry_id: string;
  estimated_protein_g: number | string | null;
  estimated_fat_g: number | string | null;
  estimated_carbs_g: number | string | null;
  estimated_fiber_g: number | string | null;
  estimated_salt_g: number | string | null;
};

const toMealType = (value: string | null): MealType => {
  if (value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack' || value === 'other') {
    return value;
  }

  return 'other';
};

const toEstimatedCalories = (row: Pick<MealEntryRow, 'estimated_calories' | 'estimated_total_calories'>) => {
  const candidate = row.estimated_calories ?? row.estimated_total_calories;
  return normalizeNonNegativeInt(candidate);
};

const normalizeToNumberOrNull = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const normalizeNonNegativeInt = (value: number | string | null | undefined) => {
  const parsed = normalizeToNumberOrNull(value);
  if (parsed === null) return null;
  return Math.floor(parsed);
};

const toNutritionSummary = (
  row: Pick<
    NutritionEstimateRow,
    'meal_entry_id' | 'estimated_protein_g' | 'estimated_fat_g' | 'estimated_carbs_g' | 'estimated_fiber_g' | 'estimated_salt_g'
  >,
) => ({
  meal_entry_id: row.meal_entry_id,
  estimated_protein_g: normalizeToNumberOrNull(row.estimated_protein_g),
  estimated_fat_g: normalizeToNumberOrNull(row.estimated_fat_g),
  estimated_carbs_g: normalizeToNumberOrNull(row.estimated_carbs_g),
  estimated_fiber_g: normalizeToNumberOrNull(row.estimated_fiber_g),
  estimated_salt_g: normalizeToNumberOrNull(row.estimated_salt_g),
});

export async function getRecentMealEntries(): Promise<MealEntry[]> {
  const user = await requireAuthUser('/login');
  const supabase = createServerClientSafe();

  const { data: mealEntries, error: mealEntriesError } = await supabase
    .from('meal_entries')
    .select(
      'id, meal_type, title, description, eaten_at, estimated_calories, portion_note, preparation_note, meal_label, food_description, estimated_total_calories, created_at, updated_at',
    )
    .eq('user_id', user.id)
    .order('eaten_at', { ascending: false })
    .limit(50);

  if (mealEntriesError || !mealEntries) {
    return [];
  }

  const typedMealEntries = mealEntries as MealEntryRow[];

  const mealIds = typedMealEntries.map((meal) => meal.id);
  if (mealIds.length === 0) {
    return [];
  }

  const { data: nutritionRows, error: nutritionError } = await supabase
    .from('nutrition_estimates')
    .select('id, meal_entry_id, estimated_protein_g, estimated_fat_g, estimated_carbs_g, estimated_fiber_g, estimated_salt_g')
    .eq('user_id', user.id)
    .in('meal_entry_id', mealIds);

  const nutritionMap = new Map<string, ReturnType<typeof toNutritionSummary>>();
  if (!nutritionError && nutritionRows) {
    nutritionRows.forEach((row) => {
      const typedRow = row as NutritionEstimateRow;
      nutritionMap.set(typedRow.meal_entry_id, toNutritionSummary(typedRow));
    });
  }

  return typedMealEntries.map((row) => {
    const title = row.title ?? row.meal_label ?? '未入力';
    const description = row.description ?? row.food_description ?? null;
    const nutrition = nutritionMap.get(row.id);

    return {
      id: row.id,
      user_id: user.id,
      meal_type: toMealType(row.meal_type),
      eaten_at: row.eaten_at,
      title,
      description,
      estimated_calories: toEstimatedCalories(row),
      estimated_protein_g: nutrition?.estimated_protein_g ?? null,
      estimated_fat_g: nutrition?.estimated_fat_g ?? null,
      estimated_carbs_g: nutrition?.estimated_carbs_g ?? null,
      estimated_fiber_g: nutrition?.estimated_fiber_g ?? null,
      estimated_salt_g: nutrition?.estimated_salt_g ?? null,
      portion_note: row.portion_note ?? null,
      preparation_note: row.preparation_note ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}

type GetTodayMealSummaryResult = NutritionSummary;

export async function getTodayMealSummary(): Promise<GetTodayMealSummaryResult> {
  const user = await requireAuthUser('/login');
  const supabase = createServerClientSafe();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: mealRows, error: mealError } = await supabase
    .from('meal_entries')
    .select('id, estimated_calories, estimated_total_calories')
    .eq('user_id', user.id)
    .gte('eaten_at', start.toISOString())
    .lt('eaten_at', end.toISOString());

  if (mealError || !mealRows) {
    return {
      date: start.toISOString().slice(0, 10),
      meal_count: 0,
      estimated_calories_total: 0,
      estimated_protein_g_total: 0,
      estimated_fat_g_total: 0,
      estimated_carbs_g_total: 0,
      estimated_fiber_g_total: 0,
      estimated_salt_g_total: 0,
    };
  }

  const typedMealRows = mealRows as Pick<MealEntryRow, 'id' | 'estimated_calories' | 'estimated_total_calories'>[];
  const mealIds = typedMealRows.map((row) => row.id);

  const estimatedCaloriesTotal = typedMealRows.reduce((sum, row) => {
    const calories = toEstimatedCalories(row);
    return sum + (calories ?? 0);
  }, 0);

  if (mealIds.length === 0) {
    return {
      date: start.toISOString().slice(0, 10),
      meal_count: 0,
      estimated_calories_total: estimatedCaloriesTotal,
      estimated_protein_g_total: 0,
      estimated_fat_g_total: 0,
      estimated_carbs_g_total: 0,
      estimated_fiber_g_total: 0,
      estimated_salt_g_total: 0,
    };
  }

  const { data: nutritionRows, error: nutritionError } = await supabase
    .from('nutrition_estimates')
    .select('meal_entry_id, estimated_protein_g, estimated_fat_g, estimated_carbs_g, estimated_fiber_g, estimated_salt_g')
    .eq('user_id', user.id)
    .in('meal_entry_id', mealIds);

  let estimatedProteinTotal = 0;
  let estimatedFatTotal = 0;
  let estimatedCarbsTotal = 0;
  let estimatedFiberTotal = 0;
  let estimatedSaltTotal = 0;

  if (!nutritionError && nutritionRows) {
    nutritionRows.forEach((row) => {
      const typedRow = row as Pick<
        NutritionEstimateRow,
        'meal_entry_id' | 'estimated_protein_g' | 'estimated_fat_g' | 'estimated_carbs_g' | 'estimated_fiber_g' | 'estimated_salt_g'
      >;

      const nutrition = toNutritionSummary(typedRow);
      estimatedProteinTotal += nutrition.estimated_protein_g ?? 0;
      estimatedFatTotal += nutrition.estimated_fat_g ?? 0;
      estimatedCarbsTotal += nutrition.estimated_carbs_g ?? 0;
      estimatedFiberTotal += nutrition.estimated_fiber_g ?? 0;
      estimatedSaltTotal += nutrition.estimated_salt_g ?? 0;
    });
  }

  return {
    date: start.toISOString().slice(0, 10),
    meal_count: typedMealRows.length,
    estimated_calories_total: estimatedCaloriesTotal,
    estimated_protein_g_total: estimatedProteinTotal,
    estimated_fat_g_total: estimatedFatTotal,
    estimated_carbs_g_total: estimatedCarbsTotal,
    estimated_fiber_g_total: estimatedFiberTotal,
    estimated_salt_g_total: estimatedSaltTotal,
  };
}
