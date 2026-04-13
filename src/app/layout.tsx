import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { clinicUltrasoundScansContent } from "@/content/clinicUltrasoundScans";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const { site, brand, seo } = clinicUltrasoundScansContent;

export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalBaseUrl),
  title: {
    default: `${brand.name} | Clinic Ultrasound Scans`,
    template: `%s | ${brand.name}`,
  },
  description: seo.defaultDescription,
  icons: {
    icon: "/site-icon.png",
    shortcut: "/site-icon.png",
    apple: "/site-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${cormorant.variable} antialiased`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
