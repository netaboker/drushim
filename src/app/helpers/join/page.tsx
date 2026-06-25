"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, HandHelping, Star, Check, Clock, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { RequestCategory, CATEGORY_ICONS } from "@/lib/types";

const CATEGORIES: RequestCategory[] = [
  "לימודי", "טכני", "חברתי", "ארגוני", "יצירתי", "אירועים בית ספריים", "קהילתי",
];

const SKILL_SUGGESTIONS = [
  "מתמטיקה", "אנגלית", "עברית", "פיזיקה", "כימיה", "ביולוגיה",
  "היסטוריה", "גיאוגרפיה", "תכנות", "עיצוב גרפי", "צילום",
  "מוסיקה", "ספורט", "אמנות", "כתיבה יוצרת", "PowerPoint",
  "Canva", "וידאו", "חיבור אנשים", "ארגון אירועים",
];

const AVAILABILITY_OPTIONS = [
  "ימי א' בצהריים", "ימי ב' בצהריים", "ימי ג' בצהריים",
  "ימי ד' בצהריים", "ימי ה' בצהריים", "הפסקה גדולה",
  "אחרי שיעורים (לפי תיאום)", "סופי שבוע", "גמיש לפי תיאום",
];

export default function JoinHelperPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { submitHelperProfile } = useAppData();

  const [form, setForm] = useState({
    categories: [] as RequestCategory[],
    skills: [] as string[],
    customSkill: "",
    availability: [] as string[],
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function toggleCategory(c: RequestCategory) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter((x) => x !== c)
        : [...prev.categories, c],
    }));
  }

  function toggleSkill(s: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(s)
        ? prev.skills.filter((x) => x !== s)
        : [...prev.skills, s],
    }));
  }

  function addCustomSkill() {
    const s = form.customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s], customSkill: "" }));
    }
  }

  function toggleAvailability(a: string) {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(a)
        ? prev.availability.filter((x) => x !== a)
        : [...prev.availability, a],
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.categories.length === 0) e.categories = "נדרש לפחות תחום אחד";
    if (form.skills.length === 0) e.skills = "נדרש לפחות מיומנות אחת";
    if (form.availability.length === 0) e.availability = "נדרש לציין זמינות";
    if (!form.bio.trim() || form.bio.length < 20) e.bio = "נדרש תיאור של לפחות 20 תווים";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    await submitHelperProfile({
      userId: currentUser.id,
      categories: form.categories,
      skills: form.skills,
      availability: form.availability.join(", "),
      bio: form.bio,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page-container py-16 text-center animate-fade-in max-w-md mx-auto">
        <div className="card p-10">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock size={36} className="text-amber-500" />
            </div>
            <div className="absolute -top-1 -left-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
              <Bell size={13} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">פרופיל המומחה נשלח!</h2>
          <p className="text-gray-500 mb-5 leading-relaxed">
            לקחת יוזמה — כל הכבוד! הפרופיל שלך נשלח לאישור.
            לאחר האישור תופיע בין המומחים ותקבל/י <strong className="text-amber-600">+25 נקודות</strong>!
          </p>

          {/* Flow */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">ממתין לאישור מנחם</p>
                <p className="text-xs text-gray-500">מנחם הרצוג בוחן את הפרופיל</p>
              </div>
              <span className="mr-auto text-amber-500 font-bold text-sm">עכשיו</span>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">תקבל/י התראה</p>
                <p className="text-xs text-gray-500">עם תגובת מנחם הרצוג</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">+25 נקודות ופרסום</p>
                <p className="text-xs text-gray-500">הפרופיל יהיה גלוי לקהילה</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push("/helpers")} className="btn-primary flex-1">לרשימת המומחים</button>
            <button onClick={() => router.push("/")} className="btn-ghost">בית</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-2xl animate-fade-in">
      <Link href="/helpers" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowRight size={16} />
        חזרה למומחים
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <HandHelping size={24} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">הצטרף/י כמומחה</h1>
          <p className="text-gray-500 text-sm">קח/י יוזמה — שתף/י את הידע שלך עם הקהילה</p>
        </div>
      </div>

      {/* Approval notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex gap-3">
        <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">הפרופיל יישלח לאישור מנחם הרצוג</p>
          <p className="text-xs text-amber-600 mt-0.5">לאחר אישור — תופיע בלוח ותקבל/י +25 נקודות</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Star size={20} className="text-amber-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-900 text-sm">+25 נקודות לאחר אישור הפרופיל!</p>
          <p className="text-xs text-amber-700">ועוד +10 נקודות על כל התנדבות עתידית</p>
        </div>
      </div>

      {/* Current user */}
      <div className="card p-4 mb-6 flex items-center gap-3 bg-gray-50">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${currentUser.avatarColor}`}>
          {currentUser.avatarInitials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{currentUser.name}</p>
          <p className="text-xs text-gray-500">{currentUser.class ?? currentUser.position ?? "חבר/ת קהילה"}</p>
        </div>
        <span className="mr-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">✓ מחובר/ת</span>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-7">
        {/* Categories */}
        <div>
          <label className="label">תחומי מומחיות <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const selected = form.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-right transition-colors flex items-center gap-1.5 ${
                    selected ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-300"
                  }`}
                >
                  {selected && <Check size={14} className="flex-shrink-0 text-green-600" />}
                  <span>{CATEGORY_ICONS[c]}</span>
                  {c}
                </button>
              );
            })}
          </div>
          {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className="label">מיומנויות <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILL_SUGGESTIONS.map((s) => {
              const selected = form.skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    selected ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  }`}
                >
                  {selected && "✓ "}{s}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.customSkill}
              onChange={(e) => setForm((prev) => ({ ...prev, customSkill: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
              placeholder="הוסף/י מיומנות נוספת..."
              className="input-field flex-1"
            />
            <button type="button" onClick={addCustomSkill} className="btn-secondary flex-shrink-0 text-sm px-4">הוסף/י</button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => toggleSkill(s)} className="text-green-500 hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
          {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
        </div>

        {/* Availability */}
        <div>
          <label className="label">זמינות <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((a) => {
              const selected = form.availability.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAvailability(a)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {selected && "✓ "}{a}
                </button>
              );
            })}
          </div>
          {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}
        </div>

        {/* Bio */}
        <div>
          <label className="label" htmlFor="bio">כמה מילים עליך <span className="text-red-500">*</span></label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="ספר/י לקהילה מי אתה/את, מה היוזמה שלך, ואיך תוכל/י להשפיע..."
            className={`textarea-field h-28 ${errors.bio ? "border-red-400" : ""}`}
            maxLength={400}
          />
          <div className="flex justify-between">
            {errors.bio ? <p className="text-xs text-red-500">{errors.bio}</p> : <span />}
            <span className="text-xs text-gray-400">{form.bio.length}/400</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">🔒 הגנה על הפרטיות</p>
          <p>לא נחשוף את פרטי הקשר שלך. כל תקשורת תעבור דרך המערכת הפנימית.</p>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="submit" className="btn-primary flex-1">
            <HandHelping size={18} />
            שלח/י פרופיל מומחה לאישור
          </button>
          <Link href="/helpers" className="btn-ghost flex-shrink-0">ביטול</Link>
        </div>
      </form>
    </div>
  );
}
