import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeZella – Trading Journal & Performance Analytics",
  description:
    "Analyze your trading performance with TradeZella. Track P&L, win rates, and improve your strategy with AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", inter.variable, geistMono.variable)}
    >
      <body className="min-h-full flex">
        <div
          className="flex h-screen w-full overflow-hidden"
          style={{ background: "#f4f6fb" }}
        >
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
