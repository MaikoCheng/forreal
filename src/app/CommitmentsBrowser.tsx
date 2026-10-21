"use client";

import { useEffect, useMemo, useState } from "react";
import { getPaginationItems, type GovernmentCommitment } from "@/lib/motions";

function formatDate(value: string | null): string {
  if (!value) return "Niet bekend";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

const pageSize = 10;
const statusOptions = ["Openstaand", "Deels afgedaan", "Afgedaan"];

function matchesSearch(item: GovernmentCommitment, search: string): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase("nl-NL");
  const searchable = [
    item.number,
    item.activityNumber,
    item.minister,
    item.ministerRole,
    item.ministry,
    item.text,
    ...(item.addressedTo ?? []).flatMap((recipient) => [recipient.personName, recipient.partyName]),
  ].filter(Boolean).join(" ").toLocaleLowerCase("nl-NL");
  return !normalizedSearch || searchable.includes(normalizedSearch);
}

function matchesParty(item: GovernmentCommitment, selectedParty: string): boolean {
  return selectedParty === "Alle"
    || (item.addressedTo ?? []).some((recipient) => recipient.partyName === selectedParty);
}

export default function CommitmentsBrowser() {
  const [commitments, setCommitments] = useState<GovernmentCommitment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Alle");
  const [ministry, setMinistry] = useState("Alle");
  const [party, setParty] = useState("Alle");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetch("/api/commitments")
      .then(async (response) => {
        if (!response.ok) throw new Error("Commitments request failed");
        return response.json() as Promise<{ commitments: GovernmentCommitment[] }>;
      })
      .then((data) => setCommitments(data.commitments))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const ministries = useMemo(() =>
    [...new Set(commitments.map((item) => item.ministry).filter((value): value is string => Boolean(value)))]
      .sort((first, second) => first.localeCompare(second, "nl-NL")),
  [commitments]);
  const parties = useMemo(() =>
    [...new Set(commitments.flatMap((item) => (item.addressedTo ?? [])
      .map((recipient) => recipient.partyName)
      .filter((value): value is string => Boolean(value))))]
      .sort((first, second) => first.localeCompare(second, "nl-NL")),
  [commitments]);
  const filteredCommitments = useMemo(() => commitments.filter((item) =>
    matchesSearch(item, search)
    && (status === "Alle" || item.status === status)
    && (ministry === "Alle" || item.ministry === ministry)
    && matchesParty(item, party),
  ), [commitments, ministry, party, search, status]);
  const statusCounts = useMemo(() => Object.fromEntries(
    statusOptions.map((value) => [value, commitments.filter((item) =>
      matchesSearch(item, search)
      && (ministry === "Alle" || item.ministry === ministry)
      && matchesParty(item, party)
      && item.status === value,
    ).length]),
  ), [commitments, ministry, party, search]);
  const ministryCounts = useMemo(() => Object.fromEntries(
    ministries.map((value) => [value, commitments.filter((item) =>
      matchesSearch(item, search)
      && (status === "Alle" || item.status === status)
      && matchesParty(item, party)
      && item.ministry === value,
    ).length]),
  ), [commitments, ministries, party, search, status]);
  const partyCounts = useMemo(() => Object.fromEntries(
    parties.map((value) => [value, commitments.filter((item) =>
      matchesSearch(item, search)
      && (status === "Alle" || item.status === status)
      && (ministry === "Alle" || item.ministry === ministry)
      && matchesParty(item, value),
    ).length]),
  ), [commitments, ministry, parties, search, status]);
  const totalPages = Math.max(1, Math.ceil(filteredCommitments.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleCommitments = filteredCommitments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  function updateFilter(update: () => void) {
    update();
    setPage(1);
  }

  return (
    <section id="toezeggingen" className="md3-browser py-10 sm:py-14">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
            Regering
          </p>
          <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Regeringstoezeggingen
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Beloften van bewindspersonen aan de Tweede Kamer
          </p>
        </div>
        <label className="w-full lg:max-w-xs">
          <span className="sr-only">Zoek toezeggingen</span>
          <input
            value={search}
            onChange={(event) => updateFilter(() => setSearch(event.target.value))}
            placeholder="Zoek toezeggingen"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="mb-7 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
          <select value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="Alle">Alle ({commitments.filter((item) => matchesSearch(item, search)).length.toLocaleString("nl-NL")})</option>
            {statusOptions.map((value) => <option key={value} value={value}>{value} ({statusCounts[value] ?? 0})</option>)}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Ministerie</span>
          <select value={ministry} onChange={(event) => updateFilter(() => setMinistry(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="Alle">Alle ({commitments.filter((item) => matchesSearch(item, search) && (status === "Alle" || item.status === status) && matchesParty(item, party)).length.toLocaleString("nl-NL")})</option>
            {ministries.map((value) => <option key={value} value={value}>{value} ({ministryCounts[value] ?? 0})</option>)}
          </select>
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Toegezegd aan partij</span>
          <select value={party} onChange={(event) => updateFilter(() => setParty(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="Alle">Alle ({commitments.filter((item) => matchesSearch(item, search) && (status === "Alle" || item.status === status) && (ministry === "Alle" || item.ministry === ministry)).length.toLocaleString("nl-NL")})</option>
            {parties.map((value) => <option key={value} value={value}>{value} ({partyCounts[value] ?? 0})</option>)}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Toezeggingen worden opgehaald...
        </div>
      ) : hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          Toezeggingen konden niet worden opgehaald.
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {filteredCommitments.length.toLocaleString("nl-NL")} resultaten
          </p>
          <div className="grid min-w-0 gap-4">
            {visibleCommitments.map((commitment) => (
              <article key={commitment.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row">
                  <div className="min-w-0 max-w-full">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {commitment.number ?? "Toezegging"}{commitment.activityNumber && ` · ${commitment.activityNumber}`}
                    </p>
                    <h3 className="mt-2 break-words text-base font-bold text-slate-950">{commitment.text || "Geen tekst beschikbaar."}</h3>
                  </div>
                  {commitment.status && (
                    <span className="max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {commitment.status}
                    </span>
                  )}
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="font-semibold text-slate-800">Bewindspersoon</dt><dd>{commitment.minister ?? "Niet bekend"}{commitment.ministerRole && <span className="block text-xs text-slate-500">{commitment.ministerRole}</span>}</dd></div>
                  <div><dt className="font-semibold text-slate-800">Ministerie</dt><dd>{commitment.ministry ?? "Niet bekend"}</dd></div>
                  <div><dt className="font-semibold text-slate-800">Toegezegd op</dt><dd>{formatDate(commitment.createdAt)}</dd></div>
                  <div><dt className="font-semibold text-slate-800">Nakoming</dt><dd>{formatDate(commitment.dueDate)}</dd></div>
                </dl>
                {commitment.addressedTo.length > 0 && (
                  <p className="mt-4 break-words text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Toegezegd aan: </span>
                    {commitment.addressedTo.map((recipient) =>
                      [recipient.personName, recipient.partyName].filter(Boolean).join(" · "),
                    ).join(", ")}
                  </p>
                )}
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="min-h-11 max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
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
                    className={`grid size-9 place-items-center rounded-lg text-sm font-semibold transition ${
                      currentPage === pageItem
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {pageItem}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="min-h-11 max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                Volgende →
              </button>
            </div>
          )}
          {visibleCommitments.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Geen toezeggingen gevonden.
            </p>
          )}
        </>
      )}
    </section>
  );
}
