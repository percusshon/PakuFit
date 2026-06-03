'use client';

import { useEffect, useRef, useState } from 'react';

// ブラウザ標準 BarcodeDetector のみで JAN(EAN-13/8) などを読み取る。
// 外部ライブラリや商品DB連携は使わない（未対応端末では機能を出さず案内のみ）。

type DetectedBarcode = { rawValue: string; format: string };

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
}

const JAN_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

const getCtor = (): BarcodeDetectorCtor | null => {
  if (typeof window === 'undefined') return null;
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return ctor ?? null;
};

// 既存フォーム入力（id付き・uncontrolled）へ値を流し込む。
const fillTitleIfEmpty = (value: string) => {
  const el = document.getElementById('title') as HTMLInputElement | null;
  if (el && !el.value) el.value = value;
};

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [jan, setJan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 撮影ストリーム・検出ループを止める。
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    setSupported(Boolean(getCtor()) && Boolean(navigator.mediaDevices?.getUserMedia));
    return () => stop();
  }, []);

  const start = async () => {
    const ctor = getCtor();
    if (!ctor) return;
    setError(null);
    setJan(null);
    setCopied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      detectorRef.current = new ctor({ formats: JAN_FORMATS });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setScanning(true);

      // 一定間隔でフレームを解析し、最初に読み取れたコードで停止する。
      timerRef.current = setInterval(async () => {
        const video = videoRef.current;
        const detector = detectorRef.current;
        if (!video || !detector || video.readyState < 2) return;
        try {
          const codes = await detector.detect(video);
          const hit = codes.find((c) => c.rawValue?.trim());
          if (hit) {
            setJan(hit.rawValue.trim());
            setScanning(false);
            stop();
          }
        } catch {
          // 単発の検出失敗は無視してループを続ける。
        }
      }, 400);
    } catch {
      setError('カメラを起動できませんでした。権限を確認してください。');
      setScanning(false);
      stop();
    }
  };

  if (supported === false) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
        この端末/ブラウザはバーコード読取（標準API）に未対応です。手入力をご利用ください。
      </p>
    );
  }

  if (supported === null) return null;

  return (
    <div className="space-y-3 rounded-md border border-dashed border-sky-300 bg-sky-50 p-4">
      <div>
        <p className="text-sm font-semibold text-sky-900">バーコードでJANを読み取る（任意）</p>
        <p className="mt-1 text-xs text-sky-800">
          商品のバーコードを読み取り、JANコードを取得できます。商品データベースとの照合は今後対応予定です。
        </p>
      </div>

      <video
        ref={videoRef}
        playsInline
        muted
        className={scanning ? 'w-full max-w-xs rounded-md border border-sky-200 bg-black' : 'hidden'}
      />

      <div className="flex flex-wrap gap-2">
        {!scanning ? (
          <button
            type="button"
            onClick={start}
            className="rounded-full border border-sky-600 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100"
          >
            {jan ? 'もう一度読み取る' : 'バーコードを読み取る'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setScanning(false);
              stop();
            }}
            className="rounded-full border border-sky-600 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100"
          >
            停止
          </button>
        )}
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      {jan && (
        <div className="space-y-2 rounded-md border border-sky-200 bg-white p-3 text-sm text-sky-900">
          <p>
            読み取ったJAN: <span className="font-mono font-semibold">{jan}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              fillTitleIfEmpty(`商品 (JAN: ${jan})`);
              setCopied(true);
            }}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            食事名に入れる
          </button>
          {copied && (
            <p className="text-xs text-emerald-700">食事名に反映しました。内容を確認・補正して保存してください。</p>
          )}
        </div>
      )}
    </div>
  );
}
