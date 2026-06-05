"use client";

import Link from "next/link";
import {
  HandHelping,
  Megaphone,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import RequestCard from "@/components/requests/RequestCard";
import HelperCard from "@/components/helpers/HelperCard";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils/format";

export default function HomePage() {
  const { requests, helperProfiles, loading } = useAppData();
  const { allUsers } = useAuth();

  const openRequests = requests.filter((r) => r.status === "פתוח" && r.approvalStatus === "approved").slice(0, 3);
  const activeHelpers = helperProfiles.filter((h) => h.isApproved).slice(0, 3);
  const recentCompleted = requests.filter((r) => r.status === "הושלם");

  const STATS = [
    {
      label: "בקשות פתוחות",
      value: requests.filter((r) => r.status === "פתוח" && r.approvalStatus === "approved").length,
      icon: Megaphone,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "עוזרים פעילים",
      value: helperProfiles.filter((h) => h.isApproved).length,
      icon: HandHelping,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "עזרות הושלמו",
      value: requests.filter((r) => r.status === "הושלם").length,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "חברי קהילה",
      value: allUsers.length,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="page-container py-16 relative">
          {/* Community tag */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} className="text-yellow-300" />
            קהילת בית הספר טוביהו
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 max-w-2xl">
            יחד אנחנו<br />
            <span className="text-yellow-300">חזקים יותר</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-xl mb-10">
            לוח הדרושים של טוביהו — המקום שבו כל אחד יכול לבקש עזרה, וכל אחד
            יכול להציע את עצמו. ביחד בונים קהילה בית ספרית חמה ותומכת.
          </p>

          {/* Two main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/requests/new"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl text-lg shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-200 group"
            >
              <Megaphone size={22} className="group-hover:scale-110 transition-transform" />
              <div className="text-right">
                <p className="leading-none">צריך/ה עזרה?</p>
                <p className="text-sm font-normal text-blue-500 mt-0.5">
                  פרסם/י בקשה
                </p>
              </div>
            </Link>

            <Link
              href="/helpers/join"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-yellow-400 text-yellow-900 font-bold rounded-2xl text-lg shadow-lg hover:bg-yellow-300 hover:shadow-xl transition-all duration-200 group"
            >
              <HandHelping size={22} className="group-hover:scale-110 transition-transform" />
              <div className="text-right">
                <p className="leading-none">רוצה לעזור?</p>
                <p className="text-sm font-normal text-yellow-700 mt-0.5">
                  הצטרף/י כעוזר
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container py-12 space-y-14">
        {/* ── Open requests preview ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Megaphone size={24} className="text-blue-600" />
                בקשות פתוחות
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                כאן תמצאו מי צריך עזרה עכשיו
              </p>
            </div>
            <Link
              href="/requests"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              כל הבקשות
              <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openRequests.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        </section>

        {/* ── Active helpers ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <HandHelping size={24} className="text-green-600" />
                עוזרים פעילים
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                חברי הקהילה שמוכנים לעזור
              </p>
            </div>
            <Link
              href="/helpers"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              כל העוזרים
              <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeHelpers.map((profile) => {
              const user = allUsers.find((u) => u.id === profile.userId);
              if (!user) return null;
              return <HelperCard key={profile.id} profile={profile} user={user} />;
            })}
          </div>
        </section>

        {/* ── Recent successes ───────────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle2 size={24} className="text-green-500" />
              עזרות שהושלמו לאחרונה
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              כך נראית קהילה אמיתית
            </p>
          </div>

          <div className="space-y-3">
            {recentCompleted.map((r) => {
              const creator = allUsers.find((u) => u.id === r.createdById);
              const helpers = r.assignedHelperIds
                .map((id) => allUsers.find((u) => u.id === id))
                .filter(Boolean) as typeof allUsers;

              return (
                <Link
                  key={r.id}
                  href={`/requests/${r.id}`}
                  className="block card px-5 py-4 hover:border-green-200 hover:bg-green-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700">
                        {r.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {creator?.name} קיבל/ה עזרה ·{" "}
                        {formatRelativeDate(r.updatedAt)}
                      </p>
                    </div>
                    {helpers.length > 0 && (
                      <div className="flex -space-x-2 flex-shrink-0">
                        {helpers.slice(0, 3).map((h) => (
                          <Avatar
                            key={h.id}
                            user={h}
                            size="sm"
                            className="border-2 border-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {r.updates.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 mr-14 line-clamp-1">
                      &ldquo;{r.updates[r.updates.length - 1].text}&rdquo;
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Community CTA ──────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
          <TrendingUp size={32} className="text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            כל עזרה קטנה עושה הבדל גדול
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            הצטרפו למאות חברי הקהילה שכבר מעורבים. תרמו מזמנכם, קבלו נקודות,
            ועלו בדרגות. ביחד אנחנו בונים בית ספר שכולם גאים בו.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/requests" className="btn-primary">
              צפה בכל הבקשות
            </Link>
            <Link href="/helpers/join" className="btn-secondary">
              הצטרף/י כעוזר
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
