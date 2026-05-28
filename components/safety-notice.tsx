export function SafetyNotice({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm leading-6 text-slate-700 shadow-sm ${className}`.trim()}
    >
      <p className="font-semibold text-slate-900">健康判断の補助を目的とした表示です。</p>
      <p>
        本アプリの表示は食事記録のサポート用です。AI推定は概算であり、料理名・量・食べた割合などは
        ユーザー確認が必要です。極端な制限を意図した助言や断定的な健康効果表現は行いません。
      </p>
    </div>
  )
}
