'use server';

import { redirect } from 'next/navigation';

import { createServerClientSafe } from '@/lib/supabase/server';
import { requireAuthUser } from '@/lib/supabase/server';
import { type CreateMealEntryInput, type MealType } from '@/lib/types/meal';

const VALID_MEAL_TYPES: ReadonlyArray<MealType> = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'other',
];

const MAX_CALORIES = 5000;
const MAX_PROTEIN_G = 500;
const MAX_FAT_G = 500;
const MAX_CARBS_G = 500;
const MAX_FIBER_G = 100;
const MAX_SALT_G = 50;

const isMealType = (value: unknown): value is MealType =>
  typeof value === 'string' && (VALID_MEAL_TYPES as readonly string[]).includes(value);

const toOptionalTrimmedString = (value: FormDataEntryValue | null) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length > 0 ? text : null;
};

const toPositiveIntOrNull = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim();
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_CALORIES) {
    return 'out_of_range';
  }

  return parsed;
};

const toOptionalDecimalOrNull = (value: FormDataEntryValue | null, max: number) => {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
    return 'out_of_range';
  }

  return parsed;
};

const parseInput = (formData: FormData): CreateMealEntryInput | string => {
  const mealTypeValue = formData.get('meal_type');
  if (!isMealType(mealTypeValue)) {
    return 'invalid_meal_type';
  }

  const titleValue = toOptionalTrimmedString(formData.get('title'));
  if (!titleValue) {
    return 'empty_title';
  }

  const rawEatenAt = toOptionalTrimmedString(formData.get('eaten_at'));
  const eatenAtDate = rawEatenAt ? new Date(rawEatenAt) : new Date();
  if (Number.isNaN(eatenAtDate.getTime())) {
    return 'invalid_eaten_at';
  }

  const estimatedCalories = toPositiveIntOrNull(formData.get('estimated_calories'));
  if (estimatedCalories === 'out_of_range') {
    return 'invalid_calories';
  }

  const estimatedProtein = toOptionalDecimalOrNull(formData.get('estimated_protein_g'), MAX_PROTEIN_G);
  if (estimatedProtein === 'out_of_range') {
    return 'invalid_protein';
  }

  const estimatedFat = toOptionalDecimalOrNull(formData.get('estimated_fat_g'), MAX_FAT_G);
  if (estimatedFat === 'out_of_range') {
    return 'invalid_fat';
  }

  const estimatedCarbs = toOptionalDecimalOrNull(formData.get('estimated_carbs_g'), MAX_CARBS_G);
  if (estimatedCarbs === 'out_of_range') {
    return 'invalid_carbs';
  }

  const estimatedFiber = toOptionalDecimalOrNull(formData.get('estimated_fiber_g'), MAX_FIBER_G);
  if (estimatedFiber === 'out_of_range') {
    return 'invalid_fiber';
  }

  const estimatedSalt = toOptionalDecimalOrNull(formData.get('estimated_salt_g'), MAX_SALT_G);
  if (estimatedSalt === 'out_of_range') {
    return 'invalid_salt';
  }

  return {
    meal_type: mealTypeValue,
    eaten_at: eatenAtDate.toISOString(),
    title: titleValue,
    description: toOptionalTrimmedString(formData.get('description')),
    estimated_calories: estimatedCalories,
    estimated_protein_g: estimatedProtein,
    estimated_fat_g: estimatedFat,
    estimated_carbs_g: estimatedCarbs,
    estimated_fiber_g: estimatedFiber,
    estimated_salt_g: estimatedSalt,
    portion_note: toOptionalTrimmedString(formData.get('portion_note')),
    preparation_note: toOptionalTrimmedString(formData.get('preparation_note')),
  };
};

export async function createMealEntry(formData: FormData) {
  const user = await requireAuthUser('/login');
  const parsed = parseInput(formData);

  if (typeof parsed === 'string') {
    redirect(`/meals/new?error=${parsed}`);
  }

  const supabase = createServerClientSafe();

  const { data: mealEntryData, error: mealEntryError } = await supabase
    .from('meal_entries')
    .insert({
      user_id: user.id,
      meal_type: parsed.meal_type,
      eaten_at: parsed.eaten_at,
      title: parsed.title,
      description: parsed.description,
      estimated_calories: parsed.estimated_calories,
      portion_note: parsed.portion_note,
      preparation_note: parsed.preparation_note,
      meal_label: parsed.title,
      food_description: parsed.description,
      intake_channel: 'manual',
      estimated_total_calories: parsed.estimated_calories,
    })
    .select('id')
    .single();

  if (mealEntryError || !mealEntryData?.id) {
    redirect('/meals/new?error=save_failed');
  }

  const hasNutritionValues = [
    parsed.estimated_protein_g,
    parsed.estimated_fat_g,
    parsed.estimated_carbs_g,
    parsed.estimated_fiber_g,
    parsed.estimated_salt_g,
  ].some((value) => value !== null);

  if (hasNutritionValues) {
    const { error: nutritionError } = await supabase.from('nutrition_estimates').insert({
      user_id: user.id,
      meal_entry_id: mealEntryData.id,
      estimated_calories: parsed.estimated_calories,
      estimated_protein_g: parsed.estimated_protein_g,
      estimated_fat_g: parsed.estimated_fat_g,
      estimated_carbs_g: parsed.estimated_carbs_g,
      estimated_fiber_g: parsed.estimated_fiber_g,
      estimated_salt_g: parsed.estimated_salt_g,
      estimate_method: 'manual',
      is_user_confirmed: true,
    });

    if (nutritionError) {
      redirect('/meals/new?error=save_failed');
    }
  }

  redirect('/meals');
}
