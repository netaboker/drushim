import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="page-container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              ט
            </div>
            <span className="font-semibold text-gray-700">לוח טוביהו</span>
            <span>—</span>
            <span>קהילה שמסייעת לעצמה</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/requests" className="hover:text-gray-700 transition-colors">
              לוח בקשות
            </Link>
            <Link href="/helpers" className="hover:text-gray-700 transition-colors">
              עוזרים
            </Link>
            <Link href="/rankings" className="hover:text-gray-700 transition-colors">
              דרגות
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <span>נבנה באהבה</span>
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>לקהילת בית הספר</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
