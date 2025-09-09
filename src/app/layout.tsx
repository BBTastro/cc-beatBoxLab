import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EmailValidator } from "@/components/auth/email-validator";
import { GlobalChatbot } from "@/components/global-chatbot";
import { UserTrackingProvider } from "@/components/user-tracking-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "stepBox - Goal Tracking",
  description:
    "Transform daily work into visible momentum through a simple beat-tracking interface where users tap days, log their work, maintain streaks, and celebrate progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EmailValidator>
            <UserTrackingProvider>
              <SiteHeader />
              <main className="pb-16">
                {children}
              </main>
              <SiteFooter />
              <GlobalChatbot />
            </UserTrackingProvider>
          </EmailValidator>
        </ThemeProvider>
      </body>
    </html>
  );
}
