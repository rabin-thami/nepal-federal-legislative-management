import type { Metadata } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mukta = Mukta({
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thami Dictionary",
  description:
    "A comprehensive Thami-English dictionary built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mukta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}