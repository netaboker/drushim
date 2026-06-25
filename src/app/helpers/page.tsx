"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Search } from "lucide-react";
import { RequestCategory, CATEGORY_ICONS } from "@/lib/types";
import HelperCard from "@/components/helpers/HelperCard";
import { MOCK_USERS } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

const CATEGORIES: RequestCategory[] = [
  "לימודי", "טכני", "חברתי", "ארגוני", "יצירתי", "אירועים בית ספריים", "קהילתי",
];

export default function HelpersPage() {
  const { canModerate } = useAuth();
  const { helperProfiles } = useAppData();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | "הכל">("הכל");

  const visible = helperProfiles.filter((p) => canModerate || p.isApproved);

  const filtered = visible.filter((profile) => {
    const user = MOCK_USERS.find((u) => u.id === profile.userId);
    if (!user) return false;
    const matchesSearch =
      !search ||
      user.name.includes(search) ||
      profile.skills.some((s) => s.includes(search)) ||
      profile.bio.includes(search);
    const matchesCat = selectedCategory === "הכל" || profile.categories.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">מומחים</h1>
          <p className="text-gray-500 mt-1">תלמידים יוזמים שהציעו את הידע והזמן שלהם לקהילה</p>
          <p className="text-sm text-blue-700 font-semibold mt-2">
            {visible.filter(p => p.isApproved).length} מומחים פעילים
          </p>
        </div>
        <Link href="/helpers/join" className="btn-primary flex-shrink-0">
          <Plus size={18} />
          הצטרף/י כמומחה
        </Link>
      </div>

      <div className="flex gap-2 items-center mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, תחום מומחיות..."
            className="w-full h-11 pr-9 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as RequestCategory | "הכל")}
          className="h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer flex-shrink-0"
        >
          <option value="הכל">כל התחומים</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-1">טרם נמצאו מומחים בתחום זה</p>
          <p className="text-gray-400 text-sm mb-4">היה/י הראשון/ה לקחת יוזמה!</p>
          <Link href="/helpers/join" className="btn-primary inline-flex">הצטרף/י כמומחה</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} מומחים</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((profile) => {
              const user = MOCK_USERS.find((u) => u.id === profile.userId);
              if (!user) return null;
              return <HelperCard key={profile.id} profile={profile} user={user} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
