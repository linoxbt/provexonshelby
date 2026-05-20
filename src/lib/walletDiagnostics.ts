// Tiny pub/sub for capturing wallet adapter errors + handshake events so the
// diagnostics panel can surface them when the connect button "does nothing".
import { useEffect, useState } from "react";

export type DiagEntry = {
  id: string;
  ts: number;
  level: "info" | "warn" | "error";
  source: string;
  message: string;
};

const subs = new Set<(entries: DiagEntry[]) => void>();
let entries: DiagEntry[] = [];

export const pushDiag = (e: Omit<DiagEntry, "id" | "ts">) => {
  const entry: DiagEntry = { ...e, id: crypto.randomUUID(), ts: Date.now() };
  entries = [entry, ...entries].slice(0, 50);
  subs.forEach((fn) => fn(entries));
};

export const clearDiag = () => {
  entries = [];
  subs.forEach((fn) => fn(entries));
};

export const useDiagnostics = () => {
  const [list, setList] = useState<DiagEntry[]>(entries);
  useEffect(() => {
    subs.add(setList);
    return () => { subs.delete(setList); };
  }, []);
  return list;
};

export const SHELBY_HANDSHAKE_MESSAGE =
  "Provex × Shelby handshake\nAuthorize this wallet to sign Shelby blob commitments and Aptos provenance attestations.";
