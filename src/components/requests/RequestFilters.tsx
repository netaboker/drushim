"use client";

import { RequestCategory, RequestStatus } from "@/lib/types";
import { Search } from "lucide-react";

const CATEGORIES: RequestCategory[] = [
  "לימודי",
  "טכני",
  "חברתי",
  "ארגוני",
  "יצירתי",
  "אירועים בית ספריים",
  "קהילתי",
];

const STATUSES: RequestStatus[] = ["פתוח", "בטיפול", "הושלם", "נסגר"];

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
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש בבקשות..."
          className="input-field pr-9"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">סטטוס:</span>
          {(["הכל", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s as RequestStatus | "הכל")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                selectedStatus === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">קטגוריה:</span>
        <button
          onClick={() => onCategoryChange("הכל")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            selectedCategory === "הכל"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
          }`}
        >
          הכל
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              selectedCategory === c
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
