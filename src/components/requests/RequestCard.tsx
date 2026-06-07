"use client";

import Link from "next/link";
import { Clock, Users, HandHelping, CheckCircle2 } from "lucide-react";
import { HelpRequest, CATEGORY_ICONS } from "@/lib/types";
import { UrgencyBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

// צבעי רקע לפי קטגוריה
const CATEGORY_COLORS: Record<string, string> = {
  "לימודי":               "from-blue-50 to-blue-100 border-blue-200",
  "טכני":                 "from-gray-50 to-slate-100 border-slate-200",
  "חברתי":               "from-pink-50 to-rose-100 border-rose-200",
  "ארגוני":              "from-orange-50 to-amber-100 border-amber-200",
  "יצירתי":             "from-purple-50 to-violet-100 border-violet-200",
  "אירועים בית ספריים": "from-yellow-50 to-yellow-100 border-yellow-300",
  "קהילתי":             "from-green-50 to-emerald-100 border-emerald-200",
};

const CATEGORY_ICON_BG: Record<string, string> = {
  "לימודי":               "bg-blue-500",
  "טכני":                 "bg-slate-500",
  "חברתי":               "bg-rose-500",
  "ארגוני":              "bg-amber-500",
  "יצירתי":             "bg-violet-500",
  "אירועים בית ספריים": "bg-yellow-500",
  "קהילתי":             "bg-emerald-500",
};

interface RequestCardProps {
  request: HelpRequest;
  compact?: boolean;
}

export default function RequestCard({ request, compact = false }: RequestCardProps) {
  const { currentUser } = useAuth();

  const hasVolunteered = request.volunteerIds.includes(currentUser.id);
  const isAssigned = request.assignedHelperIds.includes(currentUser.id);
  const isOpen = request.status === "פתוח";
  const isFull = request.assignedHelperIds.length >= request.helpersNeeded;
  const isDone = request.status === "הושלם";

  const gradientClass = CATEGORY_COLORS[request.category] ?? "from-gray-50 to-gray-100 border-gray-200";
  const iconBgClass = CATEGORY_ICON_BG[request.category] ?? "bg-gray-500";
  const emoji = CATEGORY_ICONS[request.category] ?? "📌";

  return (
    <Link href={`/requests/${request.id}`} className="block group">
      <div className={clsx(
        "bg-gradient-to-br rounded-3xl border-2 p-4 flex flex-col gap-3 h-full transition-all duration-200",
        "group-hover:shadow-xl group-hover:-translate-y-0.5",
        gradientClass,
        isDone && "opacity-60"
      )}>

        {/* אייקון קטגוריה + דחיפות */}
        <div className="flex items-center justify-between">
          <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm", iconBgClass)}>
            {emoji}
          </div>
          <UrgencyBadge urgency={request.urgency} />
        </div>

        {/* כותרת */}
        <h3 className="font-black text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {request.title}
        </h3>

        {/* תיאור קצר */}
        {!compact && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {request.description}
          </p>
        )}

        {/* מידע */}
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {request.when}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {request.volunteerIds.length}/{request.helpersNeeded} נרשמו
          </span>
        </div>

        {/* שכבות */}
        {request.targetGrades && request.targetGrades.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {request.targetGrades.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-white/70 text-indigo-700 text-xs font-bold border border-indigo-200">
                שכבה {g}
              </span>
            ))}
          </div>
        )}

        {/* סטטוס */}
        <div className="mt-auto pt-3 border-t border-white/60">
          {isDone ? (
            <div className="flex items-center gap-1.5 text-sm text-green-700 font-bold">
              <CheckCircle2 size={15} />
              הושלם 🎉
            </div>
          ) : isAssigned ? (
            <div className="flex items-center gap-1.5 text-sm text-blue-700 font-bold">
              <CheckCircle2 size={15} />
              את/ה בצוות ✓
            </div>
          ) : hasVolunteered ? (
            <div className="flex items-center gap-1.5 text-sm text-green-700 font-bold">
              <CheckCircle2 size={15} />
              נרשמת לעזרה ✓
            </div>
          ) : isOpen && !isFull ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-600 font-bold flex items-center gap-1">
                <HandHelping size={15} />
                לחץ/י לפרטים
              </span>
              <span className="text-xs bg-white/70 px-2 py-1 rounded-full text-gray-600 font-medium">
                להתנדבות →
              </span>
            </div>
          ) : isFull ? (
            <div className="text-sm text-gray-500 font-medium">מלא 🔒</div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
