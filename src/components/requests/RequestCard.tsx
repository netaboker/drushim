"use client";

import Link from "next/link";
import { Clock, Users, HandHelping, CheckCircle2, ShieldCheck } from "lucide-react";
import { HelpRequest, ROLE_LABELS } from "@/lib/types";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "@/components/ui/Badge";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils/format";
import { isAutoPublishRole } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

interface RequestCardProps {
  request: HelpRequest;
  onVolunteer?: (id: string) => void;
  compact?: boolean;
}

export default function RequestCard({ request, onVolunteer, compact = false }: RequestCardProps) {
  const { currentUser } = useAuth();
  const creator = MOCK_USERS.find((u) => u.id === request.createdById);

  const hasVolunteered = request.volunteerIds.includes(currentUser.id);
  const isAssigned = request.assignedHelperIds.includes(currentUser.id);
  const isCreator = request.createdById === currentUser.id;
  const isOpen = request.status === "פתוח";
  const isFull = request.assignedHelperIds.length >= request.helpersNeeded;
  const isStaffRequest = creator ? isAutoPublishRole(creator.id) : false;

  // Students can volunteer on any approved open request (no extra approval needed for staff requests)
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
      <div
        className={clsx(
          "card p-5 flex flex-col gap-3 h-full transition-all duration-200",
          "group-hover:shadow-md",
          isStaffRequest
            ? "group-hover:border-green-200"
            : "group-hover:border-blue-200",
          isStaffRequest && "border-green-100"
        )}
      >
        {/* Top row: category + status + staff badge */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={request.category} />
            {isStaffRequest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <ShieldCheck size={11} />
                צוות
              </span>
            )}
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Title */}
        <h3
          className={clsx(
            "font-bold text-gray-900 text-base leading-snug line-clamp-2 transition-colors",
            isStaffRequest
              ? "group-hover:text-green-700"
              : "group-hover:text-blue-700"
          )}
        >
          {request.title}
        </h3>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {request.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {request.when}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {request.volunteerIds.length}/{request.helpersNeeded} נרשמו
          </span>
          <UrgencyBadge urgency={request.urgency} />
        </div>

        {/* Target audience */}
        {!compact && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
            מיועד ל:{" "}
            <span className="font-medium text-gray-700">{request.targetAudience}</span>
          </div>
        )}

        {/* Staff auto-publish notice */}
        {isStaffRequest && !compact && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
            <ShieldCheck size={12} />
            פורסם על ידי{" "}
            {creator ? `${creator.name} (${ROLE_LABELS[creator.role]})` : "צוות"}{" "}
            · ניתן להתנדב מיידית
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-100">
          {/* Creator avatar + time */}
          <div className="flex items-center gap-1.5 min-w-0">
            {creator && (
              <>
                <div
                  className={clsx(
                    "w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0",
                    creator.avatarColor
                  )}
                >
                  {creator.avatarInitials[0]}
                </div>
                <span className="text-xs text-gray-500 truncate">
                  {creator.name} · {formatRelativeDate(request.createdAt)}
                </span>
              </>
            )}
          </div>

          {/* Volunteer button — main action */}
          {request.status === "הושלם" ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-semibold flex-shrink-0">
              <CheckCircle2 size={13} />
              הושלם
            </span>
          ) : isAssigned ? (
            <span className="flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg flex-shrink-0">
              <CheckCircle2 size={13} />
              מוקצה
            </span>
          ) : hasVolunteered ? (
            <button
              onClick={handleVolunteer}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
              title="לחץ/י לביטול"
            >
              <CheckCircle2 size={13} />
              נרשמת לעזרה ✓
            </button>
          ) : canVolunteer ? (
            <button
              onClick={handleVolunteer}
              className={clsx(
                "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0",
                isStaffRequest
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
            >
              <HandHelping size={13} />
              אני יכול/ה לעזור
            </button>
          ) : isFull && isOpen ? (
            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
              מלא
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
