import type { Metadata } from "next";
import "./globals.css";
import PushBootstrap from "./components/PushBootstrap";

export const metadata: Metadata = {
  title: "OPU Check-list - IC Group",
  description: "Система управления уборкой от IC Group",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#7EC850" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-white">
        <PushBootstrap />
        {children}
      </body>
    </html>
  );
}
