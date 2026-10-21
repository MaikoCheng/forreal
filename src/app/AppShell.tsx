import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  ["/moties", "Moties"],
  ["/partijen", "Partijen"],
  ["/kamerleden", "Kamerleden"],
  ["/toezeggingen", "Toezeggingen"],
] as const;

export default function AppShell({
  children,
  activePath = "/",
}: {
  children: ReactNode;
  activePath?: string;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] overflow-x-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[var(--md-outline-variant)] pb-4 sm:pb-5">
        <Link href="/" className="flex items-center gap-3" aria-label="ForReal home">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--md-primary)] text-lg font-black text-white">F</span>
          <span className="text-lg font-bold tracking-tight text-[var(--md-on-surface)]">ForReal</span>
        </Link>
        <nav className="order-3 -mx-1 flex w-[calc(100%+0.5rem)] snap-x gap-5 overflow-x-auto px-1 pb-1 text-sm font-medium text-[var(--md-on-surface-variant)] md:order-none md:w-auto md:gap-6 md:overflow-visible md:px-0 md:pb-0" aria-label="Hoofdnavigatie">
          <Link className={activePath === "/" ? "text-[var(--md-primary)]" : "transition hover:text-[var(--md-primary)]"} href="/">Overzicht</Link>
          {navigation.map(([href, label]) => (
            <Link key={href} className={activePath === href ? "text-[var(--md-primary)]" : "transition hover:text-[var(--md-primary)]"} href={href}>{label}</Link>
          ))}
          <a className="transition hover:text-[var(--md-primary)]" href="https://opendata.tweedekamer.nl/documentatie/odata-api" target="_blank" rel="noreferrer">Databron</a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--md-on-surface-variant)]">
          <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
          Live bijgewerkt
        </div>
      </header>
      {children}
      <footer className="flex flex-col gap-3 border-t border-[var(--md-outline-variant)] py-8 text-sm text-[var(--md-on-surface-variant)] sm:flex-row sm:items-center sm:justify-between">
        <p>ForReal · Onafhankelijk inzicht in parlementaire data</p>
        <p>Bron: <a className="font-medium text-[var(--md-primary)] underline decoration-[var(--md-outline)] underline-offset-4" href="https://opendata.tweedekamer.nl/" target="_blank" rel="noreferrer">Open Data Tweede Kamer</a></p>
      </footer>
    </main>
  );
}
