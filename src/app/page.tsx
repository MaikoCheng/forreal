import Link from "next/link";
import MotionBrowser from "./MotionBrowser";

export default async function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between border-b border-[var(--md-outline-variant)] pb-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="ForReal home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--md-primary)] text-lg font-black text-white">
            F
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--md-on-surface)]">
            ForReal
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--md-on-surface-variant)] md:flex">
          <a className="text-[var(--md-primary)]" href="#overzicht">
            Overzicht
          </a>
          <a
            className="transition hover:text-[var(--md-primary)]"
            href="#partijen"
          >
            Partijen
          </a>
          <a
            className="transition hover:text-[var(--md-primary)]"
            href="#moties"
          >
            Moties
          </a>

          <a
            className="transition hover:text-[var(--md-primary)]"
            href="https://opendata.tweedekamer.nl/documentatie/odata-api"
            target="_blank"
            rel="noreferrer"
          >
            Databron
          </a>
        </nav>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--md-on-surface-variant)]">
          <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
          Live bijgewerkt
        </div>
      </header>

      <section
        id="overzicht"
        className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1fr_1.15fr] lg:items-end"
      >
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[var(--md-primary)]">
            Tweede Kamer · live data
          </p>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.03] tracking-[-0.04em] text-[var(--md-on-surface)] sm:text-6xl">
            Zie hoe Nederlandse partijen jou ForReal representen.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--md-on-surface-variant)]">
            Volg moties, stemmingen en partijstandpunten in één helder
            overzicht. Gebouwd op de open data van de Tweede Kamer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#moties" className="md3-button md3-button-filled">
              Bekijk laatste stemmingen
            </a>
            <a
              href="https://opendata.tweedekamer.nl/documentatie/odata-api"
              target="_blank"
              rel="noreferrer"
              className="md3-button md3-button-outlined"
            >
              Over de databron ↗
            </a>
          </div>
        </div>
        <div className="md3-tonal-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -right-10 -top-20 size-64 rounded-full border-[32px] border-[var(--md-primary)]/20" />
          <p className="relative text-sm font-medium opacity-80">
            Laatste plenaire stemming
          </p>
          <h2 className="relative mt-4 max-w-md text-3xl font-bold leading-tight">
            De laatste moties uit de Tweede Kamer
          </h2>
          <div className="relative mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-bold">78%</p>
              <p className="mt-1 text-sm opacity-80">
                van de uitgebrachte stemmen voor
              </p>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold text-[var(--md-on-primary-container)]">
              Aangenomen
            </span>
          </div>
        </div>
      </section>

      {/* <section className="grid gap-4 border-y border-[var(--md-outline-variant)] py-7 sm:grid-cols-3">
        {[
          ["124", "moties dit vergaderjaar"],
          ["18", "stemmingen deze week"],
          ["92%", "data compleet verwerkt"],
        ].map(([value, label]) => (
          <div key={label} className="flex items-baseline gap-3 sm:block">
            <p className="text-3xl font-bold tracking-tight text-[var(--md-on-surface)]">{value}</p>
            <p className="text-sm text-[var(--md-on-surface-variant)]">{label}</p>
          </div>
        ))}
      </section> */}

      <MotionBrowser />

      <footer className="flex flex-col gap-3 border-t border-[var(--md-outline-variant)] py-8 text-sm text-[var(--md-on-surface-variant)] sm:flex-row sm:items-center sm:justify-between">
        <p>ForReal · Onafhankelijk inzicht in parlementaire data</p>
        <p>
          Bron:{" "}
          <a
            className="font-medium text-[var(--md-primary)] underline decoration-[var(--md-outline)] underline-offset-4"
            href="https://opendata.tweedekamer.nl/"
            target="_blank"
            rel="noreferrer"
          >
            Open Data Tweede Kamer
          </a>
        </p>
      </footer>
    </main>
  );
}
