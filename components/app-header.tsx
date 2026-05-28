import Link from "next/link";

const navItems = [
  { label: "ホーム", href: "/" },
  { label: "食事記録", href: "/meals" },
  { label: "今日のサマリー", href: "/summary" },
  { label: "候補提案", href: "/recommendations" },
  { label: "設定", href: "/settings/goals" },
  { label: "安全方針", href: "/safety" }
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-pakufit-700">
          パクフィット / PakuFit
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-3 py-1 text-slate-700 transition hover:border-pakufit-200 hover:bg-pakufit-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
