import Link from "next/link";
import MotionBrowser from "./MotionBrowser";

export default async function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link href="/" className="flex items-center gap-3" aria-label="PolitiQ home">
          <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-lg font-black text-white">P</span>
          <span className="text-lg font-bold tracking-tight text-slate-950">PolitiQ</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <a className="text-slate-950" href="#overzicht">Overzicht</a>
          <a className="transition hover:text-slate-950" href="#moties">Moties</a>
          <a className="transition hover:text-slate-950" href="#partijen">Partijen</a>
          <a className="transition hover:text-slate-950" href="https://opendata.tweedekamer.nl/documentatie/odata-api" target="_blank" rel="noreferrer">Databron</a>
        </nav>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Live bijgewerkt
        </div>
      </header>

      <section id="overzicht" className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Tweede Kamer · live data</p>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-6xl">
            Zie hoe Nederland stemt.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
            Volg moties, stemmingen en partijstandpunten in één helder overzicht. Gebouwd op de open data van de Tweede Kamer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#moties" className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">Bekijk laatste stemmingen</a>
            <a href="https://opendata.tweedekamer.nl/documentatie/odata-api" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">Over de databron ↗</a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-white sm:p-10">
          <div className="absolute -right-10 -top-20 size-64 rounded-full border-[32px] border-blue-500/60" />
          <p className="relative text-sm font-medium text-blue-100">Laatste plenaire stemming</p>
          <h2 className="relative mt-4 max-w-md text-3xl font-bold leading-tight">De laatste moties uit de Tweede Kamer</h2>
          <div className="relative mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-bold">78%</p>
              <p className="mt-1 text-sm text-blue-100">van de uitgebrachte stemmen voor</p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">Aangenomen</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-y border-slate-200 py-7 sm:grid-cols-3">
        {[
          ["124", "moties dit vergaderjaar"],
          ["18", "stemmingen deze week"],
          ["92%", "data compleet verwerkt"],
        ].map(([value, label]) => (
          <div key={label} className="flex items-baseline gap-3 sm:block">
            <p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <MotionBrowser />

      <footer className="flex flex-col gap-3 border-t border-slate-200 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>PolitiQ · Onafhankelijk inzicht in parlementaire data</p>
        <p>Bron: <a className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4" href="https://opendata.tweedekamer.nl/" target="_blank" rel="noreferrer">Open Data Tweede Kamer</a></p>
      </footer>
    </main>
  );
}
