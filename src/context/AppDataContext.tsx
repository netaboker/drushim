"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  HelpRequest,
  HelperProfile,
  AppNotification,
  NotificationType,
  RequestUpdate,
} from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

// Roles that bypass admin approval and publish requests immediately
const AUTO_PUBLISH_ROLES = new Set(["teacher", "staff", "admin"]);

// Admin user ID — only מנחם הרצוג can approve
export const ADMIN_USER_ID = "u10";

// ─── DB row → app type converters ─────────────────────────────────────────────

function rowToRequest(row: Record<string, unknown>, updates: RequestUpdate[]): HelpRequest {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as HelpRequest["category"],
    description: row.description as string,
    targetAudience: row.target_audience as string,
    when: row.when as string,
    status: row.status as HelpRequest["status"],
    urgency: row.urgency as HelpRequest["urgency"],
    helpersNeeded: row.helpers_needed as number,
    assignedHelperIds: (row.assigned_helper_ids as string[]) ?? [],
    volunteerIds: (row.volunteer_ids as string[]) ?? [],
    createdById: row.created_by_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    requiresStaffApproval: row.requires_staff_approval as boolean,
    contactPerson: row.contact_person as string,
    approvalStatus: row.approval_status as HelpRequest["approvalStatus"],
    adminNote: row.admin_note as string | undefined,
    updates,
  };
}

function rowToUpdate(row: Record<string, unknown>): RequestUpdate {
  return {
    id: row.id as string,
    text: row.text as string,
    authorId: row.author_id as string,
    createdAt: row.created_at as string,
    isStaffNote: row.is_staff_note as boolean,
  };
}

function rowToHelper(row: Record<string, unknown>): HelperProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    skills: (row.skills as string[]) ?? [],
    availability: row.availability as string,
    bio: row.bio as string,
    categories: (row.categories as HelperProfile["categories"]) ?? [],
    isApproved: row.is_approved as boolean,
    helpCount: row.help_count as number,
    approvalStatus: row.approval_status as HelperProfile["approvalStatus"],
    adminNote: row.admin_note as string | undefined,
    submittedAt: row.submitted_at as string,
  };
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface AppDataContextValue {
  // State
  loading: boolean;

  // Data
  requests: HelpRequest[];
  helperProfiles: HelperProfile[];
  notifications: AppNotification[];

  // Computed
  pendingRequests: HelpRequest[];
  pendingHelpers: HelperProfile[];
  unreadCount: number;

  // Request actions
  submitRequest: (
    data: Omit<
      HelpRequest,
      | "id"
      | "status"
      | "assignedHelperIds"
      | "volunteerIds"
      | "createdAt"
      | "updatedAt"
      | "updates"
      | "approvalStatus"
    >,
    userRole: string
  ) => Promise<string>;

  approveRequest: (requestId: string, adminNote?: string) => Promise<void>;
  rejectRequest: (requestId: string, adminNote: string) => Promise<void>;
  volunteerForRequest: (requestId: string, userId: string) => Promise<void>;
  assignHelper: (requestId: string, userId: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: HelpRequest["status"]) => Promise<void>;

  // Helper actions
  submitHelperProfile: (
    data: Omit<HelperProfile, "id" | "isApproved" | "helpCount" | "approvalStatus" | "submittedAt">
  ) => Promise<void>;
  approveHelper: (helperId: string, adminNote?: string) => Promise<void>;
  rejectHelper: (helperId: string, adminNote: string) => Promise<void>;

  // Notification actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsForUser: (userId: string) => AppNotification[];

  // Helpers
  getUserDisplayName: (userId: string) => string;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

let notifCounter = 100;

function makeId(prefix: string) {
  return `${prefix}_${++notifCounter}_${Date.now()}`;
}

// Cache for user names (to avoid re-fetching)
const userNameCache: Record<string, string> = {};

export function getUserDisplayName(userId: string): string {
  return userNameCache[userId] ?? "משתמש";
}

export function isAutoPublishRole(userId: string): boolean {
  // We check against a role; since roles aren't cached here, we pass the role directly via context
  return false; // overridden below via userRole param
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [helperProfiles, setHelperProfiles] = useState<HelperProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // ── Initial data fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch users for name cache
        const { data: users } = await supabase.from("users").select("id, name");
        if (users) {
          users.forEach((u) => { userNameCache[u.id] = u.name; });
        }

        // Fetch updates
        const { data: updatesRaw } = await supabase
          .from("request_updates")
          .select("*")
          .order("created_at", { ascending: true });

        const updatesByRequest: Record<string, RequestUpdate[]> = {};
        (updatesRaw ?? []).forEach((row) => {
          const upd = rowToUpdate(row);
          if (!updatesByRequest[row.request_id]) updatesByRequest[row.request_id] = [];
          updatesByRequest[row.request_id].push(upd);
        });

        // Fetch requests
        const { data: requestsRaw } = await supabase
          .from("help_requests")
          .select("*")
          .order("created_at", { ascending: false });

        setRequests(
          (requestsRaw ?? []).map((r) => rowToRequest(r, updatesByRequest[r.id] ?? []))
        );

        // Fetch helper profiles
        const { data: helpersRaw } = await supabase
          .from("helper_profiles")
          .select("*")
          .order("submitted_at", { ascending: false });

        setHelperProfiles((helpersRaw ?? []).map(rowToHelper));
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────
  const pendingRequests = requests.filter((r) => r.approvalStatus === "pending");
  const pendingHelpers = helperProfiles.filter((h) => h.approvalStatus === "pending");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Notification helper ────────────────────────────────────────────────────
  function addNotification(
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
    relatedType?: "request" | "helper",
    adminNote?: string
  ) {
    const notif: AppNotification = {
      id: makeId("n"),
      recipientId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId,
      relatedType,
      adminNote,
    };
    setNotifications((prev) => [notif, ...prev]);
  }

  // ── Request actions ────────────────────────────────────────────────────────

  const submitRequest = useCallback(
    async (
      data: Omit<
        HelpRequest,
        | "id"
        | "status"
        | "assignedHelperIds"
        | "volunteerIds"
        | "createdAt"
        | "updatedAt"
        | "updates"
        | "approvalStatus"
      >,
      userRole: string
    ): Promise<string> => {
      const id = makeId("r");
      const autoPublish = AUTO_PUBLISH_ROLES.has(userRole);
      const approvalStatus = autoPublish ? "approved" : "pending";
      const now = new Date().toISOString();

      const row = {
        id,
        title: data.title,
        category: data.category,
        description: data.description,
        target_audience: data.targetAudience,
        when: data.when,
        status: "פתוח",
        urgency: data.urgency,
        helpers_needed: data.helpersNeeded,
        assigned_helper_ids: [],
        volunteer_ids: [],
        created_by_id: data.createdById,
        created_at: now,
        updated_at: now,
        requires_staff_approval: data.requiresStaffApproval,
        contact_person: data.contactPerson,
        approval_status: approvalStatus,
      };

      const { error } = await supabase.from("help_requests").insert(row);
      if (error) { console.error("submitRequest error", error); return id; }

      const newRequest: HelpRequest = {
        ...data,
        id,
        status: "פתוח",
        assignedHelperIds: [],
        volunteerIds: [],
        createdAt: now,
        updatedAt: now,
        updates: [],
        approvalStatus,
      };
      setRequests((prev) => [newRequest, ...prev]);

      if (!autoPublish) {
        addNotification(
          ADMIN_USER_ID,
          "volunteer_received",
          "בקשה חדשה ממתינה לאישור",
          `הבקשה "${data.title}" הוגשה על ידי ${data.contactPerson} וממתינה לאישורך.`,
          id, "request"
        );
      }

      return id;
    },
    []
  );

  const approveRequest = useCallback(async (requestId: string, adminNote?: string) => {
    const { error } = await supabase
      .from("help_requests")
      .update({ approval_status: "approved", admin_note: adminNote ?? null })
      .eq("id", requestId);
    if (error) { console.error("approveRequest error", error); return; }

    let submitterId = "";
    let requestTitle = "";
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        submitterId = r.createdById;
        requestTitle = r.title;
        return { ...r, approvalStatus: "approved", adminNote };
      })
    );

    if (submitterId) {
      addNotification(submitterId, "request_approved",
        "🎉 הבקשה שלך אושרה!",
        `הבקשה "${requestTitle}" אושרה ופורסמה בלוח הבקשות.`,
        requestId, "request", adminNote
      );
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: string, adminNote: string) => {
    const { error } = await supabase
      .from("help_requests")
      .update({ approval_status: "rejected", admin_note: adminNote })
      .eq("id", requestId);
    if (error) { console.error("rejectRequest error", error); return; }

    let submitterId = "";
    let requestTitle = "";
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        submitterId = r.createdById;
        requestTitle = r.title;
        return { ...r, approvalStatus: "rejected", adminNote };
      })
    );

    if (submitterId) {
      addNotification(submitterId, "request_rejected",
        "הבקשה לא אושרה",
        `הבקשה "${requestTitle}" לא אושרה לפרסום.`,
        requestId, "request", adminNote
      );
    }
  }, []);

  const volunteerForRequest = useCallback(async (requestId: string, userId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const alreadyIn = request.volunteerIds.includes(userId);
    const newVolunteers = alreadyIn
      ? request.volunteerIds.filter((id) => id !== userId)
      : [...request.volunteerIds, userId];

    const { error } = await supabase
      .from("help_requests")
      .update({ volunteer_ids: newVolunteers, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) { console.error("volunteerForRequest error", error); return; }

    setRequests((prev) =>
      prev.map((r) => r.id !== requestId ? r : { ...r, volunteerIds: newVolunteers })
    );

    if (!alreadyIn && request.createdById !== userId) {
      const volunteerName = getUserDisplayName(userId);
      addNotification(request.createdById, "volunteer_received",
        `🙋 ${volunteerName} הציע/ה לעזור!`,
        `${volunteerName} נרשמ/ה כמתנדב/ת לבקשה "${request.title}".`,
        requestId, "request"
      );
    }
  }, [requests]);

  const assignHelper = useCallback(async (requestId: string, userId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const alreadyAssigned = request.assignedHelperIds.includes(userId);
    const newAssigned = alreadyAssigned
      ? request.assignedHelperIds.filter((id) => id !== userId)
      : [...request.assignedHelperIds, userId];

    const newStatus = newAssigned.length >= request.helpersNeeded ? "בטיפול" : request.status;

    const { error } = await supabase
      .from("help_requests")
      .update({ assigned_helper_ids: newAssigned, status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) { console.error("assignHelper error", error); return; }

    setRequests((prev) =>
      prev.map((r) =>
        r.id !== requestId ? r : { ...r, assignedHelperIds: newAssigned, status: newStatus }
      )
    );

    addNotification(userId, "assigned_to_request",
      "📌 הוקצית לבקשה!",
      `הוקצית לבקשה "${request.title}". כנס/י לבקשה לפרטים.`,
      requestId, "request"
    );
  }, [requests]);

  const updateRequestStatus = useCallback(async (requestId: string, status: HelpRequest["status"]) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("help_requests")
      .update({ status, updated_at: now })
      .eq("id", requestId);
    if (error) { console.error("updateRequestStatus error", error); return; }

    let creatorId = "";
    let requestTitle = "";
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        creatorId = r.createdById;
        requestTitle = r.title;
        return { ...r, status, updatedAt: now };
      })
    );

    if (status === "הושלם" && creatorId) {
      addNotification(creatorId, "request_approved",
        "✅ הבקשה הושלמה!",
        `הבקשה "${requestTitle}" סומנה כהושלמה. תודה לכל מי שעזר!`,
        requestId, "request"
      );
    }
  }, []);

  // ── Helper profile actions ─────────────────────────────────────────────────

  const submitHelperProfile = useCallback(async (
    data: Omit<HelperProfile, "id" | "isApproved" | "helpCount" | "approvalStatus" | "submittedAt">
  ) => {
    const id = makeId("h");
    const now = new Date().toISOString();

    const row = {
      id,
      user_id: data.userId,
      skills: data.skills,
      availability: data.availability,
      bio: data.bio,
      categories: data.categories,
      is_approved: false,
      help_count: 0,
      approval_status: "pending",
      submitted_at: now,
    };

    const { error } = await supabase.from("helper_profiles").insert(row);
    if (error) { console.error("submitHelperProfile error", error); return; }

    const newProfile: HelperProfile = {
      ...data, id, isApproved: false, helpCount: 0, approvalStatus: "pending", submittedAt: now,
    };
    setHelperProfiles((prev) => [newProfile, ...prev]);

    addNotification(ADMIN_USER_ID, "volunteer_received",
      "פרופיל עוזר חדש ממתין לאישור",
      "פרופיל עוזר חדש הוגש וממתין לאישורך.",
      id, "helper"
    );
  }, []);

  const approveHelper = useCallback(async (helperId: string, adminNote?: string) => {
    const { error } = await supabase
      .from("helper_profiles")
      .update({ is_approved: true, approval_status: "approved", admin_note: adminNote ?? null })
      .eq("id", helperId);
    if (error) { console.error("approveHelper error", error); return; }

    let submitterId = "";
    setHelperProfiles((prev) =>
      prev.map((h) => {
        if (h.id !== helperId) return h;
        submitterId = h.userId;
        return { ...h, isApproved: true, approvalStatus: "approved", adminNote };
      })
    );

    if (submitterId) {
      addNotification(submitterId, "helper_approved",
        "🤝 פרופיל העוזר אושר!",
        "פרופיל העוזר שלך אושר ופורסם בלוח העוזרים. תרוויח/י +25 נקודות!",
        helperId, "helper", adminNote
      );
    }
  }, []);

  const rejectHelper = useCallback(async (helperId: string, adminNote: string) => {
    const { error } = await supabase
      .from("helper_profiles")
      .update({ approval_status: "rejected", admin_note: adminNote })
      .eq("id", helperId);
    if (error) { console.error("rejectHelper error", error); return; }

    let submitterId = "";
    setHelperProfiles((prev) =>
      prev.map((h) => {
        if (h.id !== helperId) return h;
        submitterId = h.userId;
        return { ...h, approvalStatus: "rejected", adminNote };
      })
    );

    if (submitterId) {
      addNotification(submitterId, "helper_rejected",
        "פרופיל העוזר לא אושר",
        "פרופיל העוזר שלך לא אושר לפרסום.",
        helperId, "helper", adminNote
      );
    }
  }, []);

  // ── Notification actions ───────────────────────────────────────────────────

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback((userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.recipientId === userId ? { ...n, isRead: true } : n)
    );
  }, []);

  const getNotificationsForUser = useCallback(
    (userId: string) => notifications.filter((n) => n.recipientId === userId),
    [notifications]
  );

  return (
    <AppDataContext.Provider
      value={{
        loading,
        requests,
        helperProfiles,
        notifications,
        pendingRequests,
        pendingHelpers,
        unreadCount,
        submitRequest,
        approveRequest,
        rejectRequest,
        volunteerForRequest,
        assignHelper,
        updateRequestStatus,
        submitHelperProfile,
        approveHelper,
        rejectHelper,
        markAsRead,
        markAllAsRead,
        getNotificationsForUser,
        getUserDisplayName,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
