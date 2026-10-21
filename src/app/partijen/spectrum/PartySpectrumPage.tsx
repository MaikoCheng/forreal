"use client";

import { useEffect, useState } from "react";
import PartySpectrum from "../../PartySpectrum";
import type { Motion } from "@/lib/motions";
import { getCachedMotions } from "@/lib/motion-client";

export default function PartySpectrumPage() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    getCachedMotions().then(setMotions).catch(() => setError(true));
  }, []);
  if (error) return <div className="md3-card p-8 text-center text-sm text-rose-700">De spectrumgegevens konden niet worden opgehaald.</div>;
  if (motions.length === 0) return <div className="md3-card p-8 text-center text-sm text-slate-500">Spectrumgegevens worden opgehaald...</div>;
  return <PartySpectrum motions={motions} />;
}
