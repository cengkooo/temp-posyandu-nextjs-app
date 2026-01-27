import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "@/styles/landing.css";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Posyandu Sehat Mandiri - Melayani dengan Hati",
  description: "Posyandu Sehat Mandiri melayani kesehatan keluarga Indonesia sejak 2010. Layanan imunisasi, penimbangan balita, pemeriksaan ibu hamil, KB, dan konseling gizi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
