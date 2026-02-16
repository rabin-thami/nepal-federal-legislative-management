import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "संसद | Federal Parliament of Nepal — Legislative Management System",
  description: "Secure, workflow-driven, AI-assisted digital governance platform for managing the full lifecycle of legislative bills in Nepal's Federal Parliament.",
  keywords: ["Nepal", "Parliament", "Legislature", "Bills", "Legislation", "Digital Governance"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
