import Link from "next/link";
import AppShell from "./AppShell";

export default async function Home() {
  return (
    <AppShell>
      <section className="grid gap-8 pb-10 pt-10 sm:gap-10 sm:pb-14 sm:pt-14 lg:grid-cols-[1fr_1.15fr] lg:items-end">
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
            <Link href="/moties" className="md3-button md3-button-filled text-center">
              Bekijk laatste stemmingen
            </Link>
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
      <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/moties", "Moties", "Zoek moties, uitkomsten en stemmingen."],
          ["/partijen", "Partijen", "Bekijk partijgedrag, het politieke spectrum en de gelijkenismatrix."],
          ["/kamerleden", "Kamerleden", "Bekijk moties, stemmen en profielen."],
          ["/toezeggingen", "Toezeggingen", "Volg beloften van bewindspersonen."],
        ].map(([href, title, description]) => (
          <Link key={href} href={href} className="md3-card block p-5 transition hover:-translate-y-0.5 hover:border-[var(--md-primary)] hover:shadow-md">
            <h2 className="text-lg font-bold text-[var(--md-on-surface)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--md-on-surface-variant)]">{description}</p>
            <span className="mt-4 inline-block text-sm font-bold text-[var(--md-primary)]">Openen →</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
