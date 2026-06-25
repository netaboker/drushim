"use client";

import Link from "next/link";
import { HandHelping, Megaphone, Users, CheckCircle2, Sparkles } from "lucide-react";
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
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
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
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="page-container py-10 relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-5">
            <Sparkles size={16} className="text-yellow-300" />
            קהילת בית הספר טוביהו
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3 max-w-xl">
            מעניקים עזרה,<br />
            <span className="text-yellow-300">מגבירים מעורבות</span>
          </h1>
          <p className="text-indigo-100 text-lg mb-2 max-w-lg font-semibold">
            לוח הדרושים של טוביהו
          </p>
          <p className="text-indigo-200 text-base mb-8 max-w-lg">
            יש בקשה? פרסמ/י. רוצה לתרום? התנדב/י. ביחד עושים את ההבדל. 🤝
          </p>

          {/* סטטיסטיקות */}
          <div className="flex gap-6 flex-wrap">
            {[
              { icon: Megaphone, label: "בקשות פתוחות", value: openCount, color: "text-yellow-300" },
              { icon: CheckCircle2, label: "עזרות הושלמו", value: doneCount, color: "text-green-300" },
              { icon: HandHelping, label: "עוזרים פעילים", value: helpersCount, color: "text-blue-300" },
              { icon: Users, label: "חברי קהילה", value: allUsers.length, color: "text-purple-300" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={20} className={color} />
                <div>
                  <p className="text-2xl font-black leading-none">{value}</p>
                  <p className="text-xs text-indigo-200">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── בקשות לעזרה ────────────────────────────────────────────────── */}
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-gray-900">🙋 בקשות לעזרה</h2>
          <Link href="/helpers" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
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
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">לא נמצאו בקשות מתאימות</p>
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
