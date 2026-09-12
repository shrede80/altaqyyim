import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ui/theme-script";
import { ToastProvider } from "@/components/ui/toast";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "التقييم — منصة تحكيم المسابقات",
  description: "منصة إدارة تحكيم المسابقات في الأندية والملتقيات الشبابية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="ar" className={`${tajawal.variable} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
