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
  title: "Vidhan - Nepal Federal Legislative Management System",
  description:
    "Track bills through Nepal's parliament in real time. A comprehensive platform for legislative transparency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mukta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
