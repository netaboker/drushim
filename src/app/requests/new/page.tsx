"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Send, Info, Megaphone, Clock, Bell, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { RequestCategory, UrgencyLevel, GradeLevel, CATEGORY_ICONS, GRADE_LEVELS } from "@/lib/types";

const STAFF_ROLES = new Set(["teacher", "staff", "admin"]);

const CATEGORIES: RequestCategory[] = [
  "לימודי", "טכני", "חברתי", "ארגוני", "יצירתי", "אירועים בית ספריים", "קהילתי",
];
const URGENCY_LEVELS: UrgencyLevel[] = ["נמוכה", "בינונית", "גבוהה", "דחוף"];
const TARGET_OPTIONS = [
  "תלמידים בלבד", "מורים בלבד", "תלמידים ומורים", "כלל הצוות", "כלל הקהילה",
];
const HELPERS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];
const ALL_GRADES = [...GRADE_LEVELS];

export default function NewRequestPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { submitRequest } = useAppData();

  // תלמידים לא יכולים לפרסם בקשות
  if (currentUser && currentUser.role === "student") {
    return (
      <div className="page-container py-20 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">אין גישה</h1>
        <p className="text-gray-500 mb-6">
          כרגע רק מורים יכולים לפרסם בקשות לעזרה.
          <br />
          תוכל/י להתנדב לבקשות קיימות!
        </p>
        <Link href="/requests" className="btn-primary">
          לראות בקשות לעזרה
        </Link>
      </div>
    );
  }

  const [form, setForm] = useState({
    title: "",
    category: "" as RequestCategory | "",
    description: "",
    targetAudience: "",
    targetGrades: [] as GradeLevel[], // ריק = כל השכבות
    when: "",
    helpersNeeded: 1,
    urgency: "בינונית" as UrgencyLevel,
    requiresStaffApproval: false,
    contactPerson: currentUser?.name ?? "",
  });

  function toggleGrade(grade: GradeLevel) {
    setForm((prev) => ({
      ...prev,
      targetGrades: prev.targetGrades.includes(grade)
        ? prev.targetGrades.filter((g) => g !== grade)
        : [...prev.targetGrades, grade],
    }));
  }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaffUser = STAFF_ROLES.has(currentUser?.role ?? "");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "נדרש כותרת";
    if (!form.category) e.category = "נדרש לבחור קטגוריה";
    if (!form.description.trim() || form.description.length < 20)
      e.description = "נדרש תיאור של לפחות 20 תווים";
    if (!form.targetAudience) e.targetAudience = "נדרש לבחור קהל יעד";
    if (!form.when.trim()) e.when = "נדרש לציין מתי";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newId = await submitRequest({
        title: form.title,
        category: form.category as RequestCategory,
        description: form.description,
        targetAudience: form.targetAudience,
        targetGrades: form.targetGrades,
        when: form.when,
        helpersNeeded: form.helpersNeeded,
        urgency: form.urgency,
        requiresStaffApproval: form.requiresStaffApproval,
        contactPerson: form.contactPerson,
        createdById: currentUser.id,
      }, currentUser.role);
      setSubmittedRequestId(newId);
      setSubmitted(true);
    } catch (err) {
      setSubmitError("שגיאה בשמירת הבקשה. אנא נסה/י שנית.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  if (submitted) {
    // ── Staff/teacher/admin: auto-published immediately ────────────────────────
    if (isStaffUser) {
      return (
        <div className="page-container py-16 text-center animate-fade-in max-w-md mx-auto">
          <div className="card p-10">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div className="absolute -top-1 -left-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">הבקשה פורסמה! 🎉</h2>
            <p className="text-gray-500 mb-5 leading-relaxed">
              כחלק מהצוות, הבקשה שלך פורסמה מיידית ללוח הקהילה.
              תלמידים יכולים להתנדב כבר עכשיו.
            </p>

            {/* Success summary */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-right space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">פורסם אוטומטית</p>
                  <p className="text-xs text-green-600">בקשות צוות אינן זקוקות לאישור</p>
                </div>
                <span className="mr-auto text-green-600 font-bold text-sm">✓</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Megaphone size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">גלוי לכל הקהילה</p>
                  <p className="text-xs text-green-600">תלמידים יכולים להירשם לעזרה מיידית</p>
                </div>
                <span className="mr-auto text-green-600 font-bold text-sm">✓</span>
              </div>
            </div>

            <div className="flex gap-3">
              {submittedRequestId && (
                <button
                  onClick={() => router.push(`/requests/${submittedRequestId}`)}
                  className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 size={16} />
                  צפה/י בבקשה
                </button>
              )}
              <button onClick={() => router.push("/requests")} className={submittedRequestId ? "btn-ghost" : "btn-primary flex-1"}>
                לוח הבקשות
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── Student: pending admin approval ───────────────────────────────────────
    return (
      <div className="page-container py-16 text-center animate-fade-in max-w-md mx-auto">
        <div className="card p-10">
          {/* Pending state illustration */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock size={36} className="text-amber-500" />
            </div>
            <div className="absolute -top-1 -left-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
              <Bell size={13} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">הבקשה נשלחה!</h2>
          <p className="text-gray-500 mb-5 leading-relaxed">
            הבקשה שלך נשלחה למנחם הרצוג לאישור.
            ברגע שיאשר — היא תפורסם בלוח ותקבל/י התראה.
          </p>

          {/* Flow visualization */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">ממתין לאישור</p>
                <p className="text-xs text-gray-500">מנחם הרצוג בוחן את הבקשה</p>
              </div>
              <span className="mr-auto text-amber-500 font-bold text-sm">עכשיו</span>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">תקבל/י התראה</p>
                <p className="text-xs text-gray-500">כשיתקבל אישור (או דחייה עם הסבר)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Megaphone size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">פרסום בלוח</p>
                <p className="text-xs text-gray-500">הבקשה תהיה גלויה לכל הקהילה</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push("/requests")} className="btn-primary flex-1">
              לוח הבקשות
            </button>
            <button onClick={() => router.push("/")} className="btn-ghost">
              בית
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-2xl animate-fade-in">
      <Link href="/requests" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowRight size={16} />
        חזרה ללוח הבקשות
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isStaffUser ? "bg-green-100" : "bg-blue-100"}`}>
          {isStaffUser
            ? <ShieldCheck size={24} className="text-green-600" />
            : <Megaphone size={24} className="text-blue-600" />
          }
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">פרסום בקשת עזרה</h1>
          <p className="text-gray-500 text-sm">
            {isStaffUser ? "הבקשה תפורסם מיידית ללוח הקהילה" : "ספר/י לנו במה אתה/את צריך/ה עזרה"}
          </p>
        </div>
      </div>

      {/* Notice — differs by role */}
      {isStaffUser ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex gap-3">
          <Zap size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">הבקשה תפורסם מיידית</p>
            <p className="text-xs text-green-700 mt-0.5">
              כחלק מהצוות, הבקשות שלך מתפרסמות אוטומטית ללא צורך באישור מנחם הרצוג.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">הבקשה תעבור לאישור מנחם הרצוג</p>
            <p className="text-xs text-amber-600 mt-0.5">
              לאחר הגשה, מנחם הרצוג יבחן את הבקשה ויאשר או ידחה.
              תקבל/י התראה עם תגובתו בהקדם.
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          הבקשה תוצג לכל חברי הקהילה לאחר פרסום. אל תציין מידע אישי רגיש.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="label" htmlFor="title">
            כותרת הבקשה <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="למשל: עזרה בהכנה לבגרות במתמטיקה"
            className={`input-field ${errors.title ? "border-red-400" : ""}`}
            maxLength={100}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">קטגוריה <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("category", c)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-right transition-colors flex items-center gap-1.5 ${
                  form.category === c
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-blue-300"
                }`}
              >
                <span>{CATEGORY_ICONS[c]}</span>
                {c}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="description">
            תיאור הבקשה <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="ספר/י בפירוט במה אתה/את צריך/ה עזרה..."
            className={`textarea-field h-28 ${errors.description ? "border-red-400" : ""}`}
            maxLength={600}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <span className="text-xs text-gray-400">{form.description.length}/600</span>
          </div>
        </div>

        {/* Target + When */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="target">למי מיועדת <span className="text-red-500">*</span></label>
            <select
              id="target"
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              className={`select-field ${errors.targetAudience ? "border-red-400" : ""}`}
            >
              <option value="">בחר/י...</option>
              {TARGET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.targetAudience && <p className="text-xs text-red-500 mt-1">{errors.targetAudience}</p>}
          </div>
          <div>
            <label className="label" htmlFor="when">מתי צריך <span className="text-red-500">*</span></label>
            <input
              id="when"
              type="text"
              value={form.when}
              onChange={(e) => set("when", e.target.value)}
              placeholder="למשל: ינואר 2025, כשבועיים"
              className={`input-field ${errors.when ? "border-red-400" : ""}`}
            />
            {errors.when && <p className="text-xs text-red-500 mt-1">{errors.when}</p>}
          </div>
        </div>

        {/* שכבות */}
        <div>
          <label className="label">
            לאיזה שכבות?
            <span className="text-gray-400 font-normal mr-1">(לא מסמן = כל השכבות)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {ALL_GRADES.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => toggleGrade(grade)}
                className={`px-4 py-2 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  form.targetGrades.includes(grade)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                שכבה {grade}
              </button>
            ))}
          </div>
          {form.targetGrades.length > 0 && (
            <p className="text-xs text-indigo-600 font-medium mt-2">
              ✓ מיועד לשכבות: {form.targetGrades.map((g) => `שכבה ${g}`).join(", ")}
            </p>
          )}
          {form.targetGrades.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">מיועד לכל השכבות</p>
          )}
        </div>

        {/* Helpers + Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">כמות עוזרים נדרשת</label>
            <div className="flex gap-2 flex-wrap">
              {HELPERS_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("helpersNeeded", n)}
                  className={`w-10 h-10 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    form.helpersNeeded === n
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">רמת דחיפות</label>
            <div className="flex flex-col gap-1.5">
              {URGENCY_LEVELS.map((u) => {
                const icons: Record<UrgencyLevel, string> = { נמוכה: "🟢", בינונית: "🟡", גבוהה: "🟠", דחוף: "🔴" };
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => set("urgency", u)}
                    className={`px-3 py-2 rounded-xl border-2 text-sm font-medium text-right transition-colors flex items-center gap-1.5 ${
                      form.urgency === u
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {icons[u]} {u}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Staff approval */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
          <input
            id="staffApproval"
            type="checkbox"
            checked={form.requiresStaffApproval}
            onChange={(e) => set("requiresStaffApproval", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-600"
          />
          <div>
            <label htmlFor="staffApproval" className="text-sm font-semibold text-gray-700 cursor-pointer">
              בקשה רגישה — צריכה טיפול מיוחד
            </label>
            <p className="text-xs text-gray-500 mt-0.5">סמן/י אם הבקשה דורשת קשב מיוחד מהצוות</p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="label" htmlFor="contact">איש קשר</label>
          <input
            id="contact"
            type="text"
            value={form.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">שם בלבד — תקשורת תהיה דרך המערכת הפנימית</p>
        </div>

        {/* Submit */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium">
            ⚠️ {submitError}
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed ${isStaffUser ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isStaffUser ? <Zap size={18} /> : <Send size={18} />}
            {isSubmitting ? "שומר..." : isStaffUser ? "פרסם/י מיידית" : "שלח/י לאישור מנחם הרצוג"}
          </button>
          <Link href="/requests" className="btn-ghost flex-shrink-0">ביטול</Link>
        </div>
      </form>
    </div>
  );
}
