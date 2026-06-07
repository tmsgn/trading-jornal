import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ApexTrade | Professional Trading Journal",
  description: "Advanced analytics and journaling for professional traders.",
};

import { AppearanceProvider } from "@/components/providers/AppearanceProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`min-h-full flex ${inter.className} layout-comfortable`}>
        <AppearanceProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AppearanceProvider>
      </body>
    </html>
  );
}
