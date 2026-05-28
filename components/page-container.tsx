import { ReactNode } from "react";

type PageContainerProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
