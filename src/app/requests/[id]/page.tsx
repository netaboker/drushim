"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Users,
  HandHelping,
  CheckCircle2,
  MessageSquare,
  Shield,
  UserCheck,
  Calendar,
  ChevronDown,
  ShieldCheck,
  Zap,
  Share2,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-data";
import { MOCK_HELPER_PROFILES } from "@/lib/mock-data/helpers";
import { RequestStatus, ROLE_LABELS } from "@/lib/types";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { isAutoPublishRole } from "@/context/AppDataContext";
import { formatDate, formatRelativeDate } from "@/lib/utils/format";
import clsx from "clsx";

export default function RequestDetailPage() {
  const params = useParams();
  const { currentUser, canModerate } = useAuth();
  const {
    requests,
    volunteerForRequest,
    assignHelper,
    updateRequestStatus,
  } = useAppData();

  const [showAllVolunteers, setShowAllVolunteers] = useState(false);

  const request = requests.find((r) => r.id === params.id);

  if (!request) {
    return (
      <div className="page-container py-16 text-center">
        <p className="text-gray-500 text-lg">הבקשה לא נמצאה</p>
        <Link href="/requests" className="btn-primary mt-4 inline-flex">
          חזרה ללוח
        </Link>
      </div>
    );
  }

  const creator = MOCK_USERS.find((u) => u.id === request.createdById);
  const isStaffRequest = creator ? isAutoPublishRole(creator.id) : false;

  const assignedHelpers = request.assignedHelperIds
    .map((id) => MOCK_USERS.find((u) => u.id === id))
    .filter(Boolean) as typeof MOCK_USERS;

  const volunteers = request.volunteerIds
    .map((id) => {
      const user = MOCK_USERS.find((u) => u.id === id);
      const profile = MOCK_HELPER_PROFILES.find((h) => h.userId === id);
      return user ? { user, profile } : null;
    })
    .filter(Boolean) as { user: (typeof MOCK_USERS)[0]; profile: (typeof MOCK_HELPER_PROFILES)[0] | undefined }[];

  const hasVolunteered = request.volunteerIds.includes(currentUser.id);
  const isAssigned = request.assignedHelperIds.includes(currentUser.id);
  const isCreator = request.createdById === currentUser.id;
  const isOpen = request.status === "פתוח";
  const isFull = request.assignedHelperIds.length >= request.helpersNeeded;

  // Students can volunteer immediately on staff requests — no extra approval needed
  const canVolunteer =
    isOpen &&
    !isCreator &&
    !isFull &&
    request.approvalStatus === "approved" &&
    currentUser.role === "student";

  // Staff can see volunteers on their own requests
  const canSeeVolunteers =
    canModerate || isCreator;

  const fillPercent = Math.round(
    (request.volunteerIds.length / request.helpersNeeded) * 100
  );

  const displayedVolunteers = showAllVolunteers
    ? volunteers
    : volunteers.slice(0, 4);

  function shareOnWhatsApp() {
    const url = `${window.location.origin}/requests/${params.id}`;
    const text = `היי! 👋 ראיתי בלוח טוביהו בקשה שאולי תוכל/י לעזור בה:\n\n*${request?.title}*\n📅 ${request?.when}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <Link
        href="/requests"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowRight size={16} />
        חזרה ללוח הבקשות
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Staff auto-publish banner */}
          {isStaffRequest && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">
                  בקשת צוות — פורסמה אוטומטית
                </p>
                <p className="text-xs text-green-700">
                  בקשות שמגיעות ממורים ואנשי צוות מפורסמות מיידית.
                  תלמידים יכולים להתנדב ישירות ללא צורך באישור נוסף.
                </p>
              </div>
            </div>
          )}

          {/* Title card */}
          <div className="card p-6 relative">
            <div className="flex flex-wrap gap-2 mb-4">
              <CategoryBadge category={request.category} />
              <StatusBadge status={request.status} />
              <UrgencyBadge urgency={request.urgency} />
              {isStaffRequest && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  <ShieldCheck size={11} />
                  בקשת צוות
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight">
              {request.title}
            </h1>
            <p className="text-gray-700 leading-relaxed text-sm mb-4">
              {request.description}
            </p>

            {/* כפתור שיתוף וואטסאפ */}
            <button
              onClick={shareOnWhatsApp}
              title="שתף/י בוואטסאפ"
              className="absolute top-5 left-5 w-9 h-9 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-500">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  מתי צריך
                </p>
                <p className="text-sm font-semibold text-gray-800">{request.when}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Users size={12} />
                  קהל יעד
                </p>
                <p className="text-sm font-semibold text-gray-800">{request.targetAudience}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  פורסם
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatRelativeDate(request.createdAt)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <UserCheck size={12} />
                  איש קשר
                </p>
                <p className="text-sm font-semibold text-gray-800">{request.contactPerson}</p>
              </div>
            </div>
          </div>

          {/* ── Volunteer CTA ───────────────────────────────────────────── */}
          {request.approvalStatus === "approved" && !isCreator && (
            <div
              className={clsx(
                "card p-5 border-2 transition-all",
                hasVolunteered
                  ? "border-green-300 bg-green-50"
                  : isStaffRequest
                  ? "border-green-200 bg-green-50/50"
                  : "border-blue-200"
              )}
            >
              {isAssigned ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-800">הוקצית לבקשה הזו!</p>
                    <p className="text-sm text-blue-600">
                      {creator?.name ?? "יוצר הבקשה"} מחכה לך. תצור/י קשר דרך המערכת.
                    </p>
                  </div>
                </div>
              ) : hasVolunteered ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={22} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-800">נרשמת לעזרה! 🎉</p>
                      <p className="text-sm text-green-700">
                        {isStaffRequest
                          ? `${creator?.name ?? "המורה/ה"} קיבל/ה התראה על ההצטרפות שלך.`
                          : "יוצר הבקשה יאשר אותך בקרוב."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => volunteerForRequest(request.id, currentUser.id)}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium underline flex-shrink-0 transition-colors"
                  >
                    בטל הרשמה
                  </button>
                </div>
              ) : canVolunteer ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        isStaffRequest ? "bg-green-100" : "bg-blue-100"
                      )}
                    >
                      <HandHelping
                        size={22}
                        className={isStaffRequest ? "text-green-600" : "text-blue-600"}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {isStaffRequest ? "התנדבות מיידית!" : "יכול/ה לעזור?"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isStaffRequest ? (
                          <>
                            לחץ/י להירשם —{" "}
                            <span className="text-green-700 font-medium">
                              {creator?.name ?? "המורה"} יקבל/תקבל התראה מיידית
                            </span>
                            {" "}· תרוויח/י{" "}
                            <span className="text-amber-600 font-semibold">+10 נקודות</span>
                          </>
                        ) : (
                          <>
                            לחץ/י להצטרף · תרוויח/י{" "}
                            <span className="text-amber-600 font-semibold">+10 נקודות</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => volunteerForRequest(request.id, currentUser.id)}
                    className={clsx(
                      "flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all flex-shrink-0 shadow-sm",
                      isStaffRequest
                        ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                    )}
                  >
                    <HandHelping size={16} />
                    אני יכול/ה לעזור
                  </button>
                </div>
              ) : isFull ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={22} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-600">הבקשה מלאה</p>
                    <p className="text-sm text-gray-400">
                      כבר יש מספיק מתנדבים — תבדוק/י בקשות אחרות
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Updates */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              עדכונים ופעילות
            </h2>
            {request.updates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                אין עדכונים עדיין
              </p>
            ) : (
              <div className="space-y-4">
                {request.updates.map((upd) => {
                  const author = MOCK_USERS.find((u) => u.id === upd.authorId);
                  return (
                    <div key={upd.id} className="flex gap-3">
                      {author && (
                        <Avatar user={author} size="sm" className="flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {author?.name ?? "לא ידוע"}
                          </p>
                          {upd.isStaffNote && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              הערת צוות
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatRelativeDate(upd.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-2.5 leading-relaxed">
                          {upd.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Volunteer progress */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              מתנדבים
            </h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">
                  {request.volunteerIds.length} נרשמו מתוך {request.helpersNeeded} נדרשים
                </span>
                <span className="font-bold text-blue-600">{fillPercent}%</span>
              </div>
              <ProgressBar
                value={fillPercent}
                color={isStaffRequest ? "bg-green-500" : "bg-blue-500"}
                size="md"
              />
            </div>

            {/* Assigned helpers */}
            {assignedHelpers.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  מוקצים
                </p>
                {assignedHelpers.map((h) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <Avatar user={h} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{h.name}</p>
                      <p className="text-xs text-gray-500">{h.class ?? h.position}</p>
                    </div>
                    {h.id === currentUser.id && (
                      <span className="mr-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        אני
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick volunteer button inside sidebar (mobile-friendly) */}
            {canVolunteer && !hasVolunteered && (
              <button
                onClick={() => volunteerForRequest(request.id, currentUser.id)}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all",
                  isStaffRequest
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <HandHelping size={16} />
                אני יכול/ה לעזור
              </button>
            )}
            {hasVolunteered && (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-sm">
                <CheckCircle2 size={16} />
                נרשמת לעזרה!
              </div>
            )}
          </div>

          {/* Volunteers list — visible to request creator and staff/admin */}
          {canSeeVolunteers && volunteers.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <HandHelping size={16} className="text-green-500" />
                {isStaffRequest ? "נרשמו לעזור" : "מתעניינים"} ({volunteers.length})
              </h3>
              {isStaffRequest && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3">
                  ✓ הרישום אוטומטי — אפשר לאשר עוזרים ישירות
                </p>
              )}
              <div className="space-y-3">
                {displayedVolunteers.map(({ user, profile }) => (
                  <div key={user.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar user={user} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.class ?? user.position}
                          {profile && ` · ${profile.helpCount} עזרות`}
                        </p>
                      </div>
                    </div>
                    {(canModerate || isCreator) && isOpen && (
                      <button
                        onClick={() => assignHelper(request.id, user.id)}
                        className={clsx(
                          "text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex-shrink-0",
                          request.assignedHelperIds.includes(user.id)
                            ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                        )}
                      >
                        {request.assignedHelperIds.includes(user.id) ? "✓ מאושר" : "אשר/י"}
                      </button>
                    )}
                  </div>
                ))}
                {volunteers.length > 4 && (
                  <button
                    onClick={() => setShowAllVolunteers((v) => !v)}
                    className="w-full text-xs text-blue-600 font-medium flex items-center justify-center gap-1 py-1 hover:text-blue-700 transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      className={clsx("transition-transform", showAllVolunteers && "rotate-180")}
                    />
                    {showAllVolunteers
                      ? "הסתר"
                      : `הצג עוד ${volunteers.length - 4}`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Creator */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">פרסם/ה הבקשה</h3>
            {creator && (
              <div className="flex items-center gap-3">
                <Avatar user={creator} size="md" />
                <div>
                  <p className="font-semibold text-gray-900">{creator.name}</p>
                  <p className="text-xs text-gray-500">
                    {creator.class ?? creator.position ?? ROLE_LABELS[creator.role]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin/Staff actions */}
          {canModerate && (
            <div className="card p-5 border-2 border-amber-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Shield size={14} className="text-amber-600" />
                פעולות ניהול
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-2">שנה סטטוס:</p>
              <div className="space-y-1.5">
                {(["פתוח", "בטיפול", "הושלם", "נסגר"] as RequestStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateRequestStatus(request.id, s)}
                    className={clsx(
                      "w-full text-right text-sm px-3 py-2 rounded-xl border transition-colors font-medium",
                      request.status === s
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                    )}
                  >
                    {s === "הושלם" && "✅ "}
                    {s === "נסגר" && "🔴 "}
                    {s === "בטיפול" && "🔵 "}
                    {s === "פתוח" && "🟢 "}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
