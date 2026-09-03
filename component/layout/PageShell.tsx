import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export default function PageShell({
  eyebrow,
  title,
  description,
  children,
  backHref = "/",
  backLabel = "Back to Home",
}: PageShellProps) {
  return (
    <main className="page-shell">
      <Link href={backHref} className="back-home glass">
        <span>←</span>
        <span>{backLabel}</span>
      </Link>

      <section className="page-header glass">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}

        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </section>

      <section className="page-content">
        {children}
      </section>
    </main>
  );
}