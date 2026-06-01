'use client';

import { useRef, useState } from 'react';

import type { MealPhotoEstimateResult } from '@/lib/ai/vision-types';

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'ログインが必要です。',
  no_photo: '写真を選択してください。',
  invalid_type: '画像ファイルを選択してください。',
  too_large: '画像が大きすぎます（6MBまで）。',
  estimate_failed: '概算に失敗しました。時間をおいて再度お試しください。',
  network: '通信に失敗しました。接続を確認してください。',
};

// id付きのフォーム入力に値を流し込む（uncontrolled inputへ反映）。
const setInputValue = (id: string, value: number | string) => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.value = String(value);
};

export function MealPhotoEstimator() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealPhotoEstimateResult | null>(null);
  const [applied, setApplied] = useState(false);

  const handleEstimate = async () => {
    setError(null);
    setApplied(false);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(ERROR_MESSAGES.no_photo);
      return;
    }

    const titleEl = document.getElementById('title') as HTMLInputElement | null;
    const formData = new FormData();
    formData.append('photo', file);
    if (titleEl?.value) formData.append('hint', titleEl.value);

    setLoading(true);
    try {
      const response = await fetch('/api/meals/estimate', { method: 'POST', body: formData });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        setError(ERROR_MESSAGES[body.error ?? ''] ?? ERROR_MESSAGES.estimate_failed);
        setResult(null);
        return;
      }
      const data = (await response.json()) as MealPhotoEstimateResult;
      setResult(data);
    } catch {
      setError(ERROR_MESSAGES.network);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    const { nutrition } = result;
    setInputValue('estimated_calories', nutrition.calories);
    setInputValue('estimated_protein_g', nutrition.protein_g);
    setInputValue('estimated_fat_g', nutrition.fat_g);
    setInputValue('estimated_carbs_g', nutrition.carbs_g);
    setInputValue('estimated_fiber_g', nutrition.fiber_g);
    setInputValue('estimated_salt_g', nutrition.salt_g);
    setInputValue('estimate_method', 'photo');

    // 食事名が空ならラベルを補完（あくまで概算の参考）。
    const titleEl = document.getElementById('title') as HTMLInputElement | null;
    if (titleEl && !titleEl.value && result.guessedLabel) {
      titleEl.value = result.guessedLabel;
    }

    setApplied(true);
  };

  return (
    <div className="space-y-3 rounded-md border border-dashed border-amber-300 bg-amber-50 p-4">
      <div>
        <p className="text-sm font-semibold text-amber-900">写真からAI概算（任意）</p>
        <p className="mt-1 text-xs text-amber-800">
          料理写真を選ぶと、カロリー/PFCの概算を自動入力できます。値は概算なので保存前に確認・補正してください。
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="block w-full text-sm text-amber-900 file:mr-3 file:rounded-full file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-700"
        onChange={() => {
          setResult(null);
          setError(null);
          setApplied(false);
        }}
      />

      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading}
        className="rounded-full border border-amber-600 px-4 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'AIが概算中…' : 'AIで概算する'}
      </button>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      {result && (
        <div className="space-y-2 rounded-md border border-amber-200 bg-white p-3 text-sm text-amber-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">概算結果</span>
            {result.isMock && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">モック推定</span>
            )}
            <span className="text-xs text-slate-600">信頼度の目安: {Math.round(result.confidence * 100)}%</span>
          </div>
          {result.guessedLabel && (
            <p className="text-xs text-slate-700">推定: {result.guessedLabel}</p>
          )}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
            <li>カロリー: {result.nutrition.calories} kcal</li>
            <li>たんぱく質: {result.nutrition.protein_g} g</li>
            <li>脂質: {result.nutrition.fat_g} g</li>
            <li>炭水化物: {result.nutrition.carbs_g} g</li>
            <li>食物繊維: {result.nutrition.fiber_g} g</li>
            <li>食塩相当量: {result.nutrition.salt_g} g</li>
          </ul>
          <p className="text-xs text-amber-700">{result.notice}</p>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            この概算をフォームに反映
          </button>
          {applied && <p className="text-xs text-emerald-700">フォームに反映しました。内容を確認して保存してください。</p>}
        </div>
      )}
    </div>
  );
}
