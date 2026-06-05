// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "teacher" | "staff" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "תלמיד/ה",
  teacher: "מורה",
  staff: "איש צוות",
  admin: "מנהל מערכת",
};

// ─── Ranks ────────────────────────────────────────────────────────────────────

export type RankLevel =
  | "מתחיל/ה"
  | "פעיל/ה"
  | "תורם/ת"
  | "מוביל/ה"
  | "מאסטר/ית";

export const RANK_ORDER: RankLevel[] = [
  "מתחיל/ה",
  "פעיל/ה",
  "תורם/ת",
  "מוביל/ה",
  "מאסטר/ית",
];

export const RANK_THRESHOLDS: Record<RankLevel, number> = {
  "מתחיל/ה": 0,
  "פעיל/ה": 50,
  "תורם/ת": 150,
  "מוביל/ה": 350,
  "מאסטר/ית": 700,
};

export const RANK_COLORS: Record<RankLevel, string> = {
  "מתחיל/ה": "bg-gray-100 text-gray-700",
  "פעיל/ה": "bg-blue-100 text-blue-700",
  "תורם/ת": "bg-green-100 text-green-700",
  "מוביל/ה": "bg-purple-100 text-purple-700",
  "מאסטר/ית": "bg-amber-100 text-amber-700",
};

export const RANK_ICONS: Record<RankLevel, string> = {
  "מתחיל/ה": "🌱",
  "פעיל/ה": "⭐",
  "תורם/ת": "🌟",
  "מוביל/ה": "🏆",
  "מאסטר/ית": "👑",
};

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  role: UserRole;
  class?: string; // כיתה - for students
  position?: string; // תפקיד - for teachers/staff
  avatarInitials: string;
  avatarColor: string;
  points: number;
  rank: RankLevel;
  joinedAt: string;
  isActive: boolean;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export type RequestCategory =
  | "לימודי"
  | "טכני"
  | "חברתי"
  | "ארגוני"
  | "יצירתי"
  | "אירועים בית ספריים"
  | "קהילתי";

export const CATEGORY_COLORS: Record<RequestCategory, string> = {
  לימודי: "bg-blue-100 text-blue-700 border-blue-200",
  טכני: "bg-gray-100 text-gray-700 border-gray-200",
  חברתי: "bg-pink-100 text-pink-700 border-pink-200",
  ארגוני: "bg-orange-100 text-orange-700 border-orange-200",
  יצירתי: "bg-purple-100 text-purple-700 border-purple-200",
  "אירועים בית ספריים": "bg-yellow-100 text-yellow-700 border-yellow-200",
  קהילתי: "bg-green-100 text-green-700 border-green-200",
};

export const CATEGORY_ICONS: Record<RequestCategory, string> = {
  לימודי: "📚",
  טכני: "🔧",
  חברתי: "🤝",
  ארגוני: "📋",
  יצירתי: "🎨",
  "אירועים בית ספריים": "🎉",
  קהילתי: "🏫",
};

export type RequestStatus = "פתוח" | "בטיפול" | "הושלם" | "נסגר";

export const STATUS_COLORS: Record<RequestStatus, string> = {
  פתוח: "bg-green-100 text-green-700 border-green-200",
  בטיפול: "bg-blue-100 text-blue-700 border-blue-200",
  הושלם: "bg-gray-100 text-gray-600 border-gray-200",
  נסגר: "bg-red-100 text-red-600 border-red-200",
};

export type UrgencyLevel = "נמוכה" | "בינונית" | "גבוהה" | "דחוף";

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  נמוכה: "text-gray-500",
  בינונית: "text-yellow-600",
  גבוהה: "text-orange-600",
  דחוף: "text-red-600",
};

export interface HelpRequest {
  id: string;
  title: string;
  category: RequestCategory;
  description: string;
  targetAudience: string;
  when: string;
  status: RequestStatus;
  urgency: UrgencyLevel;
  helpersNeeded: number;
  assignedHelperIds: string[];
  volunteerIds: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
  requiresStaffApproval: boolean;
  contactPerson: string;
  updates: RequestUpdate[];
  approvalStatus: ApprovalStatus;
  adminNote?: string;
}

export interface RequestUpdate {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  isStaffNote: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export interface HelperProfile {
  id: string;
  userId: string;
  skills: string[];
  availability: string;
  bio: string;
  categories: RequestCategory[];
  isApproved: boolean;
  helpCount: number;
  approvalStatus: ApprovalStatus;
  adminNote?: string;
  submittedAt: string;
}

// ─── Matching ─────────────────────────────────────────────────────────────────

export type MatchStatus = "pending" | "accepted" | "completed" | "cancelled";

export interface Match {
  id: string;
  requestId: string;
  helperId: string;
  status: MatchStatus;
  matchedAt: string;
  completedAt?: string;
  notes?: string;
}

// ─── Points & Gamification ────────────────────────────────────────────────────

export type PointEventType =
  | "volunteer"
  | "complete"
  | "feedback_received"
  | "streak"
  | "publish_request"
  | "profile_approved";

export const POINT_EVENT_LABELS: Record<PointEventType, string> = {
  volunteer: "התנדבות לבקשה",
  complete: "השלמת עזרה",
  feedback_received: "קבלת משוב חיובי",
  streak: "רצף פעילות",
  publish_request: "פרסום בקשה",
  profile_approved: "פרופיל עוזר אושר",
};

export const POINT_EVENT_VALUES: Record<PointEventType, number> = {
  volunteer: 10,
  complete: 30,
  feedback_received: 20,
  streak: 15,
  publish_request: 5,
  profile_approved: 25,
};

export interface PointsEvent {
  id: string;
  userId: string;
  points: number;
  reason: string;
  eventType: PointEventType;
  createdAt: string;
  relatedRequestId?: string;
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export type ApprovalStatus = "pending" | "approved" | "rejected";

// Roles whose requests are auto-published without admin approval
export const STAFF_ROLES: UserRole[] = ["teacher", "staff", "admin"];

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "request_approved"
  | "request_rejected"
  | "helper_approved"
  | "helper_rejected"
  | "volunteer_received"
  | "assigned_to_request";

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  request_approved: "✅",
  request_rejected: "❌",
  helper_approved: "🤝",
  helper_rejected: "⚠️",
  volunteer_received: "🙋",
  assigned_to_request: "📌",
};

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: "request" | "helper";
  adminNote?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  targetType: "user" | "request" | "helper" | "match";
  createdAt: string;
  notes?: string;
}

export interface ModerationFlag {
  id: string;
  reportedById: string;
  targetId: string;
  targetType: "request" | "helper" | "comment";
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  resolvedById?: string;
}
