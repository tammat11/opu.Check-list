import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPU Work - Cleaning Tasks",
  description: "Cleaner interface for managing cleaning tasks",
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
