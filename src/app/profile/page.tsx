"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Star, Handshake, ClipboardList, TrendingUp, Award, CalendarDays } from "lucide-react";
import { MOCK_POINTS_EVENTS } from "@/lib/mock-data/helpers";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { RankBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getProgressToNextRank } from "@/lib/utils/ranks";
import { ROLE_LABELS, RANK_ICONS } from "@/lib/types";
import { formatDate, formatRelativeDate } from "@/lib/utils/format";
import RequestCard from "@/components/requests/RequestCard";
import clsx from "clsx";

function ProfileContent() {
  const searchParams = useSearchParams();
  const { currentUser, allUsers, loading } = useAuth();
  const { requests, helperProfiles, volunteerForRequest } = useAppData();

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const viewUserId = searchParams.get("userId") ?? currentUser.id;
  const user = allUsers.find((u) => u.id === viewUserId) ?? currentUser;
  const isSelf = user.id === currentUser.id;

  const progress = getProgressToNextRank(user.points);
  const helperProfile = helperProfiles.find((h) => h.userId === user.id);

  const myRequests = requests.filter((r) => r.createdById === user.id && r.approvalStatus === "approved");
  const helpedRequests = requests.filter(
    (r) => (r.assignedHelperIds.includes(user.id) || r.volunteerIds.includes(user.id)) && r.approvalStatus === "approved"
  );

  const pointsHistory = MOCK_POINTS_EVENTS
    .filter((e) => e.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const MILESTONES = [
    { label: "הצטרפות לקהילה", icon: "🏫", done: true },
    { label: "פרופיל עוזר", icon: "🤝", done: !!helperProfile?.isApproved },
    { label: "עזרה ראשונה", icon: "⭐", done: (helperProfile?.helpCount ?? 0) >= 1 },
    { label: "5 עזרות", icon: "🌟", done: (helperProfile?.helpCount ?? 0) >= 5 },
    { label: "100 נקודות", icon: "💯", done: user.points >= 100 },
    { label: "דרגת תורם/ת", icon: "🏆", done: ["תורם/ת", "מוביל/ה", "מאסטר/ית"].includes(user.rank) },
  ];

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6 text-center">
            <Avatar user={user} size="xl" className="mx-auto mb-4" />
            <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.class ? `כיתה ${user.class}` : user.position ?? ROLE_LABELS[user.role]}
            </p>
            <p className="text-xs text-gray-400 mt-1">{ROLE_LABELS[user.role]}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <RankBadge rank={user.rank} />
            </div>
            <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">{user.points}</p>
                <p className="text-xs text-gray-500">נקודות</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-600">{helperProfile?.helpCount ?? 0}</p>
                <p className="text-xs text-gray-500">עזרות</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600">{myRequests.length}</p>
                <p className="text-xs text-gray-500">בקשות</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              התקדמות בדרגות
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{RANK_ICONS[user.rank]}</span>
              <div>
                <p className="font-bold text-gray-900">{user.rank}</p>
                <p className="text-xs text-gray-500">{user.points} נקודות</p>
              </div>
            </div>
            <ProgressBar value={progress.progress} size="lg" showLabel />
            {progress.next ? (
              <p className="text-xs text-gray-500 mt-2 text-center">
                עוד <span className="font-bold text-amber-600">{progress.pointsToNext}</span> נקודות לדרגת{" "}
                <span className="font-bold">{progress.next}</span>
              </p>
            ) : (
              <p className="text-xs text-green-600 font-semibold text-center mt-2">👑 דרגה מקסימלית!</p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={16} className="text-purple-500" />
              אבני דרך
            </h3>
            <div className="space-y-2.5">
              {MILESTONES.map((m) => (
                <div key={m.label} className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl", m.done ? "bg-green-50" : "bg-gray-50")}>
                  <span className={clsx("text-lg", !m.done && "grayscale opacity-40")}>{m.icon}</span>
                  <p className={clsx("text-sm font-medium", m.done ? "text-green-800" : "text-gray-400")}>{m.label}</p>
                  {m.done && <span className="mr-auto text-xs text-green-600 font-bold">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {helperProfile ? (
            <div className="card p-5 border-2 border-green-200 bg-green-50">
              <p className="font-bold text-green-800 flex items-center gap-2 mb-2">
                <Handshake size={16} />
                עוזר/ת רשומ/ה
                {helperProfile.approvalStatus === "pending" && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏳ ממתין לאישור</span>
                )}
              </p>
              <p className="text-xs text-green-700">{helperProfile.skills.slice(0, 3).join(", ")}</p>
            </div>
          ) : isSelf ? (
            <div className="card p-5 border-2 border-dashed border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-3">עדיין לא נרשמת כעוזר/ת</p>
              <Link href="/helpers/join" className="btn-primary text-sm">הצטרף/י כעוזר</Link>
            </div>
          ) : null}
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Star size={18} className="text-amber-500" />
              היסטוריית נקודות
            </h2>
            {pointsHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">עדיין אין נקודות. התחל/י לעזור!</p>
            ) : (
              <div className="space-y-3">
                {pointsHistory.map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        {event.eventType === "complete" && "✅"}
                        {event.eventType === "volunteer" && "🤝"}
                        {event.eventType === "feedback_received" && "💬"}
                        {event.eventType === "publish_request" && "📢"}
                        {event.eventType === "profile_approved" && "👍"}
                        {event.eventType === "streak" && "🔥"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{event.reason}</p>
                        <p className="text-xs text-gray-400">{formatRelativeDate(event.createdAt)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600 flex-shrink-0">+{event.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {myRequests.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <ClipboardList size={18} className="text-blue-500" />
                הבקשות שלי
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myRequests.map((r) => (
                  <RequestCard key={r.id} request={r} compact
                    onVolunteer={(id) => volunteerForRequest(id, currentUser.id)} />
                ))}
              </div>
            </div>
          )}

          {helpedRequests.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <Handshake size={18} className="text-green-500" />
                עזרתי בהן ({helpedRequests.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {helpedRequests.map((r) => (
                  <RequestCard key={r.id} request={r} compact
                    onVolunteer={(id) => volunteerForRequest(id, currentUser.id)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <CalendarDays size={13} />
            חבר/ת הקהילה מאז {formatDate(user.joinedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
