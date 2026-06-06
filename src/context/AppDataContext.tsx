"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import useSWR, { mutate } from "swr";
import {
  HelpRequest,
  HelperProfile,
  AppNotification,
  NotificationType,
} from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { fetchAllData } from "@/lib/supabase/fetchers";

const AUTO_PUBLISH_ROLES = new Set(["teacher", "staff", "admin"]);
export const ADMIN_USER_ID = "u10";

// SWR cache key
const APP_DATA_KEY = "appData";

// User name cache (shared)
const userNameCache: Record<string, string> = {};
export function getUserDisplayName(userId: string): string {
  return userNameCache[userId] ?? "משתמש";
}

// Not used directly but kept for compatibility
export function isAutoPublishRole(_userId: string): boolean { return false; }

// ─── Context type ─────────────────────────────────────────────────────────────

interface AppDataContextValue {
  loading: boolean;
  requests: HelpRequest[];
  helperProfiles: HelperProfile[];
  notifications: AppNotification[];
  pendingRequests: HelpRequest[];
  pendingHelpers: HelperProfile[];
  unreadCount: number;

  submitRequest: (
    data: Omit<HelpRequest, "id" | "status" | "assignedHelperIds" | "volunteerIds" | "createdAt" | "updatedAt" | "updates" | "approvalStatus">,
    userRole: string
  ) => Promise<string>;

  approveRequest: (requestId: string, adminNote?: string) => Promise<void>;
  rejectRequest: (requestId: string, adminNote: string) => Promise<void>;
  volunteerForRequest: (requestId: string, userId: string) => Promise<void>;
  assignHelper: (requestId: string, userId: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: HelpRequest["status"]) => Promise<void>;
  submitHelperProfile: (data: Omit<HelperProfile, "id" | "isApproved" | "helpCount" | "approvalStatus" | "submittedAt">) => Promise<void>;
  approveHelper: (helperId: string, adminNote?: string) => Promise<void>;
  rejectHelper: (helperId: string, adminNote: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsForUser: (userId: string) => AppNotification[];
  getUserDisplayName: (userId: string) => string;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

let notifCounter = 100;
function makeId(prefix: string) { return `${prefix}_${++notifCounter}_${Date.now()}`; }

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // SWR — טוען פעם אחת ומשמר cache ל-5 דקות
  const { data, isLoading } = useSWR(APP_DATA_KEY, fetchAllData, {
    onSuccess: (d) => {
      // עדכן את cache השמות
      // (נעשה ב-AuthContext שכבר מביא users)
    },
  });

  const requests = data?.requests ?? [];
  const helperProfiles = data?.helperProfiles ?? [];

  const pendingRequests = requests.filter((r) => r.approvalStatus === "pending");
  const pendingHelpers = helperProfiles.filter((h) => h.approvalStatus === "pending");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Notification helper ────────────────────────────────────────────────────
  function addNotification(
    recipientId: string, type: NotificationType, title: string, message: string,
    relatedId?: string, relatedType?: "request" | "helper", adminNote?: string
  ) {
    setNotifications((prev) => [{
      id: makeId("n"), recipientId, type, title, message, isRead: false,
      createdAt: new Date().toISOString(), relatedId, relatedType, adminNote,
    }, ...prev]);
  }

  // ── Helper: עדכון cache מקומי ─────────────────────────────────────────────
  function updateCache(updater: (prev: { requests: HelpRequest[]; helperProfiles: HelperProfile[] }) => { requests: HelpRequest[]; helperProfiles: HelperProfile[] }) {
    mutate(APP_DATA_KEY, (prev: { requests: HelpRequest[]; helperProfiles: HelperProfile[] } | undefined) =>
      updater(prev ?? { requests: [], helperProfiles: [] }), false
    );
  }

  // ── Request actions ────────────────────────────────────────────────────────

  const submitRequest = useCallback(async (
    data: Omit<HelpRequest, "id" | "status" | "assignedHelperIds" | "volunteerIds" | "createdAt" | "updatedAt" | "updates" | "approvalStatus">,
    userRole: string
  ): Promise<string> => {
    const id = makeId("r");
    const autoPublish = AUTO_PUBLISH_ROLES.has(userRole);
    const approvalStatus = autoPublish ? "approved" : "pending";
    const now = new Date().toISOString();

    const { error } = await supabase.from("help_requests").insert({
      id, title: data.title, category: data.category, description: data.description,
      target_audience: data.targetAudience, when: data.when, status: "פתוח",
      urgency: data.urgency, helpers_needed: data.helpersNeeded,
      assigned_helper_ids: [], volunteer_ids: [], created_by_id: data.createdById,
      created_at: now, updated_at: now, requires_staff_approval: data.requiresStaffApproval,
      contact_person: data.contactPerson, approval_status: approvalStatus,
    });
    if (error) { console.error(error); return id; }

    const newReq: HelpRequest = { ...data, id, status: "פתוח", assignedHelperIds: [], volunteerIds: [], createdAt: now, updatedAt: now, updates: [], approvalStatus };
    updateCache((prev) => ({ ...prev, requests: [newReq, ...prev.requests] }));

    if (!autoPublish) addNotification(ADMIN_USER_ID, "volunteer_received", "בקשה חדשה ממתינה לאישור", `הבקשה "${data.title}" הוגשה וממתינה לאישורך.`, id, "request");
    return id;
  }, []);

  const approveRequest = useCallback(async (requestId: string, adminNote?: string) => {
    const { error } = await supabase.from("help_requests").update({ approval_status: "approved", admin_note: adminNote ?? null }).eq("id", requestId);
    if (error) { console.error(error); return; }
    let submitterId = "", title = "";
    updateCache((prev) => ({ ...prev, requests: prev.requests.map((r) => { if (r.id !== requestId) return r; submitterId = r.createdById; title = r.title; return { ...r, approvalStatus: "approved" as const, adminNote }; }) }));
    if (submitterId) addNotification(submitterId, "request_approved", "🎉 הבקשה שלך אושרה!", `הבקשה "${title}" אושרה ופורסמה.`, requestId, "request", adminNote);
  }, []);

  const rejectRequest = useCallback(async (requestId: string, adminNote: string) => {
    const { error } = await supabase.from("help_requests").update({ approval_status: "rejected", admin_note: adminNote }).eq("id", requestId);
    if (error) { console.error(error); return; }
    let submitterId = "", title = "";
    updateCache((prev) => ({ ...prev, requests: prev.requests.map((r) => { if (r.id !== requestId) return r; submitterId = r.createdById; title = r.title; return { ...r, approvalStatus: "rejected" as const, adminNote }; }) }));
    if (submitterId) addNotification(submitterId, "request_rejected", "הבקשה לא אושרה", `הבקשה "${title}" לא אושרה.`, requestId, "request", adminNote);
  }, []);

  const volunteerForRequest = useCallback(async (requestId: string, userId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const alreadyIn = req.volunteerIds.includes(userId);
    const newVols = alreadyIn ? req.volunteerIds.filter((id) => id !== userId) : [...req.volunteerIds, userId];
    const { error } = await supabase.from("help_requests").update({ volunteer_ids: newVols, updated_at: new Date().toISOString() }).eq("id", requestId);
    if (error) { console.error(error); return; }
    updateCache((prev) => ({ ...prev, requests: prev.requests.map((r) => r.id !== requestId ? r : { ...r, volunteerIds: newVols }) }));
    if (!alreadyIn && req.createdById !== userId) addNotification(req.createdById, "volunteer_received", `🙋 ${getUserDisplayName(userId)} הציע/ה לעזור!`, `נרשמ/ה לבקשה "${req.title}".`, requestId, "request");
  }, [requests]);

  const assignHelper = useCallback(async (requestId: string, userId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const alreadyAssigned = req.assignedHelperIds.includes(userId);
    const newAssigned = alreadyAssigned ? req.assignedHelperIds.filter((id) => id !== userId) : [...req.assignedHelperIds, userId];
    const newStatus = newAssigned.length >= req.helpersNeeded ? "בטיפול" : req.status;
    const { error } = await supabase.from("help_requests").update({ assigned_helper_ids: newAssigned, status: newStatus, updated_at: new Date().toISOString() }).eq("id", requestId);
    if (error) { console.error(error); return; }
    updateCache((prev) => ({ ...prev, requests: prev.requests.map((r) => r.id !== requestId ? r : { ...r, assignedHelperIds: newAssigned, status: newStatus }) }));
    addNotification(userId, "assigned_to_request", "📌 הוקצית לבקשה!", `הוקצית לבקשה "${req.title}".`, requestId, "request");
  }, [requests]);

  const updateRequestStatus = useCallback(async (requestId: string, status: HelpRequest["status"]) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("help_requests").update({ status, updated_at: now }).eq("id", requestId);
    if (error) { console.error(error); return; }
    let creatorId = "", title = "";
    updateCache((prev) => ({ ...prev, requests: prev.requests.map((r) => { if (r.id !== requestId) return r; creatorId = r.createdById; title = r.title; return { ...r, status, updatedAt: now }; }) }));
    if (status === "הושלם" && creatorId) addNotification(creatorId, "request_approved", "✅ הבקשה הושלמה!", `הבקשה "${title}" הושלמה.`, requestId, "request");
  }, []);

  const submitHelperProfile = useCallback(async (data: Omit<HelperProfile, "id" | "isApproved" | "helpCount" | "approvalStatus" | "submittedAt">) => {
    const id = makeId("h");
    const now = new Date().toISOString();
    const { error } = await supabase.from("helper_profiles").insert({ id, user_id: data.userId, skills: data.skills, availability: data.availability, bio: data.bio, categories: data.categories, is_approved: false, help_count: 0, approval_status: "pending", submitted_at: now });
    if (error) { console.error(error); return; }
    const newProfile: HelperProfile = { ...data, id, isApproved: false, helpCount: 0, approvalStatus: "pending", submittedAt: now };
    updateCache((prev) => ({ ...prev, helperProfiles: [newProfile, ...prev.helperProfiles] }));
    addNotification(ADMIN_USER_ID, "volunteer_received", "פרופיל עוזר חדש ממתין לאישור", "פרופיל עוזר חדש הוגש.", id, "helper");
  }, []);

  const approveHelper = useCallback(async (helperId: string, adminNote?: string) => {
    const { error } = await supabase.from("helper_profiles").update({ is_approved: true, approval_status: "approved", admin_note: adminNote ?? null }).eq("id", helperId);
    if (error) { console.error(error); return; }
    let submitterId = "";
    updateCache((prev) => ({ ...prev, helperProfiles: prev.helperProfiles.map((h) => { if (h.id !== helperId) return h; submitterId = h.userId; return { ...h, isApproved: true, approvalStatus: "approved" as const, adminNote }; }) }));
    if (submitterId) addNotification(submitterId, "helper_approved", "🤝 פרופיל העוזר אושר!", "פרופיל העוזר שלך אושר. +25 נקודות!", helperId, "helper", adminNote);
  }, []);

  const rejectHelper = useCallback(async (helperId: string, adminNote: string) => {
    const { error } = await supabase.from("helper_profiles").update({ approval_status: "rejected", admin_note: adminNote }).eq("id", helperId);
    if (error) { console.error(error); return; }
    let submitterId = "";
    updateCache((prev) => ({ ...prev, helperProfiles: prev.helperProfiles.map((h) => { if (h.id !== helperId) return h; submitterId = h.userId; return { ...h, approvalStatus: "rejected" as const, adminNote }; }) }));
    if (submitterId) addNotification(submitterId, "helper_rejected", "פרופיל העוזר לא אושר", "פרופיל העוזר שלך לא אושר.", helperId, "helper", adminNote);
  }, []);

  const markAsRead = useCallback((id: string) => { setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n)); }, []);
  const markAllAsRead = useCallback((userId: string) => { setNotifications((prev) => prev.map((n) => n.recipientId === userId ? { ...n, isRead: true } : n)); }, []);
  const getNotificationsForUser = useCallback((userId: string) => notifications.filter((n) => n.recipientId === userId), [notifications]);

  return (
    <AppDataContext.Provider value={{
      loading: isLoading, requests, helperProfiles, notifications,
      pendingRequests, pendingHelpers, unreadCount,
      submitRequest, approveRequest, rejectRequest, volunteerForRequest,
      assignHelper, updateRequestStatus, submitHelperProfile, approveHelper, rejectHelper,
      markAsRead, markAllAsRead, getNotificationsForUser, getUserDisplayName,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
