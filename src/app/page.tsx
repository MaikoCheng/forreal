import Link from "next/link";

const parties = [
  { name: "PVV", color: "#164e63", stance: "Voor", votes: "18 / 18" },
  { name: "GroenLinks-PvdA", color: "#be123c", stance: "Voor", votes: "25 / 25" },
  { name: "VVD", color: "#f59e0b", stance: "Tegen", votes: "22 / 24" },
  { name: "NSC", color: "#0f766e", stance: "Verdeeld", votes: "9 / 20" },
  { name: "D66", color: "#f97316", stance: "Voor", votes: "9 / 9" },
  { name: "BBB", color: "#65a30d", stance: "Tegen", votes: "7 / 7" },
];

const recentVotes = [
  {
    id: "36671-38",
    title: "Motie over betaalbaarheid van wonen",
    date: "Vandaag, 15:42",
    result: "Aangenomen",
    color: "emerald",
  },
  {
    id: "36671-31",
    title: "Motie over de langjarige aanpak stikstof",
    date: "Vandaag, 15:17",
    result: "Verworpen",
    color: "rose",
  },
  {
    id: "36671-22",
    title: "Motie over publieke dienstverlening",
    date: "Gisteren, 21:06",
    result: "Aangehouden",
    color: "amber",
  },
];

export default function Home() {
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
          <h2 className="relative mt-4 max-w-md text-3xl font-bold leading-tight">Motie over betaalbaarheid van wonen</h2>
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

      <section id="moties" className="grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Recente moties</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Wat gebeurde er vandaag?</h2>
            </div>
            <button className="hidden text-sm font-semibold text-blue-600 sm:block">Alles bekijken →</button>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {recentVotes.map((vote) => (
              <article key={vote.id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-xs text-slate-400">Motie {vote.id}</p>
                  <h3 className="truncate font-semibold text-slate-900">{vote.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">{vote.date}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${vote.color === "emerald" ? "bg-emerald-50 text-emerald-700" : vote.color === "rose" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{vote.result}</span>
              </article>
            ))}
          </div>
        </div>
        <div id="partijen">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Partijen</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Stemgedrag per fractie</h2>
          </div>
          <div className="space-y-3">
            {parties.map((party) => (
              <div key={party.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="size-3 rounded-full" style={{ backgroundColor: party.color }} />
                <span className="flex-1 text-sm font-semibold text-slate-800">{party.name}</span>
                <span className="text-xs text-slate-400">{party.votes}</span>
                <span className={`w-16 text-right text-xs font-bold ${party.stance === "Voor" ? "text-emerald-600" : party.stance === "Tegen" ? "text-rose-600" : "text-amber-600"}`}>{party.stance}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-slate-200 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>PolitiQ · Onafhankelijk inzicht in parlementaire data</p>
        <p>Bron: <a className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4" href="https://opendata.tweedekamer.nl/" target="_blank" rel="noreferrer">Open Data Tweede Kamer</a></p>
      </footer>
    </main>
  );
}
