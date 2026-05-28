'use server';

import { redirect } from 'next/navigation'

import { requireAuthUser } from '@/lib/supabase/server'
import { createServerClientSafe } from '@/lib/supabase/server'
import { type CreateMealEntryInput, type MealType } from '@/lib/types/meal'

const VALID_MEAL_TYPES: ReadonlyArray<MealType> = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'other',
]

const MAX_CALORIES = 5000

const isMealType = (value: unknown): value is MealType =>
  typeof value === 'string' && (VALID_MEAL_TYPES as readonly string[]).includes(value)

const toOptionalTrimmedString = (value: FormDataEntryValue | null) => {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length > 0 ? text : null
}

const toPositiveIntOrNull = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const normalized = value.trim()
  const parsed = Number(normalized)

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_CALORIES) {
    return 'out_of_range'
  }

  return parsed
}

const parseInput = (formData: FormData): CreateMealEntryInput | string => {
  const mealTypeValue = formData.get('meal_type')
  if (!isMealType(mealTypeValue)) {
    return 'invalid_meal_type'
  }

  const titleValue = toOptionalTrimmedString(formData.get('title'))
  if (!titleValue) {
    return 'empty_title'
  }

  const rawEatenAt = toOptionalTrimmedString(formData.get('eaten_at'))
  const eatenAtDate = rawEatenAt ? new Date(rawEatenAt) : new Date()
  if (Number.isNaN(eatenAtDate.getTime())) {
    return 'invalid_eaten_at'
  }

  const estimatedCalories = toPositiveIntOrNull(formData.get('estimated_calories'))
  if (estimatedCalories === 'out_of_range') {
    return 'invalid_calories'
  }

  return {
    meal_type: mealTypeValue,
    eaten_at: eatenAtDate.toISOString(),
    title: titleValue,
    description: toOptionalTrimmedString(formData.get('description')),
    estimated_calories: estimatedCalories,
    portion_note: toOptionalTrimmedString(formData.get('portion_note')),
    preparation_note: toOptionalTrimmedString(formData.get('preparation_note')),
  }
}

export async function createMealEntry(formData: FormData) {
  const user = await requireAuthUser('/login')
  const parsed = parseInput(formData)

  if (typeof parsed === 'string') {
    redirect(`/meals/new?error=${parsed}`)
  }

  const supabase = createServerClientSafe()

  const { error } = await supabase.from('meal_entries').insert({
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

  if (error) {
    redirect('/meals/new?error=save_failed')
  }

  redirect('/meals')
}
