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

const selectClass = "h-11 px-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer flex-shrink-0";

export default function RequestFilters({
  search, onSearchChange, selectedCategory, onCategoryChange, selectedStatus, onStatusChange,
}: RequestFiltersProps) {
  const activeFilters = (selectedCategory !== "הכל" ? 1 : 0) + (selectedStatus !== "הכל" ? 1 : 0);

  return (
    <div className="flex gap-2 items-center">
      {/* חיפוש */}
      <div className="relative flex-1">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש..."
          className="w-full h-11 pr-9 pl-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* סטטוס */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value as RequestStatus | "הכל")}
        className={selectClass}
      >
        <option value="הכל">כל הסטטוסים</option>
        <option value="פתוח">פתוח</option>
        <option value="בטיפול">בטיפול</option>
        <option value="הושלם">הושלם</option>
      </select>

      {/* קטגוריה */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as RequestCategory | "הכל")}
        className={selectClass}
      >
        <option value="הכל">כל התחומים</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
        ))}
      </select>

      {/* כפתור ניקוי — רק אם יש פילטר פעיל */}
      {activeFilters > 0 && (
        <button
          onClick={() => { onCategoryChange("הכל"); onStatusChange("הכל"); }}
          className="h-11 px-3 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 flex-shrink-0 transition-colors"
        >
          נקה ({activeFilters})
        </button>
      )}
    </div>
  );
}
