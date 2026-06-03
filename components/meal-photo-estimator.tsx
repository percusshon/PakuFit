'use client';

import { useEffect, useRef, useState } from 'react';

import type { MealPhotoEstimateResult } from '@/lib/ai/vision-types';

// 外部AIサービスへの写真送信に対するオプトイン同意の保存キー（端末ローカル）。
const CONSENT_KEY = 'pakufit:external-ai-consent';

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
  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealPhotoEstimateResult | null>(null);
  const [applied, setApplied] = useState(false);
  const [consent, setConsent] = useState(false);

  // 同意状態は端末ローカルに記憶し、次回以降も引き継ぐ。
  useEffect(() => {
    try {
      setConsent(window.localStorage.getItem(CONSENT_KEY) === 'true');
    } catch {
      // localStorage 不可な環境では同意なし扱い（外部送信しない）。
    }
  }, []);

  const handleConsentChange = (next: boolean) => {
    setConsent(next);
    try {
      window.localStorage.setItem(CONSENT_KEY, next ? 'true' : 'false');
    } catch {
      // 保存失敗は致命的ではない。
    }
  };

  // 撮影/選択いずれの入力からも、選択された写真を一元管理する。
  const handlePick = (input: HTMLInputElement | null) => {
    const file = input?.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setApplied(false);
  };

  const handleEstimate = async () => {
    setError(null);
    setApplied(false);
    const file = selectedFile;
    if (!file) {
      setError(ERROR_MESSAGES.no_photo);
      return;
    }

    const titleEl = document.getElementById('title') as HTMLInputElement | null;
    const formData = new FormData();
    formData.append('photo', file);
    if (titleEl?.value) formData.append('hint', titleEl.value);
    // 同意があるときだけ外部送信を許可する（サーバ側でも強制）。
    formData.append('external_ai_consent', consent ? 'true' : 'false');

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

    // 精度ログ観測用に、反映時点のAI元概算を hidden フィールドへ保持する。
    setInputValue('ai_provider', result.provider);
    setInputValue('ai_confidence', result.confidence);
    setInputValue('ai_guessed_label', result.guessedLabel ?? '');
    setInputValue('ai_estimated_calories', nutrition.calories);
    setInputValue('ai_estimated_protein_g', nutrition.protein_g);
    setInputValue('ai_estimated_fat_g', nutrition.fat_g);
    setInputValue('ai_estimated_carbs_g', nutrition.carbs_g);
    setInputValue('ai_estimated_fiber_g', nutrition.fiber_g);
    setInputValue('ai_estimated_salt_g', nutrition.salt_g);

    // 食事名が空ならラベルを補完（あくまで概算の参考）。
    const titleEl = document.getElementById('title') as HTMLInputElement | null;
    if (titleEl && !titleEl.value && result.guessedLabel) {
      titleEl.value = result.guessedLabel;
    }

    setApplied(true);
  };

  return (
    <div className="space-y-3 rounded-md border border-dashed border-amber-300 bg-amber-50 p-4">
      {/* 精度ログ観測用の hidden フィールド（反映時点のAI元概算を保持してサーバへ送る）。 */}
      <input type="hidden" id="ai_provider" name="ai_provider" defaultValue="" />
      <input type="hidden" id="ai_confidence" name="ai_confidence" defaultValue="" />
      <input type="hidden" id="ai_guessed_label" name="ai_guessed_label" defaultValue="" />
      <input type="hidden" id="ai_estimated_calories" name="ai_estimated_calories" defaultValue="" />
      <input type="hidden" id="ai_estimated_protein_g" name="ai_estimated_protein_g" defaultValue="" />
      <input type="hidden" id="ai_estimated_fat_g" name="ai_estimated_fat_g" defaultValue="" />
      <input type="hidden" id="ai_estimated_carbs_g" name="ai_estimated_carbs_g" defaultValue="" />
      <input type="hidden" id="ai_estimated_fiber_g" name="ai_estimated_fiber_g" defaultValue="" />
      <input type="hidden" id="ai_estimated_salt_g" name="ai_estimated_salt_g" defaultValue="" />

      <div>
        <p className="text-sm font-semibold text-amber-900">写真からAI概算（任意）</p>
        <p className="mt-1 text-xs text-amber-800">
          料理写真を選ぶと、カロリー/PFCの概算を自動入力できます。値は概算なので保存前に確認・補正してください。
        </p>
      </div>

      {/* 外部AIサービスへの送信はオプトイン。未同意ならローカル簡易推定（モック）になる。 */}
      <label className="flex items-start gap-2 rounded-md border border-amber-200 bg-white p-2 text-xs text-amber-900">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => handleConsentChange(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          外部AIサービスへの送信に同意する。
          <span className="block text-amber-700">
            同意すると、概算のときだけ料理写真が外部AIサービスに送信されます。画像はアプリには保存されません。送信先での取り扱いは各サービスの規約に従います。未同意の場合はローカルの簡易推定（モック）になります。
          </span>
        </span>
      </label>

      {/* カメラ撮影とライブラリ選択の2導線。モバイルでは撮影でリアカメラを直接起動する。 */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={() => handlePick(cameraRef.current)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={() => handlePick(galleryRef.current)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="rounded-full border border-amber-600 px-4 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
        >
          カメラで撮影
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="rounded-full border border-amber-600 px-4 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
        >
          ライブラリから選択
        </button>
      </div>

      {selectedFile && (
        <p className="truncate text-xs text-amber-800">選択中: {selectedFile.name}</p>
      )}

      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading || !selectedFile}
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
