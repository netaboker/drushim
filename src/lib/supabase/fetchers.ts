import { supabase } from "./client";
import { User, UserRole, HelpRequest, HelperProfile, RequestUpdate } from "@/lib/types";

// ─── Converters ───────────────────────────────────────────────────────────────

export function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as UserRole,
    class: row.class as string | undefined,
    position: row.position as string | undefined,
    avatarInitials: row.avatar_initials as string,
    avatarColor: row.avatar_color as string,
    points: row.points as number,
    rank: row.rank as User["rank"],
    joinedAt: row.joined_at as string,
    isActive: row.is_active as boolean,
  };
}

function rowToUpdate(row: Record<string, unknown>): RequestUpdate & { requestId: string } {
  return {
    id: row.id as string,
    requestId: row.request_id as string,
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

// ─── Fetchers (called by SWR) ─────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("points", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToUser);
}

export async function fetchAllData(): Promise<{
  requests: HelpRequest[];
  helperProfiles: HelperProfile[];
}> {
  // שאילתות מקביליות — הכל בבת אחת
  const [requestsRes, updatesRes, helpersRes] = await Promise.all([
    supabase.from("help_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("request_updates").select("*").order("created_at", { ascending: true }),
    supabase.from("helper_profiles").select("*").order("submitted_at", { ascending: false }),
  ]);

  if (requestsRes.error) throw requestsRes.error;
  if (updatesRes.error) throw updatesRes.error;
  if (helpersRes.error) throw helpersRes.error;

  // קיבוץ עדכונים לפי בקשה
  const updatesByRequest: Record<string, RequestUpdate[]> = {};
  for (const row of updatesRes.data ?? []) {
    const upd = rowToUpdate(row);
    if (!updatesByRequest[upd.requestId]) updatesByRequest[upd.requestId] = [];
    updatesByRequest[upd.requestId].push(upd);
  }

  const requests: HelpRequest[] = (requestsRes.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as HelpRequest["category"],
    description: r.description,
    targetAudience: r.target_audience,
    when: r.when,
    status: r.status as HelpRequest["status"],
    urgency: r.urgency as HelpRequest["urgency"],
    helpersNeeded: r.helpers_needed,
    assignedHelperIds: (r.assigned_helper_ids as string[]) ?? [],
    volunteerIds: (r.volunteer_ids as string[]) ?? [],
    createdById: r.created_by_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    requiresStaffApproval: r.requires_staff_approval,
    contactPerson: r.contact_person,
    approvalStatus: r.approval_status as HelpRequest["approvalStatus"],
    adminNote: r.admin_note ?? undefined,
    updates: updatesByRequest[r.id] ?? [],
  }));

  return {
    requests,
    helperProfiles: (helpersRes.data ?? []).map(rowToHelper),
  };
}
