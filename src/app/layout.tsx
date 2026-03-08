import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panic OS - Agent Command Center",
  description: "Multi-agent orchestration dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
