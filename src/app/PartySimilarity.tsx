"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { availableMotionThemes, themesForMotion } from "./MotionBrowser";
import type { Motion } from "@/lib/motions";
import { getCachedMotions } from "@/lib/motion-client";

type PartyPosition = "Voor" | "Tegen";
const latestElectionDate = "2025-10-29";
const earliestElectionDate = "2012-09-12";
const electionOptions = [
  { value: latestElectionDate, label: "Sinds verkiezingen 2025" },
  { value: "2023-11-22", label: "Sinds verkiezingen 2023" },
  { value: "2021-03-17", label: "Sinds verkiezingen 2021" },
  { value: "2017-03-15", label: "Sinds verkiezingen 2017" },
  { value: "2012-09-12", label: "Sinds verkiezingen 2012" },
];

function canonicalParty(party: string): string {
  const normalized = party.toLocaleLowerCase("nl-NL").trim();
  const key = normalized.replace(/[^a-z0-9]/g, "");
  if (key === "christenunie") return "CU";
  if (key === "groenlinkspvda" || key === "pro") return "PRO";
  if (key === "groepmarkuszower") return "Groep M";
  return party;
}

function partyPositions(motion: Motion): Map<string, PartyPosition> {
  const counts = new Map<string, [number, number]>();
  motion.votes.forEach((vote) => {
    if (vote.stance !== "Voor" && vote.stance !== "Tegen") return;
    const party = canonicalParty(vote.party);
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

function similarityCellStyle(percentage: number, isDiagonal: boolean): CSSProperties {
  if (isDiagonal) {
    return { backgroundColor: "#e2e8f0", color: "#334155" };
  }
  if (percentage < 40) {
    return { backgroundColor: "#fecaca", color: "#7f1d1d" };
  }
  if (percentage < 60) {
    return { backgroundColor: "#fde68a", color: "#78350f" };
  }
  if (percentage < 80) {
    return { backgroundColor: "#bfdbfe", color: "#1e3a8a" };
  }
  return { backgroundColor: "#bbf7d0", color: "#14532d" };
}

export default function PartySimilarity() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(latestElectionDate);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: string; column: string } | null>(null);

  useEffect(() => {
    getCachedMotions(startDate === latestElectionDate ? latestElectionDate : earliestElectionDate)
      .then((data) => setMotions(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [startDate]);

  const filteredMotions = useMemo(() => motions.filter((motion) =>
    (!motion.startedAt || motion.startedAt >= `${startDate}T00:00:00`)
    && (selectedThemes.length === 0
      || selectedThemes.some((theme) => themesForMotion(motion).includes(theme))),
  ), [motions, selectedThemes, startDate]);
  const positionedMotions = useMemo(() => filteredMotions.map((motion) => partyPositions(motion)), [filteredMotions]);
  const allParties = useMemo(() => [...new Set(
    filteredMotions.flatMap((motion, index) => [
      ...positionedMotions[index].keys(),
      ...motion.submittingParties.map(canonicalParty),
      ...motion.votes.map((vote) => canonicalParty(vote.party)),
    ]),
  )].sort((first, second) => first.localeCompare(second, "nl-NL")), [filteredMotions, positionedMotions]);
  const parties = useMemo(() => (selectedParties.length === 0
    ? allParties
    : allParties.filter((party) => selectedParties.includes(party))), [allParties, selectedParties]);
  const matrix = useMemo(() => parties.map((firstParty) => parties.map((secondParty) => {
    if (firstParty === secondParty) return { percentage: 100, compared: 0 };
    let compared = 0;
    let matching = 0;
    positionedMotions.forEach((positions) => {
      const firstPosition = positions.get(firstParty);
      const secondPosition = positions.get(secondParty);
      if (!firstPosition || !secondPosition) return;
      compared += 1;
      if (firstPosition === secondPosition) matching += 1;
    });
    return {
      percentage: compared === 0 ? null : Math.round((matching / compared) * 100),
      compared,
    };
  })), [parties, positionedMotions]);

  return (
    <section id="partijgelijkenis" className="md3-browser py-10 sm:py-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Stemgedrag</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Partijgelijkenis</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Percentage moties waarin twee partijen dezelfde geregistreerde Voor- of Tegen-positie innamen.
          </p>
        </div>
      </div>
      <div className="mb-7 grid gap-5 lg:grid-cols-3">
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Periode</span>
          <select value={startDate} onChange={(event) => setStartDate(event.target.value)} className="md3-field w-full px-3 py-2 text-sm">
            {electionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <span className="mt-2 block text-xs text-slate-500">Standaard vanaf de laatste verkiezingen.</span>
        </label>
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Thema&apos;s</legend>
          <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
            {availableMotionThemes.map((value) => (
              <label key={value} className={`md3-chip cursor-pointer ${selectedThemes.includes(value) ? "md3-chip-selected" : ""}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedThemes.includes(value)}
                  onChange={() => setSelectedThemes((current) => current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value])}
                />
                {value}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{selectedThemes.length === 0 ? "Alle thema's" : `${selectedThemes.length} thema's geselecteerd`}</p>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Partijen</legend>
          <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
            {isLoading ? <span className="text-xs text-slate-500">Partijen worden opgehaald...</span> : allParties.length === 0 ? (
              <span className="text-xs text-slate-500">Geen partijen met geregistreerde stemposities.</span>
            ) : allParties.map((value) => (
              <label key={value} className={`md3-chip cursor-pointer ${selectedParties.includes(value) ? "md3-chip-selected" : ""}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedParties.includes(value)}
                  onChange={() => setSelectedParties((current) => current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value])}
                />
                {value}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{selectedParties.length === 0 ? "Alle partijen" : `${selectedParties.length} partijen geselecteerd`}</p>
        </fieldset>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600" aria-label="Legenda voor partijgelijkenis">
        <span className="font-bold text-slate-700">Gelijkenis:</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-200" aria-hidden="true" /> laag (0–39%)</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-amber-200" aria-hidden="true" /> gemiddeld (40–59%)</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-blue-200" aria-hidden="true" /> hoog (60–79%)</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-200" aria-hidden="true" /> zeer hoog (80–100%)</span>
      </div>
      {isLoading ? (
        <div className="md3-card p-8 text-center text-sm text-slate-500">Stemgegevens worden opgehaald...</div>
      ) : hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">Stemgegevens konden niet worden opgehaald.</div>
      ) : (
        <div className="md3-card overflow-hidden">
          <p className="border-b border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] px-4 py-2 text-xs text-slate-600 sm:hidden">
            Veeg horizontaal om alle partijen te bekijken.
          </p>
          <div
            className="overflow-x-auto"
            role="region"
            aria-label="Partijgelijkenismatrix"
            tabIndex={0}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="sticky left-0 z-20 min-w-24 bg-slate-50 px-3 py-3 font-bold shadow-[2px_0_0_var(--md-outline-variant)] sm:min-w-32 sm:px-4">Partij</th>
                {parties.map((party) => <th key={party} className="px-3 py-3 text-center font-bold">{party}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parties.map((party, rowIndex) => (
                <tr key={party}>
                  <th className="sticky left-0 z-10 min-w-24 bg-[var(--md-surface)] px-3 py-3 font-bold text-slate-900 shadow-[2px_0_0_var(--md-outline-variant)] sm:min-w-32 sm:px-4">{party}</th>
                  {matrix[rowIndex].map((cell, columnIndex) => (
                    <td
                      key={parties[columnIndex]}
                      className="px-3 py-3 text-center transition-[filter,opacity] duration-150"
                      onMouseEnter={() => setHoveredCell({
                        row: party,
                        column: parties[columnIndex],
                      })}
                      style={{
                        ...(cell.percentage === null
                          ? {}
                          : similarityCellStyle(cell.percentage, party === parties[columnIndex])),
                        opacity: hoveredCell
                          && hoveredCell.row !== party
                          && hoveredCell.column !== parties[columnIndex]
                          ? 0.3
                          : 1,
                        filter: hoveredCell
                          && hoveredCell.row !== party
                          && hoveredCell.column !== parties[columnIndex]
                          ? "brightness(0.65)"
                          : undefined,
                      }}
                    >
                      {cell.percentage === null ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span
                          title={party === parties[columnIndex] ? "Eigen positie" : `${cell.compared} gezamenlijke vergelijkingen`}
                          aria-label={party === parties[columnIndex]
                            ? `${party}: eigen positie, 100 procent`
                            : `${party} en ${parties[columnIndex]}: ${cell.percentage} procent gelijkenis, ${cell.compared} vergelijkingen`}
                        >
                          <span className="font-bold">{cell.percentage}%</span>
                          {party !== parties[columnIndex] && <span className="block text-[10px] opacity-80">n={cell.compared}</span>}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {parties.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Geen vergelijkbare stemgegevens gevonden.</p>}
        </div>
      )}
    </section>
  );
}
