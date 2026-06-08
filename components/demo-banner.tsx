import Link from "next/link";

const demoLinks: { href: string; label: string }[] = [
  { href: "/demo", label: "デモ概要" },
  { href: "/demo/meals", label: "食事記録一覧" },
  { href: "/demo/summary", label: "今日のサマリー" },
  { href: "/demo/recommendations", label: "次の食事候補" },
];

// ログイン不要のデモ画面であることを明示するバナー + デモ内ナビ。
export function DemoBanner() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-semibold">これはデモ（サンプル）画面です。</p>
        <p className="mt-1">
          ログイン不要で機能を確認いただけます。表示されている食事・数値はすべて
          <span className="font-medium">固定のサンプルデータ</span>で、実際のユーザーデータではありません。
          カロリー/PFCは概算・目安であり、医療・診断目的の値ではありません。
        </p>
        <p className="mt-1">
          実際に記録・保存して使う場合は{" "}
          <Link href="/login" className="font-semibold underline underline-offset-2">
            ログイン / 新規登録
          </Link>
          へ。
        </p>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm">
        {demoLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-sky-200 bg-white px-3 py-1 font-medium text-sky-800 hover:bg-sky-50"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
