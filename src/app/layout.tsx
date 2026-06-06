import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "לוח טוביהו – לוח הדרושים הבית ספרי",
  description:
    "פלטפורמה קהילתית לתמיכה הדדית בקהילת בית הספר טוביהו. מחפשים עזרה? רוצים לעזור? כאן הכתובת.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50">
        <AuthProvider>
          <AppDataProvider>
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            <Footer className="hidden lg:block" />
            <BottomNav />
          </AppDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
