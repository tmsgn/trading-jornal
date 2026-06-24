import "@/app/globals.css";
import { Toaster } from "sonner";

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
      <body className="min-h-full flex font-sans layout-comfortable">
        <AppearanceProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AppearanceProvider>
      </body>
    </html>
  );
}
