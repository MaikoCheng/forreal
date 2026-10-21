import Link from "next/link";
import MemberBrowser from "./MemberBrowser";
import MotionBrowser from "./MotionBrowser";

export default async function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] overflow-x-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[var(--md-outline-variant)] pb-4 sm:pb-5">
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
        <nav className="order-3 -mx-1 flex w-[calc(100%+0.5rem)] snap-x gap-5 overflow-x-auto px-1 pb-1 text-sm font-medium text-[var(--md-on-surface-variant)] md:order-none md:w-auto md:gap-8 md:overflow-visible md:px-0 md:pb-0">
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
            href="#spectrums"
          >
            Spectrums
          </a>
          <a
            className="transition hover:text-[var(--md-primary)]"
            href="#moties"
          >
            Moties
          </a>
          <a
            className="transition hover:text-[var(--md-primary)]"
            href="#leden"
          >
            Kamerleden
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
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--md-on-surface-variant)]">
          <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
          Live bijgewerkt
        </div>
      </header>

      <section
        id="overzicht"
        className="grid gap-8 pb-10 pt-10 sm:gap-10 sm:pb-14 sm:pt-14 lg:grid-cols-[1fr_1.15fr] lg:items-end"
      >
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[var(--md-primary)]">
            Tweede Kamer · live data
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[var(--md-on-surface)] sm:text-6xl">
            Zie hoe Nederlandse partijen jou ForReal representen.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--md-on-surface-variant)]">
            Volg moties, stemmingen en partijstandpunten in één helder
            overzicht. Gebouwd op de open data van de Tweede Kamer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#moties" className="md3-button md3-button-filled text-center">
              Bekijk laatste stemmingen
            </a>
            <a
              href="https://opendata.tweedekamer.nl/documentatie/odata-api"
              target="_blank"
              rel="noreferrer"
              className="md3-button md3-button-outlined text-center"
            >
              Over de databron ↗
            </a>
          </div>
        </div>
        <div className="md3-tonal-card relative overflow-hidden p-6 sm:p-10">
          <div className="absolute -right-10 -top-20 size-64 rounded-full border-[32px] border-[var(--md-primary)]/20" />
          <p className="relative text-sm font-medium opacity-80">
            Lees je in, stem en volg de partijen die jou ForReal representen.
          </p>
          <h2 className="relative mt-4 max-w-md text-3xl font-bold leading-tight">
            Partijen beloven veel. Hier zie je hoe ze echt stemmen.
          </h2>
          <div className="relative mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold sm:text-5xl">17</p>
              <p className="mt-1 text-sm opacity-80">
                partijen in de Tweede Kamer.
              </p>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-bold text-[var(--md-on-primary-container)]">
              Op wie stem jij?
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
      <MemberBrowser />

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
