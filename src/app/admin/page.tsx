"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ClipboardList,
  Users,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  BarChart3,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import {
  CategoryBadge,
  StatusBadge,
  UrgencyBadge,
  RankBadge,
} from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils/format";
import { ROLE_LABELS, HelpRequest } from "@/lib/types";
import clsx from "clsx";

type AdminTab = "queue" | "requests" | "helpers" | "users" | "stats";

// ─── Approval Modal ───────────────────────────────────────────────────────────

function ApprovalModal({
  title,
  onApprove,
  onReject,
  onClose,
}: {
  title: string;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);

  function handleConfirm() {
    if (!mode) return;
    if (mode === "reject" && !note.trim()) return;
    if (mode === "approve") onApprove(note.trim());
    else onReject(note.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {mode === "approve" ? "✅ אישור פרסום" : mode === "reject" ? "❌ דחיית פרסום" : "פעולת ניהול"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{title}</p>
        </div>

        <div className="p-6 space-y-4">
          {!mode ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("approve")}
                className="flex flex-col items-center gap-2 p-5 border-2 border-green-200 rounded-2xl hover:bg-green-50 hover:border-green-400 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check size={24} className="text-green-600" />
                </div>
                <span className="font-bold text-green-700 text-sm">אשר/י לפרסום</span>
                <span className="text-xs text-green-500 text-center">הפריט יפורסם ללוח והמשתמש יקבל התראה</span>
              </button>
              <button
                onClick={() => setMode("reject")}
                className="flex flex-col items-center gap-2 p-5 border-2 border-red-200 rounded-2xl hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <X size={24} className="text-red-600" />
                </div>
                <span className="font-bold text-red-700 text-sm">דחה/י</span>
                <span className="text-xs text-red-400 text-center">המשתמש יקבל הודעה עם הסיבה</span>
              </button>
            </div>
          ) : (
            <>
              <div className={clsx(
                "flex items-center gap-2 p-3 rounded-xl text-sm font-semibold",
                mode === "approve" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {mode === "approve" ? <Check size={16} /> : <X size={16} />}
                {mode === "approve" ? "אישור פרסום" : "דחיית פרסום"}
              </div>

              <div>
                <label className="label">
                  {mode === "approve" ? "הערה למשתמש (אופציונלי)" : "סיבת הדחייה"}
                  {mode === "reject" && <span className="text-red-500 mr-1">*</span>}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    mode === "approve"
                      ? "הוסף/י הערה עידוד אופציונלית..."
                      : "הסבר/י בצורה ברורה ומכבדת מדוע לא ניתן לאשר..."
                  }
                  className="textarea-field h-24"
                  autoFocus
                />
                {mode === "reject" && !note.trim() && (
                  <p className="text-xs text-red-500 mt-1">
                    חובה להזין סיבת דחייה — המשתמש יראה הודעה זו.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={mode === "reject" && !note.trim()}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors",
                    mode === "approve"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700",
                    mode === "reject" && !note.trim() && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {mode === "approve" ? <><Check size={16} /> אשר ושלח התראה</> : <><X size={16} /> דחה ושלח הודעה</>}
                </button>
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  חזרה
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { currentUser, allUsers, canModerate, isAdmin } = useAuth();
  const {
    requests,
    helperProfiles,
    pendingRequests,
    pendingHelpers,
    approveRequest,
    rejectRequest,
    approveHelper,
    rejectHelper,
    updateRequestStatus,
  } = useAppData();

  const [tab, setTab] = useState<AdminTab>("queue");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<{
    id: string;
    title: string;
    type: "request" | "helper";
  } | null>(null);

  if (!canModerate) {
    return (
      <div className="page-container py-20 text-center">
        <Shield size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">אין גישה</h1>
        <p className="text-gray-500">פאנל הניהול מיועד לצוות ומנהלי מערכת בלבד.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">חזרה לבית</Link>
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "queue", label: "תור אישורים", icon: <Clock size={16} />, badge: pendingRequests.length + pendingHelpers.length },
    { id: "requests", label: "כל הבקשות", icon: <ClipboardList size={16} /> },
    { id: "helpers", label: "כל העוזרים", icon: <Users size={16} /> },
    { id: "users", label: "משתמשים", icon: <UserCog size={16} /> },
    { id: "stats", label: "סטטיסטיקות", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">פאנל ניהול</h1>
          <p className="text-gray-500 text-sm">שלום {currentUser?.name} — ניהול ובקרה של לוח טוביהו</p>
        </div>
        {isAdmin && (
          <span className="mr-auto text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">
            👑 מנהל מערכת ראשי
          </span>
        )}
      </div>

      {/* Admin note */}
      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
          <strong>מנחם הרצוג</strong> — רק אתה מורשה לאשר ולדחות בקשות ופרופילי עוזרים.
          כשתאשר או תדחה, המשתמש הרלוונטי יקבל התראה מידית עם הנימוק שלך.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "ממתינות לאישור", value: pendingRequests.length + pendingHelpers.length, color: "text-red-600", bg: "bg-red-50", urgent: true },
          { label: "בקשות פעילות", value: requests.filter(r => r.status === "פתוח" || r.status === "בטיפול").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "עזרות הושלמו", value: requests.filter(r => r.status === "הושלם").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "עוזרים פעילים", value: helperProfiles.filter(h => h.isApproved).length, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, color, bg, urgent }) => (
          <div key={label} className={clsx("card p-4 flex items-center gap-3", urgent && value > 0 && "border-2 border-red-300")}>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
              <span className={clsx("text-xl font-black", color)}>{value}</span>
            </div>
            <p className="text-xs font-semibold text-gray-600 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0",
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── APPROVAL QUEUE ─────────────────────────────────────────────────── */}
      {tab === "queue" && (
        <div className="space-y-6">
          {pendingRequests.length === 0 && pendingHelpers.length === 0 ? (
            <div className="card p-14 text-center">
              <Check size={52} className="text-green-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-600">אין פריטים הממתינים לאישור</p>
              <p className="text-gray-400 text-sm mt-1">כל הבקשות והפרופילים טופלו. עבודה מצוינת!</p>
            </div>
          ) : (
            <>
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <section>
                  <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <ClipboardList size={20} className="text-blue-500" />
                    בקשות ממתינות ({pendingRequests.length})
                  </h2>
                  <div className="space-y-3">
                    {pendingRequests.map((req) => {
                      const creator = allUsers.find(u => u.id === req.createdById);
                      const isExpanded = expandedId === req.id;
                      return (
                        <div key={req.id} className="card border-2 border-amber-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="badge bg-amber-100 text-amber-700 border-amber-200">⏳ ממתין לאישורך</span>
                                  <CategoryBadge category={req.category} />
                                  <UrgencyBadge urgency={req.urgency} />
                                </div>
                                <h3 className="font-bold text-gray-900 text-base">{req.title}</h3>
                                {creator && (
                                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                                    <Avatar user={creator} size="sm" />
                                    <span>{creator.name} · {ROLE_LABELS[creator.role]} · {formatRelativeDate(req.createdAt)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {isAdmin ? (
                                  <button
                                    onClick={() => setModalItem({ id: req.id, title: req.title, type: "request" })}
                                    className="btn-primary text-sm py-2 px-4"
                                  >
                                    <MessageSquare size={14} />
                                    החלט/י
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    ממתין למנחם
                                  </span>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-amber-100 space-y-3 animate-fade-in">
                                <p className="text-sm text-gray-700 bg-amber-50 rounded-xl px-4 py-3 leading-relaxed">
                                  {req.description}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                  <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-xs text-gray-400 mb-0.5">קהל יעד</p>
                                    <p className="font-semibold text-gray-800">{req.targetAudience}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-xs text-gray-400 mb-0.5">מתי</p>
                                    <p className="font-semibold text-gray-800">{req.when}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-xs text-gray-400 mb-0.5">עוזרים נדרשים</p>
                                    <p className="font-semibold text-gray-800">{req.helpersNeeded}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-xs text-gray-400 mb-0.5">איש קשר</p>
                                    <p className="font-semibold text-gray-800">{req.contactPerson}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Pending helpers */}
              {pendingHelpers.length > 0 && (
                <section>
                  <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <Users size={20} className="text-green-500" />
                    פרופילי עוזרים ממתינים ({pendingHelpers.length})
                  </h2>
                  <div className="space-y-3">
                    {pendingHelpers.map((profile) => {
                      const user = allUsers.find(u => u.id === profile.userId);
                      const isExpanded = expandedId === profile.id;
                      if (!user) return null;
                      return (
                        <div key={profile.id} className="card border-2 border-green-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar user={user} size="lg" />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                                    <span className="badge bg-amber-100 text-amber-700 border-amber-200">⏳ ממתין לאישורך</span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {user.class ?? user.position} · {ROLE_LABELS[user.role]} · {formatRelativeDate(profile.submittedAt)}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {profile.categories.map(c => <CategoryBadge key={c} category={c} />)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {isAdmin ? (
                                  <button
                                    onClick={() => setModalItem({ id: profile.id, title: `פרופיל עוזר של ${user.name}`, type: "helper" })}
                                    className="btn-primary text-sm py-2 px-4"
                                  >
                                    <MessageSquare size={14} />
                                    החלט/י
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                                    ממתין למנחם
                                  </span>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-green-100 space-y-3 animate-fade-in">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-1">אודות</p>
                                  <p className="text-sm text-gray-700 bg-green-50 rounded-xl px-4 py-3 leading-relaxed">{profile.bio}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-1.5">מיומנויות</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {profile.skills.map(s => (
                                      <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 mb-1">זמינות</p>
                                  <p className="text-sm text-gray-700">{profile.availability}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ALL REQUESTS ────────────────────────────────────────────────────── */}
      {tab === "requests" && (
        <div className="space-y-2.5">
          <div className="flex gap-3 flex-wrap text-sm text-gray-600 mb-3 font-medium">
            <span>סה״כ: <strong>{requests.length}</strong></span>
            <span className="text-green-600">✅ אושרו: {requests.filter(r => r.approvalStatus === "approved").length}</span>
            <span className="text-amber-600">⏳ ממתינות: {pendingRequests.length}</span>
            <span className="text-red-600">❌ נדחו: {requests.filter(r => r.approvalStatus === "rejected").length}</span>
          </div>
          {requests.map((req) => {
            const creator = allUsers.find(u => u.id === req.createdById);
            return (
              <div
                key={req.id}
                className={clsx(
                  "card p-4 flex items-center justify-between gap-3",
                  req.approvalStatus === "pending" && "border-amber-200 bg-amber-50/40",
                  req.approvalStatus === "rejected" && "border-red-200 bg-red-50/30"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <CategoryBadge category={req.category} />
                    <StatusBadge status={req.status} />
                    {req.approvalStatus === "pending" && <span className="badge bg-amber-100 text-amber-700 border-amber-200 text-xs">⏳ ממתין</span>}
                    {req.approvalStatus === "rejected" && <span className="badge bg-red-100 text-red-700 border-red-200 text-xs">❌ נדחה</span>}
                  </div>
                  <p className="font-semibold text-gray-900 line-clamp-1">{req.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {creator?.name} · {formatRelativeDate(req.createdAt)}
                    {req.adminNote && <span className="text-blue-600"> · הערה: {req.adminNote}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isAdmin && req.approvalStatus === "pending" && (
                    <button
                      onClick={() => setModalItem({ id: req.id, title: req.title, type: "request" })}
                      className="btn-primary text-xs py-1.5 px-3"
                    >החלט/י</button>
                  )}
                  {isAdmin && req.approvalStatus === "approved" && (
                    <select
                      value={req.status}
                      onChange={(e) => updateRequestStatus(req.id, e.target.value as HelpRequest["status"])}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      {(["פתוח","בטיפול","הושלם","נסגר"] as HelpRequest["status"][]).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  <Link href={`/requests/${req.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="צפה">
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ALL HELPERS ─────────────────────────────────────────────────────── */}
      {tab === "helpers" && (
        <div className="space-y-2.5">
          <div className="flex gap-3 flex-wrap text-sm text-gray-600 mb-3 font-medium">
            <span>סה״כ: <strong>{helperProfiles.length}</strong></span>
            <span className="text-green-600">✅ מאושרים: {helperProfiles.filter(h => h.isApproved).length}</span>
            <span className="text-amber-600">⏳ ממתינים: {pendingHelpers.length}</span>
          </div>
          {helperProfiles.map((profile) => {
            const user = allUsers.find(u => u.id === profile.userId);
            if (!user) return null;
            return (
              <div
                key={profile.id}
                className={clsx(
                  "card p-4 flex items-center justify-between gap-3",
                  profile.approvalStatus === "pending" && "border-amber-200 bg-amber-50/40",
                  profile.approvalStatus === "rejected" && "border-red-200 bg-red-50/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar user={user} size="md" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      {profile.approvalStatus === "approved" && <span className="badge bg-green-100 text-green-700 border-green-200 text-xs">✅ מאושר</span>}
                      {profile.approvalStatus === "pending" && <span className="badge bg-amber-100 text-amber-700 border-amber-200 text-xs">⏳ ממתין</span>}
                      {profile.approvalStatus === "rejected" && <span className="badge bg-red-100 text-red-700 border-red-200 text-xs">❌ נדחה</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.class ?? user.position} · {profile.helpCount} עזרות · {formatRelativeDate(profile.submittedAt)}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {profile.categories.map(c => <CategoryBadge key={c} category={c} />)}
                    </div>
                  </div>
                </div>
                {isAdmin && profile.approvalStatus === "pending" && (
                  <button
                    onClick={() => setModalItem({ id: profile.id, title: `פרופיל עוזר של ${user.name}`, type: "helper" })}
                    className="btn-primary text-xs py-1.5 px-3 flex-shrink-0"
                  >החלט/י</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── USERS ───────────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div className="space-y-2.5">
          {allUsers.map((user) => (
            <div key={user.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <RankBadge rank={user.rank} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ROLE_LABELS[user.role]} · {user.class ?? user.position ?? ""} · {user.points} נקודות
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx("text-xs px-2.5 py-1 rounded-full font-semibold", user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                  {user.isActive ? "פעיל/ה" : "לא פעיל/ה"}
                </span>
                <Link href={`/profile?userId=${user.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <Eye size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      {tab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "סה״כ בקשות", value: requests.length, icon: "📋" },
            { label: "בקשות אושרו", value: requests.filter(r => r.approvalStatus === "approved").length, icon: "✅" },
            { label: "בקשות ממתינות", value: pendingRequests.length, icon: "⏳" },
            { label: "בקשות נדחו", value: requests.filter(r => r.approvalStatus === "rejected").length, icon: "❌" },
            { label: "עזרות הושלמו", value: requests.filter(r => r.status === "הושלם").length, icon: "🏁" },
            { label: "עוזרים רשומים", value: helperProfiles.length, icon: "🤝" },
            { label: "עוזרים מאושרים", value: helperProfiles.filter(h => h.isApproved).length, icon: "⭐" },
            { label: "חברי קהילה", value: allUsers.length, icon: "👥" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <span className="text-4xl">{icon}</span>
              <div>
                <p className="text-3xl font-black text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Approval Modal ───────────────────────────────────────────────────── */}
      {modalItem && (
        <ApprovalModal
          title={modalItem.title}
          onApprove={(note) => {
            if (modalItem.type === "request") approveRequest(modalItem.id, note);
            else approveHelper(modalItem.id, note);
          }}
          onReject={(note) => {
            if (modalItem.type === "request") rejectRequest(modalItem.id, note);
            else rejectHelper(modalItem.id, note);
          }}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
