"use client";

import Link from "next/link";
import { Star, Trophy, TrendingUp, Crown } from "lucide-react";
import { MOCK_POINTS_EVENTS } from "@/lib/mock-data/helpers";
import { useAuth } from "@/context/AuthContext";
import { RankBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getProgressToNextRank } from "@/lib/utils/ranks";
import { RANK_ORDER, RANK_THRESHOLDS, RANK_ICONS, POINT_EVENT_LABELS } from "@/lib/types";
import clsx from "clsx";

const POINT_VALS: Record<string, number> = {
  volunteer: 10, complete: 30, feedback_received: 20,
  streak: 15, publish_request: 5, profile_approved: 25,
};

export default function RankingsPage() {
  const { currentUser, allUsers, loading } = useAuth();

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedUsers = [...allUsers].sort((a, b) => b.points - a.points);
  const myRank = sortedUsers.findIndex((u) => u.id === currentUser.id) + 1;
  const progress = getProgressToNextRank(currentUser.points);
  const recentEvents = [...MOCK_POINTS_EVENTS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
          <Trophy size={24} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">דרגות וניקוד</h1>
          <p className="text-gray-500 mt-1">מי תורם הכי הרבה לקהילת טוביהו?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My rank banner */}
          <div className="bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <p className="text-blue-200 text-sm font-medium mb-3">הדרגה שלך</p>
            <div className="flex items-center gap-4">
              <Avatar user={currentUser} size="xl" className="border-2 border-white/30" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{RANK_ICONS[currentUser.rank]}</span>
                  <span className="text-2xl font-black">{currentUser.rank}</span>
                </div>
                <p className="text-blue-100 text-sm">{currentUser.points} נקודות</p>
              </div>
              <div className="text-left">
                <p className="text-4xl font-black">#{myRank}</p>
                <p className="text-blue-200 text-xs">במדרגה</p>
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar
                value={progress.progress}
                color="bg-white/70"
                size="md"
                label={
                  progress.next
                    ? `${progress.pointsToNext} נקודות לדרגת ${progress.next}`
                    : "דרגה מקסימלית!"
                }
              />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Crown size={18} className="text-amber-500" />
              <h2 className="font-bold text-gray-900">לוח המובילים</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {sortedUsers.map((user, idx) => {
                const isMe = user.id === currentUser.id;
                const pos = idx + 1;
                const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                return (
                  <Link
                    key={user.id}
                    href={`/profile?userId=${user.id}`}
                    className={clsx(
                      "flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors",
                      isMe && "bg-blue-50 hover:bg-blue-50"
                    )}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {medals[pos] ? (
                        <span className="text-xl">{medals[pos]}</span>
                      ) : (
                        <span className={clsx("text-sm font-bold", isMe ? "text-blue-600" : "text-gray-400")}>
                          #{pos}
                        </span>
                      )}
                    </div>
                    <Avatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={clsx("font-semibold truncate", isMe ? "text-blue-700" : "text-gray-900")}>
                          {user.name}
                          {isMe && <span className="text-xs text-blue-500 font-normal mr-1"> (אני)</span>}
                        </p>
                        <RankBadge rank={user.rank} showIcon={false} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.class ?? user.position}</p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className={clsx("font-black text-lg", isMe ? "text-blue-700" : "text-gray-800")}>
                        {user.points}
                      </p>
                      <p className="text-xs text-gray-400">נקודות</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              מדרג הדרגות
            </h3>
            <div className="space-y-2">
              {[...RANK_ORDER].reverse().map((rank) => {
                const isCurrent = rank === currentUser.rank;
                const isPast = RANK_ORDER.indexOf(rank) <= RANK_ORDER.indexOf(currentUser.rank);
                return (
                  <div
                    key={rank}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl",
                      isCurrent ? "bg-blue-50 border-2 border-blue-200" : isPast ? "bg-gray-50" : "opacity-40"
                    )}
                  >
                    <span className="text-xl">{RANK_ICONS[rank]}</span>
                    <div className="flex-1">
                      <p className={clsx("text-sm font-bold", isCurrent && "text-blue-700")}>
                        {rank}
                        {isCurrent && <span className="text-xs font-normal text-blue-500 mr-1"> כאן</span>}
                      </p>
                      <p className="text-xs text-gray-500">{RANK_THRESHOLDS[rank]}+ נקודות</p>
                    </div>
                    {isPast && !isCurrent && <span className="text-green-500">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              איך מרוויחים נקודות?
            </h3>
            <div className="space-y-2.5">
              {(Object.entries(POINT_EVENT_LABELS) as [string, string][]).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-700">{label}</p>
                  <span className="text-sm font-bold text-amber-600">+{POINT_VALS[type]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4">פעילות אחרונה</h3>
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const user = allUsers.find((u) => u.id === event.userId);
                if (!user) return null;
                return (
                  <div key={event.id} className="flex items-center gap-2">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{event.reason}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600">+{event.points}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
