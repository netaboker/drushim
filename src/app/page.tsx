"use client";

import Link from "next/link";
import { HandHelping, Megaphone, Users, CheckCircle2 } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import RequestCard from "@/components/requests/RequestCard";
import RequestFilters from "@/components/requests/RequestFilters";
import { useState } from "react";
import { RequestCategory, RequestStatus } from "@/lib/types";

export default function HomePage() {
  const { requests, helperProfiles, loading } = useAppData();
  const { allUsers } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | "הכל">("הכל");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "הכל">("פתוח");

  const approved = requests.filter((r) => r.approvalStatus === "approved");

  const filtered = approved.filter((r) => {
    const matchSearch = !search || r.title.includes(search) || r.description.includes(search) || r.category.includes(search);
    const matchCat = selectedCategory === "הכל" || r.category === selectedCategory;
    const matchStatus = selectedStatus === "הכל" || r.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const openCount = approved.filter((r) => r.status === "פתוח").length;
  const doneCount = approved.filter((r) => r.status === "הושלם").length;
  const helpersCount = helperProfiles.filter((h) => h.isApproved).length;

  if (loading) {
    return (
      <div className="animate-fade-in">
        {/* Hero skeleton */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
          <div className="page-container py-10">
            <div className="h-6 w-48 bg-white/20 rounded-full mb-5 animate-pulse" />
            <div className="h-10 w-72 bg-white/20 rounded-xl mb-3 animate-pulse" />
            <div className="h-6 w-56 bg-white/20 rounded-xl mb-8 animate-pulse" />
            <div className="flex gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-white/20 rounded-xl animate-pulse" />)}
            </div>
          </div>
        </section>
        {/* Cards skeleton */}
        <div className="page-container py-8">
          <div className="h-8 w-44 bg-gray-200 rounded-xl mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-gray-100 rounded-3xl p-4 h-48 animate-pulse flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-gray-200" />
                  <div className="w-16 h-6 rounded-full bg-gray-200" />
                </div>
                <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-200 rounded-lg w-full" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="page-container py-10 relative">
          <p className="text-blue-200 text-sm font-semibold mb-4 tracking-wide">
            תיכון עירוני דוד טוביהו · באר שבע
          </p>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3 max-w-xl">
            מעניקים עזרה,<br />
            <span className="text-sky-300">מגבירים מעורבות</span>
          </h1>
          <p className="text-blue-100 text-base mb-8 max-w-lg">
            ראה/י בקשות עזרה פתוחות, התנדב/י ועשה/י את ההבדל בקהילת בית הספר
          </p>

          {/* סטטיסטיקות */}
          <div className="flex gap-8 flex-wrap">
            {[
              { label: "בקשות פתוחות", value: openCount },
              { label: "עזרות הושלמו", value: doneCount },
              { label: "עוזרים פעילים", value: helpersCount },
              { label: "חברי קהילה", value: allUsers.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-black leading-none">{value}</p>
                <p className="text-xs text-blue-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── בקשות לעזרה ────────────────────────────────────────────────── */}
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-gray-900">בקשות לעזרה</h2>
          <Link href="/helpers" className="text-sm font-bold text-blue-700 hover:text-blue-800">
            עוזרים ←
          </Link>
        </div>

        {/* פילטרים */}
        <div className="mb-6">
          <RequestFilters
            search={search}
            onSearchChange={setSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* רשת הבקשות */}
        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-gray-400 text-lg font-medium mb-2">לא נמצאו בקשות מתאימות</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("הכל"); setSelectedStatus("הכל"); }} className="btn-primary mt-4">
              נקה פילטרים
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4 font-medium">{filtered.length} בקשות</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
