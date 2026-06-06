"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import useSWR from "swr";
import { User, UserRole } from "@/lib/types";
import { fetchUsers, rowToUser } from "@/lib/supabase/fetchers";
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


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState(CURRENT_USER_ID);

  // SWR — cache משותף עם "users", לא מרענן מחדש בכל navigation
  const { data: fetchedUsers, isLoading } = useSWR("users", fetchUsers);

  // Fallback למock data בזמן טעינה
  const allUsers = (fetchedUsers && fetchedUsers.length > 0) ? fetchedUsers : MOCK_USERS;

  // Always has a fallback so currentUser is never null
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
        loading: isLoading,
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
