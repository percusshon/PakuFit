import { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: string;
  children?: ReactNode;
};

export function FeatureCard({ title, description, icon, children }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-3xl">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </article>
  );
}
