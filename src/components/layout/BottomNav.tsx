"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, HandHelping, Star, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "בית", icon: Home },
  { href: "/requests", label: "בקשות", icon: ClipboardList },
  { href: "/helpers", label: "מומחים", icon: HandHelping },
  { href: "/rankings", label: "דרגות", icon: Star },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { canModerate, isTeacher, isStaff, isAdmin } = useAuth();
  const canPublish = isTeacher || isStaff || isAdmin;
  const { unreadCount } = useAppData();

  return (
    <nav className="lg:hidden fixed bottom-0 right-0 left-0 z-50 bg-white/95 backdrop-blur-md border-t border-indigo-100 shadow-lg">
      <div className="flex items-center justify-around px-2 pb-safe">
        {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-0.5 py-3 px-4 rounded-xl transition-colors min-w-[60px]",
              pathname === href ? "text-indigo-600" : "text-gray-500"
            )}
          >
            <Icon size={22} strokeWidth={pathname === href ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* כפתור פרסום מרכזי — למורים/צוות בלבד */}
        {canPublish ? (
          <Link
            href="/requests/new"
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
              <Plus size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium text-indigo-600 mt-0.5">פרסם</span>
          </Link>
        ) : (
          <div className="w-14" />
        )}

        {NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-0.5 py-3 px-4 rounded-xl transition-colors min-w-[60px]",
              pathname === href ? "text-indigo-600" : "text-gray-500"
            )}
          >
            <Icon size={22} strokeWidth={pathname === href ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* פרופיל */}
        <Link
          href="/profile"
          className={clsx(
            "flex flex-col items-center gap-0.5 py-3 px-4 rounded-xl transition-colors min-w-[60px] relative",
            pathname === "/profile" ? "text-blue-600" : "text-gray-500"
          )}
        >
          <div className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
            pathname === "/profile" ? "bg-blue-600" : "bg-gray-400"
          )}>
            אני
          </div>
          <span className="text-[10px] font-medium">פרופיל</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
