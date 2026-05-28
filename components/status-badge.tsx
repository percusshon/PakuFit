 type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "good" | "warn";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const className =
    tone === "good"
      ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
      : tone === "warn"
        ? "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
        : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700";

  return <span className={className}>{label}</span>;
}
