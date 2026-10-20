"use client";

import { useMemo, useState } from "react";
import { formatMotionDate, type Motion } from "@/lib/motions";

const themeKeywords: Record<string, string[]> = {
  Wonen: ["woon", "woning", "huur", "huisvesting"],
  Zorg: ["zorg", "medisch", "ziekenhuis", "gezondheid", "patiënt"],
  Onderwijs: ["onderwijs", "school", "student", "leraar", "opleiding"],
  Klimaat: ["klimaat", "stikstof", "energie", "duurzaam", "natuur"],
  Migratie: ["migratie", "asiel", "vluchteling", "inburgering"],
  Veiligheid: ["veiligheid", "politie", "justitie", "criminaliteit"],
  Economie: ["economie", "werk", "arbeid", "belasting", "ondernemer"],
  Defensie: ["defensie", "militair", "leger", "navo"],
};

const tabs = ["Alle moties", "Recente moties", "Per thema"];
const pageEllipsis = "...";

function themesForMotion(motion: Motion): string[] {
  const subject = motion.subject.toLocaleLowerCase("nl-NL");
  return Object.entries(themeKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => subject.includes(keyword)))
    .map(([theme]) => theme);
}

export default function MotionBrowser({ motions }: { motions: Motion[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const visibleMotions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("nl-NL");
    return motions.filter((motion) => {
      const matchesTab = activeTab !== "Recente moties" || motions.indexOf(motion) < 20;
      const themes = themesForMotion(motion);
      const matchesTheme = selectedThemes.length === 0 || selectedThemes.some((theme) => themes.includes(theme));
      const matchesSearch = !normalizedSearch
        || motion.subject.toLocaleLowerCase("nl-NL").includes(normalizedSearch)
        || motion.number.toLocaleLowerCase("nl-NL").includes(normalizedSearch);
      return matchesTab && matchesTheme && matchesSearch;
    });
  }, [activeTab, motions, search, selectedThemes]);

  const totalPages = Math.max(1, Math.ceil(visibleMotions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMotions = visibleMotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => (
      pageNumber === 1
      || pageNumber === totalPages
      || Math.abs(pageNumber - currentPage) <= 1
    ))
    .reduce<(number | string)[]>((pages, pageNumber, index, filteredPages) => {
      const previousPage = filteredPages[index - 1];
      if (previousPage && pageNumber - previousPage > 1) {
        pages.push(pageEllipsis);
      }
      pages.push(pageNumber);
      return pages;
    }, []);

  function resetPage() {
    setPage(1);
  }

  function toggleTheme(theme: string) {
    resetPage();
    setSelectedThemes((current) => current.includes(theme)
      ? current.filter((item) => item !== theme)
      : [...current, theme]);
  }

  return (
    <section id="moties" className="py-14">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Moties</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Alle moties</h2>
          <p className="mt-2 text-sm text-slate-500">{motions.length.toLocaleString("nl-NL")} moties rechtstreeks uit de Tweede Kamer API</p>
        </div>
        <label className="w-full lg:max-w-xs">
          <span className="sr-only">Zoek moties</span>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); resetPage(); }}
            placeholder="Zoek op onderwerp of nummer"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetPage(); }}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Thema</span>
        {Object.keys(themeKeywords).map((theme) => (
          <button
            key={theme}
            onClick={() => toggleTheme(theme)}
            aria-pressed={selectedThemes.includes(theme)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedThemes.includes(theme) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}
          >
            {theme}
          </button>
        ))}
        {(selectedThemes.length > 0 || search) && (
          <button onClick={() => { setSelectedThemes([]); setSearch(""); resetPage(); }} className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800">
            Wis filters
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-slate-500">{visibleMotions.length.toLocaleString("nl-NL")} resultaten</p>
      {visibleMotions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Geen moties gevonden voor deze filters.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {paginatedMotions.map((motion) => (
            <article key={motion.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1 font-mono text-xs text-slate-400">Motie {motion.number}</p>
                <h3 className="font-semibold text-slate-900">{motion.subject}</h3>
                <p className="mt-2 text-xs text-slate-500">{formatMotionDate(motion.startedAt)} · {motion.status ?? "Status onbekend"}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                {themesForMotion(motion).map((theme) => (
                  <span key={theme} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{theme}</span>
                ))}
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{motion.meetingYear ?? "Onbekend"}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {visibleMotions.length > 0 && (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <span>Per pagina</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                resetPage();
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {[10, 20, 30].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Vorige
            </button>
            <span className="min-w-24 text-center text-sm text-slate-500">
              Pagina {currentPage} van {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Volgende →
            </button>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Paginanavigatie">
            {pageNumbers.map((pageNumber, index) => typeof pageNumber === "string" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-400">...</span>
            ) : (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                className={`grid size-9 place-items-center rounded-lg text-sm font-semibold transition ${currentPage === pageNumber ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"}`}
              >
                {pageNumber}
              </button>
            ))}
          </nav>
        </div>
      )}
    </section>
  );
}
