"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { RequestCategory, RequestStatus } from "@/lib/types";
import RequestCard from "@/components/requests/RequestCard";
import RequestFilters from "@/components/requests/RequestFilters";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

export default function RequestsPage() {
  const { currentUser, canModerate } = useAuth();
  const { requests, volunteerForRequest } = useAppData();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | "הכל">("הכל");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "הכל">("הכל");

  // Show only approved requests to regular users; admins/staff see all
  const visible = requests.filter((r) => {
    if (!canModerate && r.approvalStatus !== "approved") return false;
    return true;
  });

  const filtered = visible.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.includes(search) ||
      r.description.includes(search) ||
      r.category.includes(search);
    const matchesCat = selectedCategory === "הכל" || r.category === selectedCategory;
    const matchesStatus = selectedStatus === "הכל" || r.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const openCount = visible.filter((r) => r.status === "פתוח").length;
  const inProgressCount = visible.filter((r) => r.status === "בטיפול").length;
  const doneCount = visible.filter((r) => r.status === "הושלם").length;

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* כותרת */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-gray-900">🙋 מי צריך עזרה?</h1>
        <div className="flex gap-3 mt-2 text-sm">
          <span className="text-green-600 font-bold">{openCount} פתוחות</span>
          <span className="text-blue-600 font-bold">{inProgressCount} בטיפול</span>
          <span className="text-gray-400">{doneCount} הושלמו</span>
        </div>
      </div>

      {/* פילטרים */}
      <div className="mb-5">
        <RequestFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">לא נמצאו בקשות מתאימות</p>
          <Link href="/requests/new" className="btn-primary mt-4 inline-flex">
            פרסם/י בקשה חדשה
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">מציג {filtered.length} מתוך {visible.length} בקשות</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
