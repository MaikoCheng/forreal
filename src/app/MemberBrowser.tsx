"use client";

import { useEffect, useMemo, useState } from "react";
import type { MemberProfile, Motion } from "@/lib/motions";

type MemberStats = {
  personId: string;
  name: string;
  party: string;
  submitted: number;
  forVotes: number;
  against: number;
  notParticipated: number;
  profile?: MemberProfile;
};

type SortKey = "name" | "submitted" | "forVotes" | "against" | "notParticipated";
type SortDirection = "asc" | "desc";

const emptyStats = (personId: string, name: string, party: string): MemberStats => ({
  personId,
  name,
  party,
  submitted: 0,
  forVotes: 0,
  against: 0,
  notParticipated: 0,
});

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "submitted", label: "Moties" },
  { key: "name", label: "Naam" },
  { key: "forVotes", label: "Voor" },
  { key: "against", label: "Tegen" },
  { key: "notParticipated", label: "Niet deelgenomen" },
];

function formatPeriod(from: string | null, to: string | null): string {
  if (!from && !to) return "";
  return `${from ?? "?"} - ${to ?? "heden"}`;
}

function MemberProfileDetails({
  profile,
  isLoading,
}: {
  profile?: MemberProfile;
  isLoading: boolean;
}) {
  const identity = profile && [profile.role, profile.birthPlace, profile.birthDate]
    .filter(Boolean)
    .join(" · ");
  return (
    <details className="mt-3 border-t border-slate-100 pt-3 text-left">
      <summary className="cursor-pointer text-xs font-semibold text-blue-700">
        Profiel bekijken
      </summary>
      {isLoading && (
        <p className="mt-3 text-xs text-slate-500">Profiel wordt opgehaald...</p>
      )}
      {!isLoading && !profile && (
        <p className="mt-3 text-xs text-slate-500">
          Geen aanvullende profielgegevens beschikbaar.
        </p>
      )}
      {!isLoading && profile && (
      <div className="mt-3 space-y-3 text-xs text-slate-600">
        {identity && <p>{identity}</p>}
        {profile.education.length > 0 && (
          <div>
            <p className="font-bold text-slate-700">Opleiding</p>
            {profile.education.map((item, index) => (
              <p key={`${item.title}-${index}`}>
                {[item.title, item.institution, item.place].filter(Boolean).join(", ")}
                {formatPeriod(item.from, item.to) && ` (${formatPeriod(item.from, item.to)})`}
              </p>
            ))}
          </div>
        )}
        {profile.careers.length > 0 && (
          <div>
            <p className="font-bold text-slate-700">Loopbaan</p>
            {profile.careers.map((item, index) => (
              <p key={`${item.title}-${index}`}>
                {[item.title, item.employer, item.place].filter(Boolean).join(", ")}
                {formatPeriod(item.from, item.to) && ` (${formatPeriod(item.from, item.to)})`}
              </p>
            ))}
          </div>
        )}
        {profile.secondaryFunctions.length > 0 && (
          <div>
            <p className="font-bold text-slate-700">Nevenfuncties</p>
            {profile.secondaryFunctions.map((item, index) => (
              <p key={`${item.description}-${index}`}>
                {[item.description, item.type, item.explanation].filter(Boolean).join(" · ")}
                {formatPeriod(item.from, item.to) && ` (${formatPeriod(item.from, item.to)})`}
              </p>
            ))}
          </div>
        )}
      </div>
      )}
    </details>
  );
}

export default function MemberBrowser() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [loadedProfileKey, setLoadedProfileKey] = useState("");
  const [partyFilter, setPartyFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetch("/api/motions")
      .then(async (response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json() as Promise<{ motions: Motion[] }>;
      })
      .then((data) => setMotions(data.motions))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const members = useMemo(() => {
    const stats = new Map<string, MemberStats>();
    const getMember = (personId: string, name: string, party: string | null) => {
      const current = stats.get(personId);
      if (current) return current;
      const created = emptyStats(personId, name, party ?? "Onbekende partij");
      stats.set(personId, created);
      return created;
    };

    motions.forEach((motion) => {
      motion.submittingMembers.forEach((member) => {
        getMember(member.personId, member.name, member.party);
        const current = stats.get(member.personId);
        if (current) current.submitted += 1;
      });
      motion.votes
        .filter((vote) => vote.personId && vote.name)
        .forEach((vote) => {
          const current = getMember(vote.personId as string, vote.name as string, vote.party);
          if (vote.stance === "Voor") current.forVotes += 1;
          else if (vote.stance === "Tegen") current.against += 1;
          else current.notParticipated += 1;
        });
    });

    return [...stats.values()].map((member) => ({
      ...member,
      profile: profiles.find((profile) => profile.id === member.personId),
    }));
  }, [motions, profiles]);

  const parties = useMemo(() =>
    [...new Set(members.map((member) => member.party))]
      .sort((first, second) => first.localeCompare(second, "nl-NL")),
  [members]);

  const visibleMembers = useMemo(() => {
    const filtered = partyFilter.length === 0
      ? members
      : members.filter((member) => partyFilter.includes(member.party));
    return [...filtered].sort((first, second) => {
      const comparison = sortKey === "name"
        ? first.name.localeCompare(second.name, "nl-NL")
        : first[sortKey] - second[sortKey];
      return (sortDirection === "asc" ? comparison : -comparison)
        || first.name.localeCompare(second.name, "nl-NL");
    });
  }, [members, partyFilter, sortDirection, sortKey]);

  function toggleParty(party: string) {
    setPartyFilter((current) =>
      current.includes(party)
        ? current.filter((selected) => selected !== party)
        : [...current, party],
    );
    setPage(1);
  }

  function sortBy(nextKey: SortKey) {
    setPage(1);
    if (sortKey === nextKey) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextKey);
      setSortDirection(nextKey === "name" ? "asc" : "desc");
    }
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  const totalPages = Math.max(1, Math.ceil(visibleMembers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMembers = visibleMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visibleProfileKey = [...paginatedMembers]
    .map((member) => member.personId)
    .sort()
    .join(",");
  const profilesLoading = visibleProfileKey !== loadedProfileKey;

  useEffect(() => {
    if (!visibleProfileKey) return;
    const personIds = visibleProfileKey.split(",");
    fetch(`/api/members?ids=${encodeURIComponent(personIds.join(","))}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Member profile request failed");
        return response.json() as Promise<{ members: MemberProfile[] }>;
      })
      .then((data) => setProfiles(data.members))
      .catch(() => setProfiles([]))
      .finally(() => setLoadedProfileKey(visibleProfileKey));
  }, [visibleProfileKey]);

  return (
    <section id="leden" className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--md-primary)]">
            Tweede Kamerleden
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--md-on-surface)]">
            Wie dient de meeste moties in?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--md-on-surface-variant)]">
            Gerangschikt op moties waarbij een Kamerlid indiener of
            mede-indiener is. Let op, kamerleden werken vaak samen om moties te vormen binnen, en buiten hun partij. Stemcijfers zijn alleen gebaseerd op
            individueel geregistreerde stemmen.
          </p>
        </div>
        <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-1.5 text-xs font-bold text-[var(--md-on-primary-container)]">
          Dit kalenderjaar
        </span>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="text-sm font-semibold text-slate-700">
          Filter op partij
        </span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            type="button"
            onClick={() => {
              setPartyFilter([]);
              setPage(1);
            }}
            aria-pressed={partyFilter.length === 0}
            className={`shrink-0 cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ${
              partyFilter.length === 0
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
            }`}
          >
            Alle partijen
          </button>
          {parties.map((party) => {
            const isSelected = partyFilter.includes(party);
            return (
              <button
                key={party}
                type="button"
                onClick={() => toggleParty(party)}
                aria-pressed={isSelected}
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {party}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-3 md:hidden">
        <label htmlFor="member-sort" className="text-sm font-semibold text-slate-700">
          Sorteer op
        </label>
        <select
          id="member-sort"
          value={sortKey}
          onChange={(event) => sortBy(event.target.value as SortKey)}
          className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          aria-label={`Sorteervolgorde: ${sortDirection === "asc" ? "oplopend" : "aflopend"}`}
        >
          {sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-[var(--md-outline-variant)] bg-white p-6 text-sm text-[var(--md-on-surface-variant)]">
          Kamerleden worden opgehaald...
        </div>
      )}
      {hasError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          De gegevens van Kamerleden konden niet worden opgehaald.
        </div>
      )}
      {!isLoading && !hasError && members.length === 0 && (
        <div className="rounded-2xl border border-[var(--md-outline-variant)] bg-white p-6 text-sm text-[var(--md-on-surface-variant)]">
          Er zijn nog geen individuele motie- of stemgegevens beschikbaar.
        </div>
      )}
      {!isLoading && !hasError && members.length > 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {paginatedMembers.map((member, index) => (
              <article
                key={member.personId}
                className="rounded-2xl border border-[var(--md-outline-variant)] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="pt-0.5 text-xs font-bold text-slate-400">
                    {(currentPage - 1) * pageSize + index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">{member.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{member.party}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <dt className="text-xs text-slate-500">Moties</dt>
                    <dd className="mt-0.5 text-lg font-bold text-slate-900">{member.submitted}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-emerald-700">Voor</dt>
                    <dd className="mt-0.5 text-lg font-bold text-emerald-700">{member.forVotes}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-rose-700">Tegen</dt>
                    <dd className="mt-0.5 text-lg font-bold text-rose-700">{member.against}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Niet deelgenomen</dt>
                    <dd className="mt-0.5 text-lg font-bold text-slate-600">{member.notParticipated}</dd>
                  </div>
                </dl>
                <MemberProfileDetails profile={member.profile} isLoading={profilesLoading} />
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-[var(--md-outline-variant)] bg-white md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[var(--md-outline-variant)] bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {(
                  [
                    ["name", "Kamerlid", "text-left"],
                    ["submitted", "Moties", "text-right"],
                    ["forVotes", "Voor", "text-right text-emerald-700"],
                    ["against", "Tegen", "text-right text-rose-700"],
                    [
                      "notParticipated",
                      "Niet deelgenomen",
                      "text-right text-slate-600",
                    ],
                  ] as const
                ).map(([key, label, alignment]) => (
                  <th key={key} className={`px-4 py-3 font-bold ${alignment}`}>
                    <button
                      type="button"
                      onClick={() => sortBy(key)}
                      className="cursor-pointer hover:text-blue-700"
                      aria-label={`Sorteer op ${label}`}
                    >
                      {label}{" "}
                      <span aria-hidden="true">{sortIndicator(key)}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.map((member, index) => (
                <tr key={member.personId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-bold text-slate-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                      <span>
                        <span className="block font-bold text-slate-900">
                          {member.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {member.party}
                        </span>
                        <MemberProfileDetails profile={member.profile} isLoading={profilesLoading} />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {member.submitted}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700">
                    {member.forVotes}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-700">
                    {member.against}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {member.notParticipated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">
              {visibleMembers.length} {visibleMembers.length === 1 ? "Kamerlid" : "Kamerleden"}
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Vorige
              </button>
              <span className="min-w-24 text-center text-sm text-slate-500">
                Pagina {currentPage} van {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Volgende →
              </button>
            </div>
            <nav className="hidden flex-wrap justify-center gap-1 md:flex" aria-label="Paginanavigatie Kamerleden">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  className={`grid size-9 cursor-pointer place-items-center rounded-lg text-sm font-semibold transition ${
                    currentPage === pageNumber
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-[var(--md-on-surface-variant)]">
        “Niet deelgenomen” wordt alleen geteld wanneer de API dit expliciet als
        stemregistratie vermeldt; ontbrekende stemregistraties worden niet als
        afwezigheid geïnterpreteerd.
      </p>
    </section>
  );
}
