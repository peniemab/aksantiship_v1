import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aksantiship : portail de bourses d'études",
  description:
    "Aksantiship t'accompagne pas à pas dans la recherche d'une opportunité pour financer tes études à l'international.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
