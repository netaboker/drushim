"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { MOCK_USERS, CURRENT_USER_ID } from "@/lib/mock-data";

interface AuthContextValue {
  currentUser: User;
  loading: boolean;
  setCurrentUserId: (id: string) => void;
  allUsers: User[];
  isAdmin: boolean;
  isStaff: boolean;
  isTeacher: boolean;
  canModerate: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function rowToUser(row: Record<string, unknown>): User {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with mock data so UI is never empty while Supabase loads
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [currentUserId, setCurrentUserId] = useState(CURRENT_USER_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && data && data.length > 0) {
        setAllUsers(data.map(rowToUser));
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Always has a fallback (mock data) so currentUser is never null
  const currentUser = allUsers.find((u) => u.id === currentUserId) ?? allUsers[0];

  const isAdmin = currentUser?.role === "admin";
  const isStaff = currentUser?.role === "staff";
  const isTeacher = currentUser?.role === "teacher";
  const canModerate = isAdmin || isStaff || isTeacher;

  const handleSetUser = useCallback((id: string) => {
    setCurrentUserId(id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        setCurrentUserId: handleSetUser,
        allUsers,
        isAdmin,
        isStaff,
        isTeacher,
        canModerate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
