import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Campus Market Admin",
  description: "Administration Campus Market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <ErrorBoundary>
          {children}
          <ToasterProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
