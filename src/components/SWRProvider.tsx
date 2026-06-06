"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,       // לא מרענן כשחוזרים לחלון
        revalidateOnReconnect: false,    // לא מרענן בחיבור מחדש
        dedupingInterval: 5 * 60 * 1000, // cache ל-5 דקות
        errorRetryCount: 2,              // מקסימום 2 ניסיונות חוזרים
      }}
    >
      {children}
    </SWRConfig>
  );
}
