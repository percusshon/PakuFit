import { requireAuthUser } from '@/lib/supabase/server'
import { createServerClientSafe } from '@/lib/supabase/server'
import { type MealEntry, type MealType } from '@/lib/types/meal'

type MealEntryRow = {
  id: string
  eaten_at: string
  meal_type: string | null
  title: string | null
  description: string | null
  estimated_calories: number | null
  portion_note: string | null
  preparation_note: string | null
  meal_label: string | null
  food_description: string | null
  estimated_total_calories: number | null
  created_at: string
  updated_at: string
}

const toMealType = (value: string | null): MealType => {
  if (value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack' || value === 'other') {
    return value
  }
  return 'other'
}

const toEstimatedCalories = (row: Pick<MealEntryRow, 'estimated_calories' | 'estimated_total_calories'>) => {
  const candidate = row.estimated_calories ?? row.estimated_total_calories
  if (candidate === null || candidate === undefined) return null
  if (!Number.isInteger(candidate)) return null
  if (candidate < 0) return null
  return candidate
}

export async function getRecentMealEntries(): Promise<MealEntry[]> {
  const user = await requireAuthUser('/login')
  const supabase = createServerClientSafe()

  const { data, error } = await supabase
    .from('meal_entries')
    .select(
      'id, meal_type, title, description, eaten_at, estimated_calories, portion_note, preparation_note, meal_label, food_description, estimated_total_calories, created_at, updated_at',
    )
    .eq('user_id', user.id)
    .order('eaten_at', { ascending: false })
    .limit(50)

  if (error || !data) {
    return []
  }

  return data.map((row) => {
    const parsed = row as MealEntryRow
    const title = parsed.title ?? parsed.meal_label ?? '未入力'
    const description = parsed.description ?? parsed.food_description ?? null

    return {
      id: parsed.id,
      user_id: user.id,
      meal_type: toMealType(parsed.meal_type),
      eaten_at: parsed.eaten_at,
      title,
      description,
      estimated_calories: toEstimatedCalories(parsed),
      portion_note: parsed.portion_note ?? null,
      preparation_note: parsed.preparation_note ?? null,
      created_at: parsed.created_at,
      updated_at: parsed.updated_at,
    }
  })
}

type GetTodayMealSummaryResult = {
  date: string
  meal_count: number
  estimated_calories_total: number
}

export async function getTodayMealSummary(): Promise<GetTodayMealSummaryResult> {
  const user = await requireAuthUser('/login')
  const supabase = createServerClientSafe()

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const { data, error } = await supabase
    .from('meal_entries')
    .select('estimated_calories, estimated_total_calories, meal_label')
    .eq('user_id', user.id)
    .gte('eaten_at', start.toISOString())
    .lt('eaten_at', end.toISOString())

  if (error || !data) {
    return {
      date: start.toISOString().slice(0, 10),
      meal_count: 0,
      estimated_calories_total: 0,
    }
  }

  const estimatedCaloriesTotal = data.reduce((sum, row) => {
    const cal = row.estimated_calories ?? row.estimated_total_calories
    const normalized = typeof cal === 'number' && Number.isFinite(cal) ? Math.max(0, Math.floor(cal)) : null
    return sum + (normalized ?? 0)
  }, 0)

  return {
    date: start.toISOString().slice(0, 10),
    meal_count: data.length,
    estimated_calories_total: estimatedCaloriesTotal,
  }
}
