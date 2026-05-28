# PakuFit Supabase local検証手順（Phase 2.5）

## 目的

- `supabase start` / `supabase db reset` / `supabase test db` が通ることを確認する。
- migrationとRLSテストをローカルで再現可能に保つ。

## 事前確認

1. `pwd`
2. `git status --short`
3. `supabase --version`
4. `docker --version`
5. `docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'`

## 起動手順

1. まず `supabase start` を実行。
2. 失敗時は表示エラーを確認。
3. ポート競合がある場合は `supabase/config.toml` でPakuFit専用ポートを調整。

## DB初期化

1. `supabase db reset`
2. 失敗時はmigrationとseedの構文を確認。

## RLSテスト

1. `supabase test db`
2. 失敗時の原因別対応
   - `No plan found in TAP output`
     - `supabase/tests/rls_access_tests.sql` をpgTAP形式にする
     - `plan()` と `finish()` を追加
   - 方針違反や権限エラー
     - テストユーザーIDとseedデータ、JWT注入の前提を見直す

## 既存コンテナへの配慮

- `mindlog-ai`, `hatsumei-gate`, `otomarket` など他プロジェクトのコンテナは触らない。
- Supabase CLI操作はこのリポジトリ配下の設定（`supabase/config.toml`）のみで進める。
- 必要に応じて `supabase stop --no-backup` は実行対象を確認してから行う。

## 注意

- 機密値はコミットしない。
- `.env`, `.env.local`, `.env.*.local` は `.gitignore` で除外。
- service_roleを使わず、`public anon key` を前提にする。
