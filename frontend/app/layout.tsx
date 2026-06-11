import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPU Checklist - Cleaning Made Simple",
  description: "Easy-to-use cleaning checklist app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
