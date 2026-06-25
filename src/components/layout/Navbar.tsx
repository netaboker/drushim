"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Users,
  Star,
  User,
  Shield,
  ChevronDown,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { ROLE_LABELS, NOTIFICATION_ICONS } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils/format";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/", label: "בית", icon: LayoutDashboard },
  { href: "/requests", label: "לוח בקשות", icon: ClipboardList },
  { href: "/helpers", label: "עוזרים", icon: Users },
  { href: "/rankings", label: "דרגות וניקוד", icon: Star },
  { href: "/profile", label: "הפרופיל שלי", icon: User },
];

const ADMIN_LINK = { href: "/admin", label: "ניהול", icon: Shield };

export default function Navbar() {
  const { currentUser, setCurrentUserId, canModerate, isTeacher, isStaff, isAdmin } = useAuth();
  const canPublish = isTeacher || isStaff || isAdmin;
  const {
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    pendingRequests,
    pendingHelpers,
  } = useAppData();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const myNotifications = getNotificationsForUser(currentUser.id);
  const unreadMine = myNotifications.filter((n) => !n.isRead).length;

  // Admin badge = pending items count
  const adminPendingCount = pendingRequests.length + pendingHelpers.length;

  const links = canModerate ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;

  // Close notif panel when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="לוגו טוביהו" className="w-10 h-10 rounded-full object-cover shadow-sm" />
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg leading-none">
                לוח טוביהו
              </span>
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                תיכון עירוני דוד טוביהו
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  pathname === href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon size={16} />
                {label}
                {href === "/admin" && adminPendingCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {adminPendingCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {canPublish && (
              <Link
                href="/requests/new"
                className="hidden sm:flex btn-primary text-sm py-2 px-4"
              >
                + בקשה חדשה
              </Link>
            )}

            {/* ── Notification bell ───────────────────────────────────── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserMenuOpen(false);
                }}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="התראות"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadMine > 0 && (
                  <span className="absolute top-1 left-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadMine > 9 ? "9+" : unreadMine}
                  </span>
                )}
              </button>

              {/* Notification panel */}
              {notifOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">
                      התראות
                      {unreadMine > 0 && (
                        <span className="mr-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                          {unreadMine} חדשות
                        </span>
                      )}
                    </h3>
                    {unreadMine > 0 && (
                      <button
                        onClick={() => markAllAsRead(currentUser.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <CheckCheck size={13} />
                        סמן הכל כנקרא
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {myNotifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell
                          size={28}
                          className="text-gray-200 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-400">אין התראות</p>
                      </div>
                    ) : (
                      myNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={clsx(
                            "px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50",
                            !notif.isRead && "bg-blue-50/60"
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg mt-0.5 flex-shrink-0">
                              {NOTIFICATION_ICONS[notif.type]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 leading-snug">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              {notif.adminNote && (
                                <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-2 py-1 mt-1.5">
                                  הערת מנהל: {notif.adminNote}
                                </p>
                              )}
                              <p className="text-[11px] text-gray-400 mt-1">
                                {formatRelativeDate(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {myNotifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-400 text-center">
                        {myNotifications.length} התראות סה״כ
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── User menu ───────────────────────────────────────────── */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                    currentUser.avatarColor
                  )}
                >
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-none mt-0.5">
                    {currentUser.class ??
                      currentUser.position ??
                      ROLE_LABELS[currentUser.role]}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className="text-gray-400 hidden md:block"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ROLE_LABELS[currentUser.role]}
                    </p>
                  </div>
                  {/* Role switcher (demo) */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      החלפת משתמש (דמו)
                    </p>
                    <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                      {MOCK_USERS.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUserId(u.id);
                            setUserMenuOpen(false);
                          }}
                          className={clsx(
                            "text-right text-xs px-2 py-1.5 rounded-lg transition-colors",
                            u.id === currentUser.id
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {u.name}{" "}
                          <span className="text-gray-400">
                            ({ROLE_LABELS[u.role]})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block text-sm text-gray-700 hover:text-blue-600 py-1 font-medium"
                    >
                      הפרופיל שלי
                    </Link>
                    {canModerate && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 py-1 font-medium"
                      >
                        פאנל ניהול
                        {adminPendingCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {adminPendingCount}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button - hidden since BottomNav handles mobile nav */}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon size={18} />
              {label}
              {href === "/admin" && adminPendingCount > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {adminPendingCount}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/requests/new"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center text-sm"
            >
              + בקשה חדשה
            </Link>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(userMenuOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setNotifOpen(false);
          }}
        />
      )}
    </header>
  );
}
