export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
} as const

export type AppEnv = typeof env

const requiredEnvVars: Array<keyof AppEnv> = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
]

export const getEnvValidation = () => {
  const missingEnvVars = requiredEnvVars.filter((key) => !env[key])
  return {
    isValid: missingEnvVars.length === 0,
    missingEnvVars,
  }
}

if (process.env.NODE_ENV !== 'production') {
  const { isValid, missingEnvVars } = getEnvValidation()

  if (!isValid) {
    console.warn(`PakuFit env: missing keys -> ${missingEnvVars.join(', ')}`)
  }
}
