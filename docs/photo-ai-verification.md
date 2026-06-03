# 写真AI / バーコード / カメラ 実機・実API検証チェックリスト

このドキュメントは、実装済み機能（写真AI概算・バーコードJAN読取・カメラ撮影）を
実キー・実機で確認するための手順。コード単体の自動検証は済んでいるが、
**実APIの呼び出し精度・モバイル実機動作はローカル/CIでは確認できない**ため、本手順で補う。

## 0. 自動検証済み（このセッションで確認済み）

- `npm run lint` / `npm run typecheck` / `npm run test`(32) / `npm run build` 全 green。
- 写真AIプロバイダ選択・JSON解析・信頼度正規化・クランプ・HTTPエラー時 throw は単体テスト済み
  （`lib/ai/providers/openai-vision.test.ts`, `lib/ai/estimate-meal-nutrition.test.ts`）。
- DB: `supabase db reset` + `supabase test db` で RLS 35/35 PASS（`photo_estimate_logs` 含む）。
- 本番ビルド配信: `/sw.js`(v2)・各PNGアイコン・`/apple-icon.png`・`/manifest.webmanifest` 200。

## 1. OpenAI 実APIキーの設定（**秘密情報。コミットしない**）

`.env.local`（gitignore 済み）に追記する。チャットに貼らず、各自の環境で設定する:

```
PAKUFIT_VISION_PROVIDER=openai
OPENAI_API_KEY=sk-...            # 自分のキー。コミット禁止
# 任意: PAKUFIT_VISION_MODEL=gpt-4o-mini  （既定値）
```

> モバイル実機から確認する場合、`NEXT_PUBLIC_APP_URL` と Supabase の `site_url`/redirect を
> 実機からアクセス可能なURL（LAN IP か HTTPS トンネル）に合わせる必要がある。

## 2. 写真AI概算（実API）

1. `npm run dev`（または `npm run build && npm run start`）で起動しログイン（Magic Link）。
2. `/meals/new` → **「外部AIサービスへの送信に同意する」チェックを ON**（オプトイン。未同意だとモックのまま）。
3. 「カメラで撮影」または「ライブラリから選択」で料理写真を選ぶ。
4. 「AIで概算する」を押す。
5. 期待結果:
   - 同意ON時のみ外部送信され、概算結果に **「モック推定」バッジが出ない**（= 実プロバイダが使われた）。
   - 同意OFFのときは外部送信されず「モック推定」になる（プライバシー方針どおり）。
   - 栄養値・推定ラベル・信頼度が表示される。
   - キー誤り/レート超過時は自動でモックにフォールバックし「AI接続に失敗…」注記が付く（保存は止まらない）。
6. 「この概算をフォームに反映」→ 値を必要に応じて補正 → 保存。
7. 精度ログ確認（開発者向け）: `scripts/estimate-accuracy.sql` を Studio/psql で実行し、
   provider=openai の行に補正率・平均補正量が出ることを確認。

## 3. バーコード/JAN 読取（対応ブラウザ・実機）

- **要件**: `BarcodeDetector` 対応ブラウザ（Android Chrome 等）。iOS Safari/Firefox は未対応 →
  「未対応です」案内が出れば設計どおり。
- 手順: `/meals/new` の「バーコードでJANを読み取る」→「バーコードを読み取る」→ カメラ許可 →
  商品バーコードをかざす → JANコードが表示される →「食事名に入れる」で反映。
- 注意: カメラAPIは **localhost か HTTPS** でのみ動作（LAN IP の http では getUserMedia がブロックされる）。

## 4. カメラ撮影導線（モバイル実機）

- `/meals/new` の写真入力「カメラで撮影」でリアカメラが直接起動するか（`capture="environment"`）。
- 「ライブラリから選択」で既存写真も選べるか。
- いずれも localhost/HTTPS 前提。

## 5. 未確認として残る点

- 実APIの**概算精度・コスト**（実キー必須・本手順で各自確認）。
- モバイル実機での**カメラ/バーコードの実動作**（端末・ブラウザ依存）。
- 写真AIの**外部送信に関する同意/プライバシー文言**は未確定（`docs/photo-ai-privacy-draft.md` 参照）。
