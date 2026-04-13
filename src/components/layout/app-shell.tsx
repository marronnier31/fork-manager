import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="app-shell__eyebrow">Fork Manager</p>
          <h1 className="app-shell__title">{title}</h1>
          {subtitle ? <p className="app-shell__subtitle">{subtitle}</p> : null}
        </div>
        <nav className="app-shell__nav" aria-label="Primary">
          <a href="/dashboard">Dashboard</a>
          <a href="/repos">Repos</a>
          <a href="/cleanup">Cleanup</a>
        </nav>
      </header>
      <main className="app-shell__content">{children}</main>
    </div>
  );
}
