import Link from "next/link";
import { PageContainer } from "../../components/page-container";

export default function LoginPage() {
  return (
    <PageContainer title="ログイン（設計用）" description="認証基盤はPhase1の設計で準備中です。">
      <form className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-700">メールアドレス</span>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              placeholder="user@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">パスワード</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              placeholder="••••••••"
            />
          </label>
        </div>
        <Link
          href="/meals"
          className="mt-4 inline-block rounded-lg bg-pakufit-600 px-4 py-2 text-sm font-semibold text-white"
        >
          続ける
        </Link>
      </form>
    </PageContainer>
  );
}
