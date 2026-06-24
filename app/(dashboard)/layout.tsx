import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "@/app/globals.css";
import { getProfileAction, getTradesAction } from "@/app/actions/trade";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { TradeProvider } from "@/components/providers/TradeProvider";
import { Toaster } from "@/components/ui/sonner";
import { BRAND } from "@/lib/data";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} – ${BRAND.tagline}`,
  description: `Analyze your trading performance with ${BRAND.name}. Track P&L, win rates, and improve your strategy with AI-powered insights.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <html
        lang="en"
        className={cn("h-full antialiased", inter.variable, geistMono.variable)}
        suppressHydrationWarning
      >
        <body className="min-h-full flex" suppressHydrationWarning>
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    );
  }

  const _trades = await getTradesAction();
  const profile = await getProfileAction();

  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex" suppressHydrationWarning>
        <TradeProvider>
          <div className="flex h-screen w-full overflow-hidden bg-[var(--tz-bg-page)]">
            <div className="hidden md:flex h-full flex-shrink-0">
              <Sidebar />
            </div>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <TopBar />
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
          </div>
        </TradeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
