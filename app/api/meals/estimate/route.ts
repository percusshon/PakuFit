import { type NextRequest, NextResponse } from 'next/server';

import { getServerUser } from '@/lib/supabase/server';
import { estimateMealNutritionFromPhoto } from '@/lib/ai/estimate-meal-nutrition';

// 6MB まで。写真1枚の概算用途として十分な上限。
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
  }

  const photo = formData.get('photo');
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: 'no_photo' }, { status: 400 });
  }

  if (!photo.type.startsWith('image/')) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 415 });
  }

  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const hintValue = formData.get('hint');
  const hint = typeof hintValue === 'string' ? hintValue : null;

  // 外部AIサービスへの送信は明示同意（opt-in）があるときだけ許可する。
  const allowExternal = formData.get('external_ai_consent') === 'true';

  try {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const result = await estimateMealNutritionFromPhoto(
      {
        bytes,
        mediaType: photo.type || 'image/jpeg',
        filename: photo.name || null,
        hint,
      },
      { allowExternal },
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'estimate_failed' }, { status: 500 });
  }
}
