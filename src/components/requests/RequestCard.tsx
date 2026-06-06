"use client";

import Link from "next/link";
import { Clock, Users, HandHelping, CheckCircle2 } from "lucide-react";
import { HelpRequest } from "@/lib/types";
import { CategoryBadge, UrgencyBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

interface RequestCardProps {
  request: HelpRequest;
  onVolunteer?: (id: string) => void;
  compact?: boolean;
}

export default function RequestCard({ request, onVolunteer, compact = false }: RequestCardProps) {
  const { currentUser } = useAuth();

  const hasVolunteered = request.volunteerIds.includes(currentUser.id);
  const isAssigned = request.assignedHelperIds.includes(currentUser.id);
  const isCreator = request.createdById === currentUser.id;
  const isOpen = request.status === "פתוח";
  const isFull = request.assignedHelperIds.length >= request.helpersNeeded;
  const isDone = request.status === "הושלם";

  const canVolunteer =
    isOpen &&
    !isCreator &&
    !isFull &&
    request.approvalStatus === "approved" &&
    currentUser.role === "student";

  function handleVolunteer(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onVolunteer?.(request.id);
  }

  return (
    <Link href={`/requests/${request.id}`} className="block group">
      <div className={clsx(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 h-full transition-all duration-200",
        "group-hover:shadow-md group-hover:border-blue-100",
        isDone && "opacity-70"
      )}>

        {/* קטגוריה + דחיפות */}
        <div className="flex items-center justify-between">
          <CategoryBadge category={request.category} />
          <UrgencyBadge urgency={request.urgency} />
        </div>

        {/* כותרת */}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {request.title}
        </h3>

        {/* תיאור קצר */}
        {!compact && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {request.description}
          </p>
        )}

        {/* מידע קצר */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {request.when}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {request.volunteerIds.length}/{request.helpersNeeded}
          </span>
        </div>

        {/* אינדיקטור סטטוס */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          {isDone ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle2 size={13} />
              הושלם 🎉
            </div>
          ) : isAssigned ? (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
              <CheckCircle2 size={13} />
              את/ה בצוות ✓
            </div>
          ) : hasVolunteered ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <CheckCircle2 size={13} />
              נרשמת לעזרה ✓
            </div>
          ) : isOpen && !isFull ? (
            <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <HandHelping size={13} />
              לחץ/י לפרטים והתנדבות
            </div>
          ) : isFull ? (
            <div className="text-xs text-gray-400">מלא</div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
