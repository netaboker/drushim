"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

const CACHE_KEY = "swr-app-cache";

function localStorageProvider() {
  if (typeof window === "undefined") return new Map();

  let parsed: [string, unknown][] = [];
  try {
    parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "[]");
  } catch {
    // cache פגום — מתחילים מחדש
  }
  const map = new Map<string, unknown>(parsed);

  window.addEventListener("beforeunload", () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.entries())));
    } catch {
      // localStorage מלא — מדלגים
    }
  });

  return map;
}

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 5 * 60 * 1000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
