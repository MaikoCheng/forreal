"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { availableMotionThemes, canonicalPartyName, logoFitClass, partyLogo, themesForMotion } from "./MotionBrowser";
import { getPaginationItems } from "@/lib/motions";
import type { Motion, MotionDetail } from "@/lib/motions";
import { getCachedCabinetMotions } from "@/lib/motion-client";

// Keep this list aligned with the current governing coalition.
const currentCabinetParties = ["CDA", "D66", "VVD"];
const cabinetStartDate = "2026-02-23";

type Position = "Voor" | "Tegen";

function canonicalParty(party: string): string {
  const key = party.toLocaleLowerCase("nl-NL").replace(/[^a-z0-9]/g, "");
  if (key === "groenlinkspvda" || key === "pro") return "PRO";
  if (key === "christenunie") return "CU";
  return party.trim();
}

function cabinetPositions(motion: Motion): Map<string, Position> {
  const counts = new Map<string, [number, number]>();
  motion.votes.forEach((vote) => {
    const party = canonicalParty(vote.party);
    if (!currentCabinetParties.includes(party) || (vote.stance !== "Voor" && vote.stance !== "Tegen")) return;
    const [forVotes, againstVotes] = counts.get(party) ?? [0, 0];
    counts.set(party, vote.stance === "Voor"
      ? [forVotes + 1, againstVotes]
      : [forVotes, againstVotes + 1]);
  });
  return new Map([...counts].flatMap(([party, [forVotes, againstVotes]]) =>
    forVotes === againstVotes
      ? []
      : [[party, forVotes > againstVotes ? "Voor" as const : "Tegen" as const]],
  ));
}

function majorityPosition(positions: Map<string, Position>): Position | null {
  const forCount = [...positions.values()].filter((position) => position === "Voor").length;
  const againstCount = positions.size - forCount;
  return forCount === againstCount ? null : forCount > againstCount ? "Voor" : "Tegen";
}

export default function CabinetAnalysis() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [theme, setTheme] = useState("Alle");
  const [minorityParty, setMinorityParty] = useState("Alle");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedMotion, setSelectedMotion] = useState<MotionDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    getCachedCabinetMotions(cabinetStartDate).then(setMotions).catch(() => setHasError(true)).finally(() => setIsLoading(false));
  }, []);

  const allDisagreements = useMemo(() => motions.filter((motion) => {
    if (motion.startedAt
      && (motion.startedAt < `${cabinetStartDate}T00:00:00` || motion.startedAt > new Date().toISOString())) return false;
    const positions = cabinetPositions(motion);
    return new Set(positions.values()).size > 1;
  }), [motions]);
  const disagreements = useMemo(() => allDisagreements.filter((motion) =>
    (theme === "Alle" || themesForMotion(motion).includes(theme))
    && (minorityParty === "Alle"
      || (() => {
        const positions = cabinetPositions(motion);
        return positions.get(minorityParty) !== undefined
          && positions.get(minorityParty) !== majorityPosition(positions);
      })()),
  ), [allDisagreements, minorityParty, theme]);
  const themeCounts = useMemo(() => availableMotionThemes
    .map((item) => ({
      theme: item,
      count: allDisagreements.filter((motion) => themesForMotion(motion).includes(item)).length,
    }))
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count), [allDisagreements]);
  const partyBreakdown = useMemo(() => currentCabinetParties.map((party) => ({
    party,
    count: disagreements.filter((motion) => {
      const positions = cabinetPositions(motion);
      return positions.get(party) !== undefined && positions.get(party) !== majorityPosition(positions);
    }).length,
  })), [disagreements]);
  const totalPages = Math.max(1, Math.ceil(disagreements.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleDisagreements = disagreements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  async function openMotion(motion: Motion) {
    setSelectedMotion(null);
    setDetailError(false);
    setIsDetailLoading(true);
    try {
      const response = await fetch(`/api/motions/${motion.id}`);
      if (!response.ok) throw new Error("Detail request failed");
      setSelectedMotion(await response.json() as MotionDetail);
    } catch {
      setDetailError(true);
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <section className="md3-browser py-10 sm:py-14">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--md-primary)]">Kabinet</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--md-on-surface)]">Waar is het kabinet verdeeld?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--md-on-surface-variant)]">
            Moties waarin de huidige coalitiepartijen verschillende meerderheidposities innamen.
            De analyse gebruikt geregistreerde fractiestemmen en is gebaseerd op {currentCabinetParties.join(", ")}.
            Periode: 23 februari 2026 tot vandaag.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:max-w-md sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Thema</span>
            <select value={theme} onChange={(event) => { setTheme(event.target.value); setPage(1); }} className="md3-field min-h-11 w-full px-3 py-2 text-sm">
              <option value="Alle">Alle thema&apos;s</option>
              {availableMotionThemes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Minderheidspartij</span>
            <select value={minorityParty} onChange={(event) => { setMinorityParty(event.target.value); setPage(1); }} className="md3-field min-h-11 w-full px-3 py-2 text-sm">
              <option value="Alle">Alle partijen</option>
              {currentCabinetParties.map((party) => <option key={party} value={party}>{party}</option>)}
            </select>
          </label>
        </div>
      </div>
      {isLoading ? <div className="md3-card p-8 text-center text-sm text-slate-500">Kabinetstemmen worden opgehaald...</div>
        : hasError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">Kabinetstemmen konden niet worden opgehaald.</div>
          : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="md3-tonal-card p-4"><p className="text-xs font-bold uppercase tracking-wide">Verdeelde moties</p><p className="mt-2 text-3xl font-bold">{disagreements.length}</p></div>
                {partyBreakdown.map((item) => <div key={item.party} className="md3-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.party}</p><p className="mt-2 text-2xl font-bold text-slate-900">{item.count}</p><p className="text-xs text-slate-500">niet met de meerderheid</p></div>)}
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
                <div className="md3-card overflow-hidden">
                  <div className="border-b border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] px-4 py-3"><h3 className="font-bold">Moties met kabinetsverschil</h3></div>
                  <div className="divide-y divide-slate-100">
                    {visibleDisagreements.map((motion) => {
                      const positions = cabinetPositions(motion);
                      const majority = majorityPosition(positions);
                      const minorityParties = [...positions].filter(([, position]) => position !== majority).map(([party]) => party).join(", ");
                      return <button key={motion.id} type="button" onClick={() => openMotion(motion)} className="block w-full cursor-pointer p-4 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-[var(--md-primary)]">{motion.number}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${motion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : motion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{motion.outcome}</span></div><p className="mt-1 font-semibold text-slate-900">{motion.subject}</p><span className="mt-3 inline-flex rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800"><strong className="mr-1">Minderheid:</strong> {minorityParties || "onbekend"}</span></button>;
                    })}
                    {disagreements.length === 0 && <p className="p-6 text-sm text-slate-500">Geen verdeelde moties gevonden voor dit thema.</p>}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--md-outline-variant)] p-4">
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={currentPage === 1}
                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ← Vorige
                      </button>
                      {getPaginationItems(totalPages, currentPage).map((pageItem, index) =>
                        pageItem === "ellipsis" ? (
                          <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-500">…</span>
                        ) : (
                          <button
                            key={pageItem}
                            type="button"
                            onClick={() => setPage(pageItem)}
                            aria-current={currentPage === pageItem ? "page" : undefined}
                            className={`grid size-9 place-items-center rounded-lg text-sm font-semibold transition ${currentPage === pageItem ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"}`}
                          >
                            {pageItem}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        disabled={currentPage === totalPages}
                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Volgende →
                      </button>
                    </div>
                  )}
                </div>
                <div className="md3-card p-4"><h3 className="font-bold">Thema&apos;s</h3><div className="mt-4 space-y-2">{themeCounts.map((item) => <button key={item.theme} type="button" onClick={() => { setTheme((current) => current === item.theme ? "Alle" : item.theme); setPage(1); }} aria-pressed={theme === item.theme} className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm transition ${theme === item.theme ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}><span className="min-w-0">{item.theme}</span><span className="font-bold">{item.count}</span></button>)}</div></div>
              </div>
            </>
          )}
      {(isDetailLoading || detailError || selectedMotion) && (
        <div className="md3-dialog-scrim fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Motiedetails">
          <div className="md3-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="font-mono text-xs text-slate-400">Motiedetails</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{selectedMotion?.subject ?? "Motie wordt geladen"}</h2></div>
              <button type="button" onClick={() => { setSelectedMotion(null); setDetailError(false); }} className="grid min-h-11 min-w-11 size-11 shrink-0 place-items-center rounded-lg text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Sluiten">×</button>
            </div>
            {isDetailLoading ? <p className="mt-8 text-sm text-slate-500">Motie, stemmingen en document worden opgehaald...</p>
              : detailError ? <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">De details konden niet worden opgehaald.</p>
                : selectedMotion && <div className="mt-6 space-y-6">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono">{selectedMotion.number}</span><span className="rounded-full bg-slate-100 px-3 py-1.5">{selectedMotion.startedAt?.slice(0, 10) ?? "Datum onbekend"}</span><span className={`rounded-full px-3 py-1.5 font-semibold ${selectedMotion.outcome === "Aangenomen" ? "bg-emerald-50 text-emerald-700" : selectedMotion.outcome === "Niet aangenomen" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{selectedMotion.outcome}</span></div>
                  <section><h3 className="text-lg font-bold text-slate-950">Ingediend door</h3>{selectedMotion.submittingParties.length === 0 ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">De indienende partij is niet geregistreerd.</p> : <div className="mt-3 flex flex-wrap gap-2">{selectedMotion.submittingParties.map((party) => { const displayParty = canonicalPartyName(party); const logo = partyLogo(displayParty); return <span key={displayParty} className="inline-flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 text-sm text-slate-700">{logo ? <Image src={logo} alt="" width={24} height={24} className={logoFitClass(logo, "size-6 rounded-full")} /> : <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{displayParty.slice(0, 2).toUpperCase()}</span>}{displayParty}</span>; })}</div>}</section>
                  <section><h3 className="text-lg font-bold text-slate-950">Tekst van de motie</h3><p className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selectedMotion.text || "Geen motietekst beschikbaar."}</p></section>
                  <section><h3 className="text-lg font-bold text-slate-950">Stemmingen per partij</h3><div className="mt-3 grid gap-5 sm:grid-cols-2">{(["Voor", "Tegen"] as const).map((stance) => { const votes = [...new Map(selectedMotion.votes.filter((vote) => vote.stance === stance).map((vote) => [canonicalPartyName(vote.party), vote])).values()].sort((first, second) => { const firstIndex = currentCabinetParties.indexOf(canonicalPartyName(first.party)); const secondIndex = currentCabinetParties.indexOf(canonicalPartyName(second.party)); return (firstIndex < 0 ? currentCabinetParties.length : firstIndex) - (secondIndex < 0 ? currentCabinetParties.length : secondIndex) || canonicalPartyName(first.party).localeCompare(canonicalPartyName(second.party), "nl-NL"); }); return <div key={stance} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><h4 className={`font-bold ${stance === "Voor" ? "text-emerald-700" : "text-rose-700"}`}>{stance}</h4><span className="text-sm text-slate-400">{votes.length}</span></div><div className="mt-3 flex flex-wrap gap-2">{votes.map((vote) => { const displayParty = canonicalPartyName(vote.party); const logo = partyLogo(displayParty); const isCabinetParty = currentCabinetParties.includes(displayParty); return <span key={displayParty} title={isCabinetParty ? "Huidige kabinetspartij" : undefined} className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm text-slate-700 ${isCabinetParty ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "bg-slate-100"}`}>{logo ? <Image src={logo} alt="" width={24} height={24} className={logoFitClass(logo, "size-6 rounded-full")} /> : <span className="grid size-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{displayParty.slice(0, 2).toUpperCase()}</span>}{displayParty}</span>; })}</div></div>; })}</div></section>
                </div>}
          </div>
        </div>
      )}
    </section>
  );
}
