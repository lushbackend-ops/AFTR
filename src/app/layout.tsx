import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/wedding/scroll-to-top";
import { GlobalReadingProgressBar, FramingScrollLines } from "@/components/ui/scroll-lines";

export const metadata: Metadata = {
  title: "AFTR India — Sacred Sound Sanctuaries & Concurrency Ticketing",
  description: "Curated palace courtyards, desert dunes, and coastal soundscapes across Rajasthan, Goa, Bangalore, Mumbai, and Delhi. Zero overselling guaranteed.",
  keywords: ["Event Booking", "AFTR India", "Magnetic Fields", "Echoes of Earth", "Sunburn Goa", "Rajasthan", "Concurrency Ticketing"],
  authors: [{ name: "AFTR India Collective" }],
  openGraph: {
    title: "AFTR India — Sacred Sound Sanctuaries & Concurrency Ticketing",
    description: "Curated palace courtyards, desert dunes, and coastal soundscapes across India.",
    siteName: "AFTR India",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-theme-base text-theme-primary font-mincho selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <LenisProvider>
              <div className="paper-overlay" aria-hidden="true" />
              <GlobalReadingProgressBar />
              <FramingScrollLines />
              <Navbar />
              <main className="flex-1 w-full relative z-20">{children}</main>
              <Footer />
              <ScrollToTop />
            </LenisProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
