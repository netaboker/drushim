"use client";

import { RequestCategory, RequestStatus, CATEGORY_ICONS } from "@/lib/types";
import { Search } from "lucide-react";

const CATEGORIES: RequestCategory[] = [
  "לימודי", "טכני", "חברתי", "ארגוני", "יצירתי", "אירועים בית ספריים", "קהילתי",
];

interface RequestFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedCategory: RequestCategory | "הכל";
  onCategoryChange: (v: RequestCategory | "הכל") => void;
  selectedStatus: RequestStatus | "הכל";
  onStatusChange: (v: RequestStatus | "הכל") => void;
}

export default function RequestFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
}: RequestFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* חיפוש */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 חפש/י בקשה..."
          className="w-full h-11 pr-9 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
        />
      </div>

      {/* סטטוס — שורה אחת */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["הכל", "פתוח", "בטיפול", "הושלם"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s as RequestStatus | "הכל")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedStatus === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "הכל" ? "🌟 הכל" : s === "פתוח" ? "🟢 פתוח" : s === "בטיפול" ? "🔵 בטיפול" : "✅ הושלם"}
          </button>
        ))}
      </div>

      {/* קטגוריות — גלילה אופקית */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCategoryChange("הכל")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "הכל"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          הכל
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === c
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{CATEGORY_ICONS[c]}</span>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
