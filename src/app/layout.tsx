import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AFCR Seguridad — Cámaras y Sistemas de Videovigilancia",
    template: "%s | AFCR Seguridad",
  },
  description:
    "Especialistas en sistemas de videovigilancia. Cámaras IP, domo, PTZ, NVR/DVR y accesorios de las mejores marcas: Hikvision, Dahua, Axis, Reolink y más.",
  keywords: [
    "cámaras de seguridad",
    "videovigilancia",
    "CCTV",
    "Hikvision",
    "Dahua",
    "cámaras IP",
    "NVR",
    "seguridad electrónica",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "AFCR Seguridad",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#0F172A] text-white`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
