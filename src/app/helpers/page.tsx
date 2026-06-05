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

  // Only approved profiles shown to regular users
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
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Users size={30} className="text-green-600" />
            עוזרים ומומחים
          </h1>
          <p className="text-gray-500 mt-1">חברי הקהילה שמוכנים לתת מזמנם ומומחיותם</p>
          <p className="text-sm text-green-600 font-semibold mt-2">
            {visible.filter(p => p.isApproved).length} עוזרים פעילים
          </p>
        </div>
        <Link href="/helpers/join" className="btn-primary flex-shrink-0">
          <Plus size={18} />
          הצטרף/י כעוזר
        </Link>
      </div>

      <div className="card p-5 mb-6 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש/י לפי שם, מיומנות..."
            className="input-field pr-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">תחום:</span>
          <button
            onClick={() => setSelectedCategory("הכל")}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === "הכל" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}
          >הכל</button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === c ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}
            >
              {CATEGORY_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">לא נמצאו עוזרים מתאימים</p>
          <Link href="/helpers/join" className="btn-primary mt-4 inline-flex">הצטרף/י כעוזר/ת</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">מציג {filtered.length} עוזרים</p>
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
